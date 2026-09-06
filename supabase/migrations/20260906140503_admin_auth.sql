-- Migration: Admin Authentication & Membership System
-- Adds admin membership infrastructure on top of existing profiles.role

-- 1. Create admin_invitations table for owner-to-admin invitations
create table if not exists public.admin_invitations (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  role text not null default 'admin' check (role in ('owner', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'active', 'revoked')),
  invited_by uuid references public.profiles(id) on delete set null,
  token text not null unique,
  expires_at timestamp with time zone not null,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Add invitation tracking to profiles
alter table public.profiles
  add column if not exists pending_invitation_id uuid references public.admin_invitations(id) on delete set null;

-- 3. Create index on invitations for fast lookups
create index if not exists idx_admin_invitations_email on public.admin_invitations(email);
create index if not exists idx_admin_invitations_token on public.admin_invitations(token);
create index if not exists idx_admin_invitations_expires on public.admin_invitations(expires_at);
create index if not exists idx_admin_invitations_status on public.admin_invitations(status);

-- 4. Add RLS policies for admin_invitations
-- Allow owner to manage invitations
create policy "Owner manage admin invitations" on public.admin_invitations
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'owner'
    )
  )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'owner'
    )
  );

-- 4. Update RLS policies for profiles to check role properly
-- Drop existing broad policy and replace with role-based policy
drop policy if exists "Admins manage profiles" on public.profiles;

create policy "Profiles manage own role" on public.profiles
  for all using (
    auth.uid() = id
  );

-- 5. Add policy for admin membership checks
create policy "Admins can read profiles for authorization" on public.profiles
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role in ('owner', 'admin')
    )
  );

-- 6. Add comment to document the role system
comment on column public.profiles.role is 'Role: owner (full access, protected), admin (managed access), editor (limited access), viewer (read-only)';
comment on table public.admin_invitations is 'Invitations from owner to become admin. Single-use, time-limited. Acceptance grants active admin membership.';

-- 7. Update existing profiles to have appropriate roles based on current data
-- The owner profile should be set to 'owner' role
-- Other existing profiles should default to 'viewer' or their existing role
update public.profiles set role = 'owner' where role is null;

-- 8. Add trigger to update updated_at on profiles
create trigger if not exists handle_profiles_updated_at
  after update on public.profiles
  for each row
  execute function handle_updated_at_timestamp();

-- 9. Add function to handle updated_at timestamp if not exists
create or replace function handle_updated_at_timestamp()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
language 'plpgsql';