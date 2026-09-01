-- Supabase Migration: Initial Schema for Ecommerce Platform
-- This migration creates all the necessary tables for the production-ready ecommerce platform

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table - extends auth users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  role text not null default 'viewer' check (role in ('owner', 'admin', 'editor', 'viewer')),
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Categories table
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  is_visible boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()
);

-- Products table
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  name text not null,
  description text,
  short_description text,
  price integer not null default 0,
  original_price integer default null,
  currency text not null default 'uzs',
  category_id uuid references public.categories on delete set null,
  brand text,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_on_sale boolean not null default false,
  stock_status text not null default 'mavjud' check (stock_status in ('mavjud', 'tugagan')),
  stock_count integer not null default 0,
  sku text unique,
  rating numeric default 0,
  review_count integer default 0,
  tags text[] default '{}',
  material text,
  made_in text,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()
);

-- Product Images table
create table if not exists public.product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products on delete cascade not null,
  url text not null,
  alt_text text,
  is_boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Product Sizes table
create table if not exists public.product_sizes (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products on delete cascade not null,
  size text not null,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Product Colors table
create table if not exists public.product_colors (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products on delete cascade not null,
  name text not null,
  hex_code text,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Feed Posts table (videos/collections)
create table if not exists public.feed_posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  video_url text,
  thumbnail_url text,
  product_id uuid references public.products on delete set null,
  type text not null default 'video' check (type in ('video', 'collection')),
  badge_text text,
  badge_type text,
  duration text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()
);

-- Prompts table (AI prompt library)
create table if not exists public.prompts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  content_type text not null default 'image' check (content_type in ('image', 'video', 'text')),
  category text not null,
  subcategory text,
  product_type text,
  prompt text not null,
  recommended_tool text,
  recommended_tool_url text,
  difficulty text check (difficulty in ('easy', 'medium', 'hard', 'expert')),
  tags text[] default '{}',
  aspect_ratio text not null default '1:1',
  is_featured boolean not null default false,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()
);

-- Testimonials table
create table if not exists public.testimonials (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  location text,
  avatar_url text,
  rating integer not null default 5 check (rating >= 1 and rating <= 5),
  comment text not null,
  date text,
  verified_visit boolean not null default false,
  purchased_product text,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()
);

-- FAQ table
create table if not exists public.faqs (
  id uuid default uuid_generate_v4() primary key,
  question text not null,
  answer text not null,
  category text,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()
);

-- Homepage CMS table
create table if not exists public.homepage_cms (
  id uuid default uuid_generate_v4() primary key,
  hero_badge text,
  hero_title text,
  hero_highlighted_title text,
  hero_subtitle text,
  hero_primary_cta_text text,
  hero_primary_cta_link text,
  hero_secondary_cta_text text,
  hero_secondary_cta_link text,
  hero_image_url text,
  promo_banner_badge text,
  promo_banner_title text,
  promo_banner_subtitle text,
  promo_banner_description text,
  promo_banner_button_text text,
  promo_banner_button_link text,
  promo_banner_image_url text,
  promo_banner_enabled boolean not null default false,
  why_choose_us_title text,
  why_choose_us_subtitle text,
  features jsonb default '[]',
  featured_section_title text,
  featured_section_subtitle text,
  video_section_title text,
  video_section_subtitle text,
  updated_at timestamp with time zone default timezone('utc'::text, now()
);

-- About CMS table
create table if not exists public.about_cms (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  subtitle text,
  main_story text,
  second_story text,
  mission text,
  vision text,
  images text[] default '{}',
  features jsonb default '[]',
  updated_at timestamp with time zone default timezone('utc'::text, now()
);

-- Contact CMS table
create table if not exists public.contact_cms (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  subtitle text,
  description text,
  form_enabled boolean not null default true,
  telegram_direct_note text,
  support_note text,
  direct_help_text text,
  updated_at timestamp with time zone default timezone('utc'::text, now()
);

-- Store Settings table
create table if not exists public.store_settings (
  id uuid default uuid_generate_v4() primary key,
  business_name text not null default 'Ecommerce',
  name text,
  business_description text,
  tagline text,
  phone text,
  phone_raw text,
  phone_numbers text[] default '{}',
  email text,
  telegram text,
  telegram_username text,
  telegram_channel text,
  instagram_username text,
  address text,
  city text,
  landmark text,
  working_hours text,
  working_hours_detail jsonb default '{"weekdays":"09:00 - 20:00","weekend":"09:00 - 21:00","note":""}',
  social_links jsonb default '{"telegram":"","instagram":"","facebook":""}',
  primary_color text not null default '#0f172a',
  currency text not null default 'uzs',
  coordinates jsonb default '{"lat":40.1158,"lng":67.8422}',
  google_maps_url text,
  yandex_maps_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()
);

-- Indexes for performance
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_is_published on public.products(is_published);
create index if not exists idx_products_is_featured on public.products(is_featured);
create index if not exists idx_products_stock_status on public.products(stock_status);
create index if not exists idx_products_sku on public.products(sku);
create index if not exists idx_product_images_product_id on public.product_images(product_id);
create index if not exists idx_product_sizes_product_id on public.product_sizes(product_id);
create index if not exists idx_product_colors_product_id on public.product_colors(product_id);
create index if not exists idx_feed_posts_product_id on public.feed_posts(product_id);
create index if not exists idx_feed_posts_is_published on public.feed_posts(is_published);
create index if not exists idx_prompts_is_published on public.prompts(is_published);
create index if not exists idx_prompts_is_featured on public.prompts(is_featured);
create index if not exists idx_testimonials_is_published on public.testimonials(is_published);
create index if not exists idx_faqs_is_published on public.faqs(is_published);

-- Row Level Security (RLS) policies will be added separately
-- These ensure proper access control

-- Grant authenticated users access to tables
grant all on public.profiles to authenticated;
grant select on public.categories to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.product_images to authenticated;
grant select, insert, update, delete on public.product_sizes to authenticated;
grant select, insert, update, delete on public.product_colors to authenticated;
grant select, insert, update, delete on public.feed_posts to authenticated;
grant select, insert, update, delete on public.prompts to authenticated;
grant select, insert, update, delete on public.testimonials to authenticated;
grant select, insert, update, delete on public.faqs to authenticated;
grant select, insert, update, delete on public.homepage_cms to authenticated;
grant select, insert, update, delete on public.about_cms to authenticated;
grant select, insert, update, delete on public.contact_cms to authenticated;
grant select, insert, update, delete on public.store_settings to authenticated;