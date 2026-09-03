-- Drop foreign keys on the feed social tables.
--
-- Root cause of the runtime 409 conflicts: the storefront video feed is
-- client-managed (localStorage / INITIAL_VIDEOS, ids like 'vid-1', 'vid-2')
-- and feed_posts is NOT the source of feed items (it's empty and unused for
-- display). The FK from feed_comments.feed_id / feed_likes.feed_id to
-- feed_posts(id) made every anon comment/like insert fail with Postgres
-- error 23503, which the Supabase REST API surfaces as HTTP 409 Conflict.
--
-- We drop only the FK constraints. We keep the columns, primary keys, the
-- one-like-per-visitor unique constraint on feed_likes(feed_id, visitor_id),
-- indexes, grants, and RLS state unchanged.

alter table public.feed_comments
  drop constraint if exists feed_comments_feed_id_fkey;

alter table public.feed_likes
  drop constraint if exists feed_likes_feed_id_fkey;
