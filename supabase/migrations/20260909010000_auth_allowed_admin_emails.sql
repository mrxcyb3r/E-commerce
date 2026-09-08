-- Migration: Auth — Allowed admin email allowlist
-- No open registration. An email must first be allowlisted (by the platform
-- owner, via the invite flow) before an account can be created for it.
--
-- status lifecycle: pending -> used (invite consumed on first signup) | revoked.
-- The signup gate trigger reads this table as SECURITY DEFINER (postgres), so
-- RLS here is about WHO manages the allowlist, not about reading it.

create table if not exists public.allowed_admin_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  store_id text not null default 'default',
  status text not null default 'pending' check (status in ('pending', 'used', 'revoked')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  used_at timestamp with time zone,
  used_by uuid references public.profiles(id) on delete set null,
  unique (email)
);

create index if not exists idx_allowed_admin_emails_email on public.allowed_admin_emails(email);
create index if not exists idx_allowed_admin_emails_status on public.allowed_admin_emails(status);
create index if not exists idx_allowed_admin_emails_created_by on public.allowed_admin_emails(created_by);

alter table public.allowed_admin_emails enable row level security;

-- Only the platform owner manages the allowlist. Admins are added BY the owner.
drop policy if exists "owner manage allowed admin emails" on public.allowed_admin_emails;
create policy "owner manage allowed admin emails" on public.allowed_admin_emails
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

comment on table public.allowed_admin_emails is
  'Emails allowed to create a platform account. pending/used/revoked lifecycle; invite consumed on signup by the handle_new_user trigger.';