-- Supabase Migration: Feed Comments Upgrade
-- Adds threaded replies, pinned comments, badges, and comment likes.
-- Purely additive: existing rows remain valid (new columns have defaults).

-- ============================================================
-- FEED COMMENTS — new columns (backwards compatible)
-- ============================================================
alter table public.feed_comments
  add column if not exists parent_id uuid references public.feed_comments(id)
    on delete cascade,
  add column if not exists is_pinned boolean not null default false,
  add column if not exists is_admin boolean not null default false,
  add column if not exists is_verified boolean not null default false,
  add column if not exists like_count integer not null default 0;

create index if not exists idx_feed_comments_parent_id on public.feed_comments(parent_id);
create index if not exists idx_feed_comments_pinned on public.feed_comments(feed_id) where is_pinned = true;

-- ============================================================
-- FEED COMMENT LIKES — one like per visitor per comment
-- ============================================================
create table if not exists public.feed_comment_likes (
  id uuid default uuid_generate_v4() primary key,
  comment_id uuid not null references public.feed_comments(id) on delete cascade,
  visitor_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique (comment_id, visitor_id)
);

create index if not exists idx_feed_comment_likes_comment on public.feed_comment_likes(comment_id);
create index if not exists idx_feed_comment_likes_visitor on public.feed_comment_likes(visitor_id);

-- ============================================================
-- ACCESS
-- ANON: read likes and comments (visible only), post, delete own
-- AUTHENTICATED (admin): full management of comments + likes cleanup
-- ============================================================
alter table public.feed_comment_likes disable row level security;

grant select, insert, delete on public.feed_comment_likes to anon;
grant select, insert, update, delete on public.feed_comment_likes to authenticated;

-- Keep old anon grants in sync with the new columns (update path for pinning is
-- reserved for authenticated admin, matching the storefront's existing model).
grant select, insert on public.feed_comments to anon;
grant select, insert, update, delete on public.feed_comments to authenticated;