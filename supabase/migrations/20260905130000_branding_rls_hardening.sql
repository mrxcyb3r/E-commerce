-- 2026-09-05 — Branding / white-label columns + harden CMS tables with RLS
-- (policies "Admins manage …" already existed; RLS itself was never ENABLED on
--  store_settings / homepage_cms / about_cms / contact_cms → anyone could write.
--  Enabled now with anon-read + authenticated-write, so the public storefront
--  keeps loading and only signed-in admins can modify.)

alter table public.store_settings
  add column if not exists logo_url text,
  add column if not exists favicon_url text,
  add column if not exists business_category text,
  add column if not exists language text default 'uz',
  add column if not exists default_seo_title text,
  add column if not exists default_seo_description text,
  add column if not exists og_image_url text;

-- ---- store_settings : enable RLS + public read ----
alter table public.store_settings enable row level security;
create policy if not exists "Public read store settings" on public.store_settings
  for select using (true);

-- ---- homepage_cms : enable RLS + public read ----
alter table public.homepage_cms enable row level security;
create policy if not exists "Public read homepage CMS" on public.homepage_cms
  for select using (true);

-- ---- about_cms : enable RLS + public read ----
alter table public.about_cms enable row level security;
create policy if not exists "Public read about CMS" on public.about_cms
  for select using (true);

-- ---- contact_cms : enable RLS + public read ----
alter table public.contact_cms enable row level security;
create policy if not exists "Public read contact CMS" on public.contact_cms
  for select using (true);