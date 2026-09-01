-- Supabase Migration: RLS Policies for Ecommerce Platform
-- Row Level Security policies for all tables

-- ===== Profiles =====
-- Allow admins/owners to manage profiles
create policy "Admins can manage profiles" on public.profiles
  for all using (
    exists (
      select 1 from public.profiles admin_profiles
      where admin_profiles.username = current_setting('app.admin_username', true)
      and admin_profiles.role in ('owner', 'admin')
    )
  );

-- Allow viewers to read their own profile
create policy "Viewers can read own profile" on public.profiles
  for select using (
    auth.uid() = id
  );

-- ===== Categories =====
-- Anonymous/public can read visible categories
create policy "Public can read categories" on public.categories
  for select using (is_visible = true);

-- Admins can manage categories
create policy "Admins can manage categories" on public.categories
  for all using (
    exists (
      select 1 from public.profiles admin_profiles
      where admin_profiles.username = current_setting('app.admin_username', true)
      and admin_profiles.role in ('owner', 'admin', 'editor')
    )
  );

-- ===== Products =====
-- Anonymous/public can read published products
create policy "Public can read published products" on public.products
  for select using (is_published = true);

-- Admins/Editors can manage all products
create policy "Admins can manage products" on public.products
  for all using (
    exists (
      select 1 from public.profiles admin_profiles
      where admin_profiles.username = current_setting('app.admin_username', true)
      and admin_profiles.role in ('owner', 'admin', 'editor')
    )
  );

-- ===== Product Images =====
-- Admins can manage product images
create policy "Admins can manage product images" on public.product_images
  for all using (
    exists (
      select 1 from public.profiles admin_profiles
      where admin_profiles.username = current_setting('app.admin_username', true)
      and admin_profiles.role in ('owner', 'admin', 'editor')
    )
  );

-- ===== Product Sizes =====
-- Admins can manage product sizes
create policy "Admins can manage product sizes" on public.product_sizes
  for all using (
    exists (
      select 1 from public.profiles admin_profiles
      where admin_profiles.username = current_setting('app.admin_username', true)
      and admin_profiles.role in ('owner', 'admin', 'editor')
    )
  );

-- ===== Product Colors =====
-- Admins can manage product colors
create policy "Admins can manage product colors" on public.product_colors
  for all using (
    exists (
      select 1 from public.profiles admin_profiles
      where admin_profiles.username = current_setting('app.admin_username', true)
      and admin_profiles.role in ('owner', 'admin', 'editor')
    )
  );

-- ===== Feed Posts =====
-- Public can read published feed posts
create policy "Public can read published feed posts" on public.feed_posts
  for select using (is_published = true);

-- Admins can manage feed posts
create policy "Admins can manage feed posts" on public.feed_posts
  for all using (
    exists (
      select 1 from public.profiles admin_profiles
      where admin_profiles.username = current_setting('app.admin_username', true)
      and admin_profiles.role in ('owner', 'admin', 'editor')
    )
  );

-- ===== Prompts =====
-- Public can read published prompts
create policy "Public can read published prompts" on public.prompts
  for select using (is_published = true);

-- Admins can manage prompts
create policy "Admins can manage prompts" on public.prompts
  for all using (
    exists (
      select 1 from public.profiles admin_profiles
      where admin_profiles.username = current_setting('app.admin_username', true)
      and admin_profiles.role in ('owner', 'admin', 'editor')
    )
  );

-- ===== Testimonials =====
-- Public can read published testimonials
create policy "Public can read published testimonials" on public.testimonials
  for select using (is_published = true);

-- Admins can manage testimonials
create policy "Admins can manage testimonials" on public.testimonials
  for all using (
    exists (
      select 1 from public.profiles admin_profiles
      where admin_profiles.username = current_setting('app.admin_username', true)
      and admin_profiles.role in ('owner', 'admin', 'editor')
    )
  );

-- ===== FAQ =====
-- Public can read published FAQ
create policy "Public can read published FAQ" on public.faqs
  for select using (is_published = true);

-- Admins can manage FAQ
create policy "Admins can manage FAQ" on public.faqs
  for all using (
    exists (
      select 1 from public.profiles admin_profiles
      where admin_profiles.username = current_setting('app.admin_username', true)
      and admin_profiles.role in ('owner', 'admin', 'editor')
    )
  );

-- ===== Homepage CMS =====
-- Admins can manage homepage CMS (single row)
create policy "Admins can manage homepage CMS" on public.homepage_cms
  for all using (
    exists (
      select 1 from public.profiles admin_profiles
      where admin_profiles.username = current_setting('app.admin_username', true)
      and admin_profiles.role in ('owner', 'admin', 'editor')
    )
  );

-- ===== About CMS =====
-- Admins can manage about CMS (single row)
create policy "Admins can manage about CMS" on public.about_cms
  for all using (
    exists (
      select 1 from public.profiles admin_profiles
      where admin_profiles.username = current_setting('app.admin_username', true)
      and admin_profiles.role in ('owner', 'admin', 'editor')
    )
  );

-- ===== Contact CMS =====
-- Admins can manage contact CMS (single row)
create policy "Admins can manage contact CMS" on public.contact_cms
  for all using (
    exists (
      select 1 from public.profiles admin_profiles
      where admin_profiles.username = current_setting('app.admin_username', true)
      and admin_profiles.role in ('owner', 'admin', 'editor')
    )
  );

-- ===== Store Settings =====
-- Admins can manage store settings (single row)
create policy "Admins can manage store settings" on public.store_settings
  for all using (
    exists (
      select 1 from public.profiles admin_profiles
      where admin_profiles.username = current_setting('app.admin_username', true)
      and admin_profiles.role in ('owner', 'admin', 'editor')
    )
  );