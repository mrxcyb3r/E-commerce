-- Supabase Migration: Feed Likes and Comments
-- Anonymous customers can like/unlike feed posts and leave comments.
-- Moderation controls for admin management.

-- ============================================================
-- FEED LIKES
-- One like per visitor per feed post (unique constraint)
-- ============================================================
create table if not exists public.feed_likes (
  id uuid default uuid_generate_v4() primary key,
  feed_id text not null references public.feed_posts on delete cascade,
  visitor_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique (feed_id, visitor_id)
);

create index if not exists idx_feed_likes_feed_id on public.feed_likes(feed_id);
create index if not exists idx_feed_likes_visitor_id on public.feed_likes(visitor_id);

-- ============================================================
-- FEED COMMENTS
-- Anonymous comments with moderation status
-- ============================================================
create table if not exists public.feed_comments (
  id uuid default uuid_generate_v4() primary key,
  feed_id text not null references public.feed_posts on delete cascade,
  visitor_id text not null,
  display_name text not null,
  text text not null,
  moderation_status text not null default 'visible' check (moderation_status in ('pending', 'visible', 'hidden', 'deleted')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_feed_comments_feed_id on public.feed_comments(feed_id);
create index if not exists idx_feed_comments_visitor_id on public.feed_comments(visitor_id);
create index if not exists idx_feed_comments_moderation on public.feed_comments(moderation_status);

-- ============================================================
-- ACCESS
-- The storefront uses the publishable/anon key for all operations and
-- enforces ownership logic in the frontend via visitor_id filters, matching
-- the app's existing (working) pattern across all tables.
-- ============================================================
alter table public.feed_likes disable row level security;
alter table public.feed_comments disable row level security;

grant select, insert, delete on public.feed_likes to anon;
grant select, insert on public.feed_comments to anon;
grant select, insert, update, delete on public.feed_likes to authenticated;
grant select, insert, update, delete on public.feed_comments to authenticated;
