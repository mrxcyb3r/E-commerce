-- Migration: Auth — Profile hardening, owner immutability, signup gate
--
-- 1. Widens the profiles.role CHECK so future Manager/Staff/Support roles map
--    onto the existing permission layer without a schema rewrite.
-- 2. Denormalizes email + staff flags onto profiles (auth.users is not
--    queryable by the client; the admin member directory needs emails).
-- 3. Closes the role-escalation hole: the old "Profiles manage own role"
--    policy (any authenticated user could set their own role = 'owner') is
--    removed. Role changes now require the owner, and RLS cannot grant 'owner'.
-- 4. Enforces owner immutability IN THE DATABASE:
--      - owner rows cannot be deleted
--      - owner cannot be demoted or suspended
--      - platform_config.owner_uid cannot be changed after first login
-- 5. No open registration: handle_new_user() (trigger on auth.users) creates a
--    profile only for the owner email or a pending allowlisted invite; any
--    other signup raises and rolls back — registration is blocked.

-- ---- 1. Email + staff columns -----------------------------------------------
alter table public.profiles
  add column if not exists email text not null default '';

alter table public.profiles
  add column if not exists is_suspended boolean not null default false;

alter table public.profiles
  add column if not exists last_login_at timestamp with time zone;

-- Backfill email for existing profiles (migrations run as postgres, auth schema
-- is readable here even though it is hidden from PostgREST at runtime).
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and (p.email is null or p.email = '');

-- ---- 2. Widened roles -------------------------------------------------------
alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (
    role in ('owner', 'admin', 'editor', 'viewer', 'manager', 'staff', 'support')
  );

-- ---- 3. Deterministic username generator -----------------------------------
create or replace function public.make_username(p_email text)
returns text
language sql
immutable
as $$
  select lower(substring(split_part(p_email, '@', 1) from 1 for 40) || '_' || left(md5(p_email), 8))
$$;

-- ---- 4. Owner immutability triggers -----------------------------------------
create or replace function public.protect_owner_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Postgres (migrations + the SECURITY DEFINER signup gate) may maintain
  -- owner rows; RLS-authenticated roles may not.
  if current_user = 'postgres' then
    return coalesce(new, old);
  end if;

  if tg_op = 'DELETE' and old.role = 'owner' then
    raise exception 'Platform owner cannot be removed.';
  end if;

  if tg_op = 'UPDATE' and old.role = 'owner' then
    if new.role is distinct from 'owner' then
      raise exception 'Platform owner cannot be demoted.';
    end if;
    if coalesce(new.is_suspended, false) and not coalesce(old.is_suspended, false) then
      raise exception 'Platform owner cannot be suspended.';
    end if;
  end if;

  return coalesce(new, old);
end
$$;

drop trigger if exists protect_owner_profile_trg on public.profiles;
create trigger protect_owner_profile_trg
  before update or delete on public.profiles
  for each row execute function public.protect_owner_profile();

create or replace function public.guard_platform_owner_uid()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_user <> 'postgres' and old.key = 'owner_uid' then
    raise exception 'Platform owner cannot be changed.';
  end if;
  return coalesce(new, old);
end
$$;

drop trigger if exists guard_platform_owner_uid_trg on public.platform_config;
create trigger guard_platform_owner_uid_trg
  before update or delete on public.platform_config
  for each row execute function public.guard_platform_owner_uid();

-- ---- 5. Signup gate ----------------------------------------------------------
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
    -- Lock the owner's immutable id on first verified login.
    insert into public.platform_config (key, value)
    values ('owner_uid', new.id::text)
    on conflict (key) do nothing;
    return new;
  end if;

  -- Invite allowlist: only a PENDING invite may create an admin account.
  select a.id into v_allowed
  from public.allowed_admin_emails a
  where a.email = v_email and a.status = 'pending'
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

-- ---- 6. Replace the broken/leaky profile RLS -------------------------------
-- Removes: "Public profiles read" (select true), "Admins manage profiles" (all
-- authenticated), "Profiles manage own role" (self role escalation),
-- "Admins can read profiles for authorization".
drop policy if exists "Public profiles read" on public.profiles;
drop policy if exists "Admins manage profiles" on public.profiles;
drop policy if exists "Profiles manage own role" on public.profiles;
drop policy if exists "Admins can read profiles for authorization" on public.profiles;

create policy "own profile read" on public.profiles
  for select using (auth.uid() = id);

create policy "staff can read profiles" on public.profiles
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles me
      where me.id = auth.uid() and me.role in ('owner', 'admin')
    )
  );

create policy "own profile update" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and new.role is not distinct from old.role
    and old.role <> 'owner'
  );

create policy "owner updates staff" on public.profiles
  for update using (
    exists (
      select 1 from public.profiles me
      where me.id = auth.uid() and me.role = 'owner'
    )
    and id <> auth.uid()
  )
  with check (
    exists (
      select 1 from public.profiles me
      where me.id = auth.uid() and me.role = 'owner'
    )
    and role <> 'owner'
    and id <> auth.uid()
  );

-- Clients must never delete profile rows (suspension is the sanctioned state)
-- nor truncate.
revoke delete, truncate on public.profiles from anon, authenticated;

comment on table public.profiles is
  'Staff directory. Role is DB-enforced: signup gate assigns owner/admin only; own-role updates blocked; owner rows immutable.';