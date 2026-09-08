-- Migration: Auth — Platform owner configuration
-- The platform has exactly one immutable owner. Its identity lives in the
-- DATABASE (not hardcoded in the SPA) so authorization always checks the
-- owner's immutable user id after first verified login, never just an email.
--
-- owner_email : bootstrap value used by the signup gate to grant 'owner' role.
--               Change this only via a forward migration, never by UPDATE.
-- owner_uid   : locked on first verified owner login; immutable afterwards
--               (guarded by a trigger — see auth_profiles_hardening migration).

create table if not exists public.platform_config (
  key text primary key,
  value text not null
);

insert into public.platform_config (key, value)
values ('owner_email', 'mrxcyb3r@proton.me')
on conflict (key) do nothing;

insert into public.platform_config (key, value)
values ('owner_uid', '')
on conflict (key) do nothing;

-- Owner email is not sensitive enough to hide from logged-in staff, but the
-- owner_uid is an authentication detail — keep the whole row owner-only.
alter table public.platform_config enable row level security;

drop policy if exists "platform_config owner read" on public.platform_config;
create policy "platform_config owner read" on public.platform_config
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

-- Only postgres (migrations + SECURITY DEFINER triggers) may insert or update.
comment on table public.platform_config is
  'Platform-wide immutable configuration. owner_uid is guarded by a trigger; update via forward migration only.';