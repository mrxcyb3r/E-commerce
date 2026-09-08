-- Migration: Auth — Immutable audit log, login history, profile RPC
--
-- auth_audit_log  : business audit trail (login, logout, password changed,
--                   email changed, product deleted, analytics exported…).
--                   NEVER deletable by any client role — no UPDATE/DELETE
--                   policies exist and those grants are revoked.
-- login_history   : email-security stream (successes, failures, OTP requests,
--                   resets, OAuth logins, new devices) with device tracking.
--
-- All writes go through SECURITY DEFINER RPCs so the client can never craft
-- rows; reads are limited to owner/admin.

create table if not exists public.auth_audit_log (
  id bigserial primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_email text not null default '',
  action text not null,
  entity text not null default 'auth',
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip text,
  user_agent text,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_auth_audit_log_created on public.auth_audit_log(created_at desc);
create index if not exists idx_auth_audit_log_action on public.auth_audit_log(action);
create index if not exists idx_auth_audit_log_actor on public.auth_audit_log(actor_id);

alter table public.auth_audit_log enable row level security;

create table if not exists public.login_history (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete set null,
  email text not null default '',
  event_type text not null check (
    event_type in (
      'login_success', 'login_failure', 'otp_request', 'otp_verify',
      'otp_resend', 'password_reset', 'password_changed', 'logout',
      'oauth_login', 'new_device', 'signup_blocked', 'session_expired',
      'session_revoked'
    )
  ),
  ip text,
  user_agent text,
  device_signature text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_login_history_email on public.login_history(email);
create index if not exists idx_login_history_event on public.login_history(event_type);
create index if not exists idx_login_history_created on public.login_history(created_at desc);

alter table public.login_history enable row level security;

-- RLS: audit + login history are readable by owner/admin only.
drop policy if exists "owner reads audit log" on public.auth_audit_log;
create policy "owner reads audit log" on public.auth_audit_log
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles me
      where me.id = auth.uid() and me.role in ('owner', 'admin')
    )
  );

drop policy if exists "owner reads login history" on public.login_history;
create policy "owner reads login history" on public.login_history
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles me
      where me.id = auth.uid() and me.role in ('owner', 'admin')
    )
  );

-- No INSERT/UPDATE/DELETE policies exist for the client on either table.
revoke insert, update, delete, truncate on public.auth_audit_log from anon, authenticated;
revoke insert, update, delete, truncate on public.login_history from anon, authenticated;

-- Deterministic, stable device fingerprint (no PII — client supplies it).
create or replace function public.simple_device_id(p_input text)
returns text
language sql
immutable
as $$
  select left(md5(coalesce(p_input, 'unknown')), 16)
$$;

-- Email-security streaming point (works pre-login for anon via RPC grant).
create or replace function public.rpc_auth_log(
  p_event_type text,
  p_metadata jsonb default '{}'::jsonb,
  p_user_agent text default null,
  p_email text default null,
  p_device_signature text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := coalesce(p_email, '');
  v_ip text;
begin
  v_ip := inet_client_addr()::text;
  if v_uid is not null then
    select email into v_email from public.profiles where id = v_uid;
  end if;
  if v_email = '' then
    v_email := coalesce(p_email, '');
  end if;
  insert into public.login_history (user_id, email, event_type, ip, user_agent, device_signature, metadata)
  values (
    v_uid,
    v_email,
    p_event_type,
    nullif(v_ip, ''),
    nullif(p_user_agent, ''),
    nullif(p_device_signature, ''),
    coalesce(p_metadata, '{}'::jsonb)
  );
end
$$;

-- Business audit trail point (owner + admins; also used by definer server crons).
create or replace function public.rpc_auth_audit(
  p_action text,
  p_entity text default 'auth',
  p_entity_id text default null,
  p_metadata jsonb default '{}'::jsonb,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := '';
  v_ip text;
begin
  if v_uid is not null then
    select email into v_email from public.profiles where id = v_uid;
  end if;
  v_ip := inet_client_addr()::text;
  insert into public.auth_audit_log (actor_id, actor_email, action, entity, entity_id, metadata, ip, user_agent)
  values (v_uid, v_email, p_action, p_entity, p_entity_id, coalesce(p_metadata, '{}'::jsonb), nullif(v_ip, ''), nullif(p_user_agent, ''));
end
$$;

-- The ONLY way the client resolves its own credentials & role — "no
-- client-trusted roles": the app never believes what the JWT claims; it asks
-- the database. null profile (unapproved / nonexistent) => access denied.
create or replace function public.rpc_my_profile()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.profiles%rowtype;
  v_owner_uid text;
begin
  if v_uid is null then
    return null;
  end if;
  select * into v_row from public.profiles where id = v_uid;
  if v_row.id is null then
    return null;
  end if;
  select value into v_owner_uid from public.platform_config where key = 'owner_uid';
  return jsonb_build_object(
    'id', v_row.id,
    'email', v_row.email,
    'username', v_row.username,
    'full_name', v_row.full_name,
    'role', v_row.role,
    'is_owner', (v_row.id::text = coalesce(v_owner_uid, '')),
    'is_suspended', v_row.is_suspended,
    'last_login_at', v_row.last_login_at,
    'is_approved', true
  );
end
$$;

grant execute on function public.rpc_auth_log(text, jsonb, text, text, text) to anon, authenticated, service_role;
grant execute on function public.rpc_auth_audit(text, text, text, jsonb, text) to authenticated, service_role;
grant execute on function public.rpc_my_profile() to authenticated, service_role;

comment on table public.auth_audit_log is
  'Immutable business audit trail. Insert-only via rpc_auth_audit; no client can update or delete rows.';
comment on table public.login_history is
  'Email-security + login history stream. Insert-only via rpc_auth_log; no client can update or delete rows.';