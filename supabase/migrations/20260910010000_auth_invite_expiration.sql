-- Migration: Auth — invitation expiration + invite renewal
--
-- Forward-fix for 20260909010000 + 20260909020000.  Previously a pending
-- invite never expired, allowing old invite links to remain valid indefinitely.
--
-- Changes:
--   1. Adds expires_at to allowed_admin_emails (NULL = unexpired for
--      pre-existing rows; the client always sets it on new invites).
--   2. handle_new_user() now also requires the invite to be unexpired when
--      creating a profile.
--   3. Re-runnable: CREATE OR REPLACE for the function, drop-before-create
--      for the trigger.
--
-- Client-side enforcement (AdminsPage):
--   * New invites default to 7-day expiration.
--   * Owner can renew expired invites.

alter table public.allowed_admin_emails
  add column if not exists expires_at timestamp with time zone;

-- 2. Signup gate (identical to 20260909020000 except adds expires_at check)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(coalesce(new.email, new.raw_user_meta_data ->> 'email', ''));
  v_owner_email text;
  v_display text := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(v_email, '@', 1)
  );
  v_username text;
  v_allowed uuid;
begin
  if v_email = '' then
    return new;
  end if;

  select value into v_owner_email from public.platform_config where key = 'owner_email';

  -- Platform owner bootstrap: exactly one immutable owner account.
  if v_email = lower(v_owner_email) then
    v_username := public.make_username(v_email);
    insert into public.profiles (id, username, email, role, full_name, last_login_at)
    values (new.id, v_username, v_email, 'owner', nullif(v_display, ''), new.last_sign_in_at)
    on conflict (id) do update
      set email = excluded.email,
          full_name = coalesce(excluded.full_name, public.profiles.full_name),
          last_login_at = coalesce(excluded.last_login_at, public.profiles.last_login_at);
    insert into public.platform_config (key, value)
    values ('owner_uid', new.id::text)
    on conflict (key) do nothing;
    return new;
  end if;

  -- Invite allowlist: only a PENDING, UNEXPIRED invite may create an admin.
  select a.id into v_allowed
  from public.allowed_admin_emails a
  where a.email = v_email
    and a.status = 'pending'
    and (a.expires_at is null or a.expires_at > now())
  limit 1;

  if v_allowed is not null then
    v_username := public.make_username(v_email);
    insert into public.profiles (id, username, email, role, full_name, last_login_at)
    values (new.id, v_username, v_email, 'admin', nullif(v_display, ''), new.last_sign_in_at);
    update public.allowed_admin_emails
    set status = 'used', used_at = now(), used_by = new.id
    where id = v_allowed;
    return new;
  end if;

  -- Everything else: blocked at the database level.
  raise exception 'Databaza/platform ruxsatisiz kirish bloklandi (auth gate)';
end
$$;

drop trigger if exists handle_new_user_trg on auth.users;
create trigger handle_new_user_trg
  after insert on auth.users
  for each row execute function public.handle_new_user();

comment on column public.allowed_admin_emails.expires_at is 'Timestamp after which a pending invite is no longer accepted by the signup gate trigger. NULL = no expiry (legacy rows).';