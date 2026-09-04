-- Migration: Media upload security for Supabase Storage
-- Adds RLS policies so only the signed-in store owner (admin) can write
-- media, while customers can read it. Enforces size/MIME limits server-side
-- per bucket, and gives products an optional video + poster.

-- 1. Server-side file validation per bucket (defense in depth)
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
where id = 'product-images';

update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
where id = 'store-assets';

update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
where id = 'prompt-assets';

update storage.buckets
set file_size_limit = 104857600,
    allowed_mime_types = array['video/mp4', 'video/webm']::text[]
where id = 'feed-media';

-- Feed posters/thumbnails are images stored alongside feed videos under
-- feed/{feedId}/..., so feed-media also permits the supported image types.
update storage.buckets
set allowed_mime_types = array['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp']::text[],
    file_size_limit = 104857600
where id = 'feed-media';

-- 2. RLS: customers (anon) may read store media
create policy "Public read store media" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('product-images', 'feed-media', 'store-assets', 'prompt-assets'));

-- 3. RLS: only authenticated (admin) writes. Anonymous has no write policies.
create policy "Admins insert store media" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('product-images', 'feed-media', 'store-assets', 'prompt-assets'));

create policy "Admins update store media" on storage.objects
  for update to authenticated
  using (bucket_id in ('product-images', 'feed-media', 'store-assets', 'prompt-assets'))
  with check (bucket_id in ('product-images', 'feed-media', 'store-assets', 'prompt-assets'));

create policy "Admins delete store media" on storage.objects
  for delete to authenticated
  using (bucket_id in ('product-images', 'feed-media', 'store-assets', 'prompt-assets'));

-- 4. Products can carry an optional video plus a poster image
alter table public.products
  add column if not exists video_url text,
  add column if not exists video_poster_url text;