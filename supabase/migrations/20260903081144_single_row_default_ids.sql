-- Supabase Migration: Give single-row CMS/settings tables a constant default id
-- These tables are upserted by the app without an explicit id. After converting
-- the id columns from uuid (gen_random_uuid() default) to text, they lost their
-- default, causing upserts to fail with "null value in column id". A constant
-- sentinel id ('default') preserves the single-row-per-table intent and lets
-- PostgREST upserts (resolution=merge-duplicates) always target the same row.

alter table public.store_settings alter column id set default 'default';
alter table public.homepage_cms alter column id set default 'default';
alter table public.about_cms alter column id set default 'default';
alter table public.contact_cms alter column id set default 'default';
