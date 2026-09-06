-- Migration: Fine-grained Admin RLS Policies
-- Replaces broad "auth.role() = 'authenticated'" checks with profile role-based authorization

-- ===== Profiles =====
-- Drop existing broad admin policy
drop policy if exists "Admins manage profiles" on public.profiles;

-- Allow public read access to profiles by email (no change)
create policy "Public profiles read" on public.profiles
  for select using (true);

-- Owner can fully manage profiles
create policy "Owner manage profiles" on public.profiles
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  );

-- Admin can manage profiles (view and basic operations)
create policy "Admin manage profiles" on public.profiles
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  );

-- Editor can view profiles
create policy "Editor view profiles" on public.profiles
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'editor'
    )
  );

-- Viewer can view profiles
create policy "Viewer view profiles" on public.profiles
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'viewer'
    )
  );

-- ===== Categories =====
-- Drop existing broad admin policy
drop policy if exists "Admins manage categories" on public.categories;

-- Anonymous/public can read visible categories
create policy "Public read categories" on public.categories
  for select using (is_visible = true);

-- Owner can manage categories
create policy "Owner manage categories" on public.categories
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  );

-- Admin can manage categories
create policy "Admin manage categories" on public.categories
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  );

-- ===== Products =====
-- Drop existing broad admin policy
drop policy if exists "Admins manage products" on public.products;

-- Anonymous/public can read published products
create policy "Public read published products" on public.products
  for select using (is_published = true);

-- Owner can manage all products
create policy "Owner manage products" on public.products
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  );

-- Admin can manage all products
create policy "Admin manage products" on public.products
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  );

-- ===== Product Images =====
-- Drop existing broad admin policy
drop policy if exists "Admins manage product images" on public.product_images;

-- Admins can manage product images
create policy "Owner manage product images" on public.product_images
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  );

-- Admin can manage product images
create policy "Admin manage product images" on public.product_images
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  );

-- ===== Product Sizes =====
-- Drop existing broad admin policy
drop policy if exists "Admins manage product sizes" on public.product_sizes;

-- Owner can manage product sizes
create policy "Owner manage product sizes" on public.product_sizes
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  );

-- Admin can manage product sizes
create policy "Admin manage product sizes" on public.product_sizes
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  );

-- ===== Product Colors =====
-- Drop existing broad admin policy
drop policy if exists "Admins manage product colors" on public.product_colors;

-- Owner can manage product colors
create policy "Owner manage product colors" on public.product_colors
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  );

-- Admin can manage product colors
create policy "Admin manage product colors" on public.product_colors
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  );

-- ===== Feed Posts =====
-- Drop existing broad admin policy
drop policy if exists "Admins manage feed posts" on public.feed_posts;

-- Anonymous/public can read published feed posts
create policy "Public read published feed" on public.feed_posts
  for select using (is_published = true);

-- Owner can manage feed posts
create policy "Owner manage feed posts" on public.feed_posts
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  );

-- Admin can manage feed posts
create policy "Admin manage feed posts" on public.feed_posts
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  );

-- ===== Prompts =====
-- Drop existing broad admin policy
drop policy if exists "Admins manage prompts" on public.prompts;

-- Anonymous/public can read published prompts
create policy "Public read published prompts" on public.prompts
  for select using (is_published = true);

-- Owner can manage prompts
create policy "Owner manage prompts" on public.prompts
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  );

-- Admin can manage prompts
create policy "Admin manage prompts" on public.prompts
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  );

-- ===== Testimonials =====
-- Drop existing broad admin policy
drop policy if exists "Admins manage testimonials" on public.testimonials;

-- Anonymous/public can read published testimonials
create policy "Public read published testimonials" on public.testimonials
  for select using (is_published = true);

-- Owner can manage testimonials
create policy "Owner manage testimonials" on public.testimonials
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  );

-- Admin can manage testimonials
create policy "Admin manage testimonials" on public.testimonials
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  );

-- ===== FAQ =====
-- Drop existing broad admin policy
drop policy if exists "Admins manage FAQ" on public.faqs;

-- Anonymous/public can read published FAQ
create policy "Public read published FAQ" on public.faqs
  for select using (is_published = true);

-- Owner can manage FAQ
create policy "Owner manage FAQ" on public.faqs
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  );

-- Admin can manage FAQ
create policy "Admin manage FAQ" on public.faqs
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  );

-- ===== Homepage CMS =====
-- Drop existing broad admin policy
drop policy if exists "Admins manage homepage CMS" on public.homepage_cms;

-- Owner can manage homepage CMS
create policy "Owner manage homepage CMS" on public.homepage_cms
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  );

-- Admin can manage homepage CMS
create policy "Admin manage homepage CMS" on public.homepage_cms
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  );

-- ===== About CMS =====
-- Drop existing broad admin policy
drop policy if exists "Admins manage about CMS" on public.about_cms;

-- Owner can manage about CMS
create policy "Owner manage about CMS" on public.about_cms
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  );

-- Admin can manage about CMS
create policy "Admin manage about CMS" on public.about_cms
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  );

-- ===== Store Settings =====
-- Drop existing broad admin policy
drop policy if exists "Admins manage store settings" on public.store_settings;

-- Owner can manage store settings
create policy "Owner manage store settings" on public.store_settings
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  );

-- Admin can manage store settings
create policy "Admin manage store settings" on public.store_settings
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  );