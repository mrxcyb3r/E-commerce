-- Supabase Migration: Customer favorites, feed saves, homepage slider
--
-- 1. favorites      – persisted product saves (per visitor, cross-session).
-- 2. feed_saves     – persisted feed-video saves (separate from product favorites).
-- 3. homepage_slides – storefront hero/slider managed by the owner, no hardcoding.
--
-- Ownership model matches the app's existing storefront pattern (feed_likes /
-- feed_comments): customers are anonymous, identity is a stable visitor_id
-- generated client-side and enforced in the app. RLS stays disabled for these
-- visitor-owned rows so anonymous customers can interact, exactly like feeds.

-- ============================================================
-- PRODUCT FAVORITES
-- One favorite per visitor per product (unique constraint).
-- product_id intentionally has NO foreign key (client-managed storefront ids
-- and so deleting a product does not silently erase customer saves).
-- ============================================================
create table if not exists public.favorites (
  id uuid default uuid_generate_v4() primary key,
  product_id text not null,
  visitor_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique (product_id, visitor_id)
);

create index if not exists idx_favorites_visitor_id on public.favorites(visitor_id);
create index if not exists idx_favorites_product_id on public.favorites(product_id);

-- ============================================================
-- FEED SAVES
-- Mirrors feed_likes: one save per visitor per feed item.
-- ============================================================
create table if not exists public.feed_saves (
  id uuid default uuid_generate_v4() primary key,
  feed_id text not null,
  visitor_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique (feed_id, visitor_id)
);

create index if not exists idx_feed_saves_feed_id on public.feed_saves(feed_id);
create index if not exists idx_feed_saves_visitor_id on public.feed_saves(visitor_id);

-- ============================================================
-- HOMEPAGE SLIDES
-- Owner-managed hero slider. RLS: everyone reads active slides,
-- only authenticated admins write. Start/end scheduling not needed yet.
-- ============================================================
create table if not exists public.homepage_slides (
  id text primary key,
  badge text,
  title text,
  subtitle text,
  cta_text text,
  cta_link text,
  image_url text,
  mobile_image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_homepage_slides_active on public.homepage_slides(is_active);

-- ============================================================
-- ACCESS
-- Storefront rows: visitor-owned, RLS disabled (existing app pattern).
-- ============================================================
alter table public.favorites disable row level security;
alter table public.feed_saves disable row level security;

grant select, insert, delete on public.favorites to anon;
grant select, insert, delete on public.feed_saves to anon;
grant select, insert, update, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.feed_saves to authenticated;

-- Homepage slides: public read (active only), authenticated admin write.
alter table public.homepage_slides enable row level security;

create policy "Public read active homepage slides" on public.homepage_slides
  for select using (is_active = true);

create policy "Admins manage homepage slides" on public.homepage_slides
  for all using (auth.role() = 'authenticated');

grant select on public.homepage_slides to anon;
grant select, insert, update, delete on public.homepage_slides to authenticated;