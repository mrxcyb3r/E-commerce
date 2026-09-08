-- Migration: Harden storage.objects write authorization
--
-- Storage write policies were "to authenticated" with a bucket_id-only check,
-- i.e. ANY signed-in auth user (not just staff) could upload/replace/delete
-- media in the four store buckets. Replace with the verified profile-role
-- pattern (owner/admin only) plus a path-namespace guard.
--
-- Path model verified against the app's only upload entry point,
-- buildMediaPath(src/lib/supabase/storage.ts), which emits exactly:
--   - "<scope>/…"  when scope starts with feed-        (feed-media bucket)
--   - "products/<scope>/…" for everything else        (product-images + store-assets)
-- Buckets in production: product-images, feed-media, store-assets, prompt-assets
-- (prompt-assets is reserved, no uploads yet).
--
-- So all current writes land under the top-level namespaces products/ and feed/.
-- The guard allows those plus the semantic namespaces store/, homepage/,
-- categories/ and prompts/ so future uploads that write directly under the
-- right bucket stay unblocked; a NULL first folder (root-level name, used by no
-- upload path) is also tolerated to stay non-breaking.
--
-- Public READ is intentionally unchanged: storefront media is public.

-- ============ INSERT ============
drop policy if exists "Admins insert store media" on storage.objects;

create policy "Admins insert store media" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('product-images', 'feed-media', 'store-assets', 'prompt-assets')
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role in ('owner', 'admin')
    )
    and (
      (storage.foldername(name))[1] is null
      or (storage.foldername(name))[1] in ('products', 'feed', 'store', 'homepage', 'categories', 'prompts')
    )
  );

-- ============ UPDATE ============
drop policy if exists "Admins update store media" on storage.objects;

create policy "Admins update store media" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('product-images', 'feed-media', 'store-assets', 'prompt-assets')
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role in ('owner', 'admin')
    )
  )
  with check (
    bucket_id in ('product-images', 'feed-media', 'store-assets', 'prompt-assets')
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role in ('owner', 'admin')
    )
    and (
      (storage.foldername(name))[1] is null
      or (storage.foldername(name))[1] in ('products', 'feed', 'store', 'homepage', 'categories', 'prompts')
    )
  );

-- ============ DELETE ============
drop policy if exists "Admins delete store media" on storage.objects;

create policy "Admins delete store media" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('product-images', 'feed-media', 'store-assets', 'prompt-assets')
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role in ('owner', 'admin')
    )
  );

-- Public read policy "Public read store media" is unchanged.