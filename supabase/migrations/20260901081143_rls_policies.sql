-- Supabase Migration: RLS Policies for Ecommerce Platform
-- Row Level Security policies for all tables
-- Updated to work with Supabase Auth (anon key for read, signed in for write)

-- ===== Profiles =====
-- Allow public read access to profiles by email
create policy "Public profiles read" on public.profiles
  for select using (true);

-- Allow admins to manage profiles
create policy "Admins manage profiles" on public.profiles
  for all using (
    auth.role() = 'authenticated'
  );

-- ===== Categories =====
-- Anonymous/public can read visible categories
create policy "Public read categories" on public.categories
  for select using (is_visible = true);

-- Admins can manage categories
create policy "Admins manage categories" on public.categories
  for all using (
    auth.role() = 'authenticated'
  );

-- ===== Products =====
-- Anonymous/public can read published products
create policy "Public read published products" on public.products
  for select using (is_published = true);

-- Admins can manage all products
create policy "Admins manage products" on public.products
  for all using (
    auth.role() = 'authenticated'
  );

-- ===== Product Images =====
-- Admins can manage product images
create policy "Admins manage product images" on public.product_images
  for all using (
    auth.role() = 'authenticated'
  );

-- ===== Product Sizes =====
-- Admins can manage product sizes
create policy "Admins manage product sizes" on public.product_sizes
  for all using (
    auth.role() = 'authenticated'
  );

-- ===== Product Colors =====
-- Admins can manage product colors
create policy "Admins manage product colors" on public.product_colors
  for all using (
    auth.role() = 'authenticated'
  );

-- ===== Feed Posts =====
-- Anonymous/public can read published feed posts
create policy "Public read published feed" on public.feed_posts
  for select using (is_published = true);

-- Admins can manage feed posts
create policy "Admins manage feed posts" on public.feed_posts
  for all using (
    auth.role() = 'authenticated'
  );

-- ===== Prompts =====
-- Anonymous/public can read published prompts
create policy "Public read published prompts" on public.prompts
  for select using (is_published = true);

-- Admins can manage prompts
create policy "Admins manage prompts" on public.prompts
  for all using (
    auth.role() = 'authenticated'
  );

-- ===== Testimonials =====
-- Anonymous/public can read published testimonials
create policy "Public read published testimonials" on public.testimonials
  for select using (is_published = true);

-- Admins can manage testimonials
create policy "Admins manage testimonials" on public.testimonials
  for all using (
    auth.role() = 'authenticated'
  );

-- ===== FAQ =====
-- Anonymous/public can read published FAQ
create policy "Public read published FAQ" on public.faqs
  for select using (is_published = true);

-- Admins can manage FAQ
create policy "Admins manage FAQ" on public.faqs
  for all using (
    auth.role() = 'authenticated'
  );

-- ===== Homepage CMS =====
-- Admins can manage homepage CMS
create policy "Admins manage homepage CMS" on public.homepage_cms
  for all using (
    auth.role() = 'authenticated'
  );

-- ===== About CMS =====
-- Admins can manage about CMS
create policy "Admins manage about CMS" on public.about_cms
  for all using (
    auth.role() = 'authenticated'
  );

-- ===== Contact CMS =====
-- Admins can manage contact CMS
create policy "Admins manage contact CMS" on public.contact_cms
  for all using (
    auth.role() = 'authenticated'
  );

-- ===== Store Settings =====
-- Admins can manage store settings
create policy "Admins manage store settings" on public.store_settings
  for all using (
    auth.role() = 'authenticated'
  );