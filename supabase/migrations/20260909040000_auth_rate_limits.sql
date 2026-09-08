-- Migration: Auth — Rate limiting
-- Rolling-window attempt limiter for login, OTP, password reset, registration
-- and resend-code. Works pre-login (anon) because the RPCs are granted to anon.
--
-- Design: client asks rpc_auth_try_attempt(bucket) BEFORE an auth action and
-- rpc_auth_record_attempt(bucket) AFTER it. The window rows are append-only
-- (cheap to insert, indexed, purged by the rolling window itself). This is a
-- defense-in-depth layer; Supabase Auth's built-in endpoint throttling in the
-- dashboard is the other (outer) layer.

create table if not exists public.auth_rate_limits (
  id bigserial primary key,
  bucket text not null,
  ip text not null default '',
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_auth_rate_limits_bucket on public.auth_rate_limits(bucket, ip, created_at);

alter table public.auth_rate_limits enable row level security;

-- No direct client access at all; only the SECURITY DEFINER RPCs touch it.
revoke all on public.auth_rate_limits from anon, authenticated;

-- true  => caller may proceed
-- false => caller is rate limited; retry_after holds seconds to wait
create or replace function public.rpc_auth_try_attempt(
  p_bucket text,
  p_window_seconds int default 300,
  p_max int default 5
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip text := coalesce(nullif(inet_client_addr()::text, ''), 'local');
  v_count int;
  v_retry double precision;
  v_window int := least(greatest(coalesce(p_window_seconds, 300), 10), 86400);
begin
  if coalesce(p_bucket, '') = '' then
    return jsonb_build_object('ok', false, 'retry_after', 60);
  end if;
  select count(*) into v_count
  from public.auth_rate_limits
  where bucket = p_bucket and ip = v_ip
    and created_at > now() - make_interval(secs => v_window);

  if v_count >= greatest(coalesce(p_max, 5), 1) then
    select extract(epoch from max(created_at) + make_interval(secs => v_window) - now())
    into v_retry
    from public.auth_rate_limits
    where bucket = p_bucket and ip = v_ip
      and created_at > now() - make_interval(secs => v_window);
    return jsonb_build_object('ok', false, 'retry_after', greatest(v_retry, 0)::int);
  end if;
  return jsonb_build_object('ok', true, 'retry_after', 0);
end
$$;

-- Records one attempt (call only after rpc_auth_try_attempt returned ok).
create or replace function public.rpc_auth_record_attempt(p_bucket text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip text := coalesce(nullif(inet_client_addr()::text, ''), 'local');
begin
  insert into public.auth_rate_limits (bucket, ip)
  values (coalesce(p_bucket, 'bogus'), v_ip);
end
$$;

grant execute on function public.rpc_auth_try_attempt(text, int, int) to anon, authenticated, service_role;
grant execute on function public.rpc_auth_record_attempt(text) to anon, authenticated, service_role;

comment on table public.auth_rate_limits is
  'Rolling-window rate-limit attempts. Written only by the SECURITY DEFINER RPCs; both RPCs are granted to anon so OTP/reset are protected pre-login.';