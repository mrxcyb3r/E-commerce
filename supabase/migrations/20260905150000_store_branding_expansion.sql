-- Supabase Migration: Expanded White-label Branding Fields
-- Purely additive: extends store_settings with the full white-label identity
-- model so each client store can be branded without code changes.
alter table public.store_settings
  add column if not exists short_name text,
  add column if not exists secondary_color text,
  add column if not exists accent_color text,
  add column if not exists hero_title text,
  add column if not exists hero_subtitle text,
  add column if not exists about_text text,
  add column if not exists mission text,
  add column if not exists vision text,
  add column if not exists admin_email text,
  add column if not exists default_seo_keywords text,
  add column if not exists twitter_image_url text,
  add column if not exists copyright text,
  add column if not exists footer_text text;