-- Supabase Migration: complete analytics event allowlist
--
-- ROOT CAUSE (analytics trustworthiness audit):
-- The TypeScript client (src/types/supabase-db.ts AnalyticsEventType, 31 values)
-- fires feed_video_start, feed_video_complete, feed_video_retention,
-- feed_favorite, feed_unlike and all feed_comment_* events, but the repository
-- migration chain only allowed 20 values. Supabase PostgREST bulk inserts are
-- ATOMIC: a single batch containing one disallowed event rejects the ENTIRE
-- batch, silently discarding neighbouring page_view / product_view / feed_view
-- rows (the client ignores insert results by design so the storefront never
-- breaks). Live-DB probes (Sep 2026) showed production already accepts several
-- of the newer types, so this migration CONVERGES the allowlist to exactly the
-- TS union rather than assuming the old 20-value state. Verify with the guard
-- queries in docs/MIGRATIONS.md before applying if the remote state is unknown.
--
-- This migration widens the allowlist to exactly the 31 values of the TS union.
-- No tables created, no RLS semantics changed (anon INSERT-only, authenticated
-- full manage stays as-is). Re-runnable (DROP IF EXISTS guards). Rollback =
-- re-apply the previous allowlist file, accepting that newer event types will
-- be rejected again afterwards.

alter table public.analytics_events
  drop constraint if exists analytics_events_event_type_check;

alter table public.analytics_events
  add constraint analytics_events_event_type_check check (
    event_type in (
      'page_view',
      'product_view',
      'product_dwell',
      'product_share',
      'product_save',
      'product_unsave',
      'category_view',
      'search',
      'feed_view',
      'feed_like',
      'feed_unlike',
      'feed_share',
      'feed_product_click',
      'feed_watch',
      'feed_video_start',
      'feed_video_complete',
      'feed_video_retention',
      'feed_favorite',
      'feed_comment_open',
      'feed_comment_submit',
      'feed_comment_view',
      'feed_comment_delete',
      'feed_comment_hide',
      'feed_comment_restore',
      'telegram_click',
      'phone_click',
      'directions_click',
      'ai_question',
      'price_offer',
      'contact_click',
      'feedback_submit'
    )
  );

-- Keep the anonymous INSERT policy allowlist in sync.
drop policy if exists "anon insert analytics events" on public.analytics_events;
create policy "anon insert analytics events" on public.analytics_events
  for insert to anon
  with check (
    length(visitor_id) between 8 and 200
    and length(session_id) between 8 and 200
    and event_type in (
      'page_view',
      'product_view',
      'product_dwell',
      'product_share',
      'product_save',
      'product_unsave',
      'category_view',
      'search',
      'feed_view',
      'feed_like',
      'feed_unlike',
      'feed_share',
      'feed_product_click',
      'feed_watch',
      'feed_video_start',
      'feed_video_complete',
      'feed_video_retention',
      'feed_favorite',
      'feed_comment_open',
      'feed_comment_submit',
      'feed_comment_view',
      'feed_comment_delete',
      'feed_comment_hide',
      'feed_comment_restore',
      'telegram_click',
      'phone_click',
      'directions_click',
      'ai_question',
      'price_offer',
      'contact_click',
      'feedback_submit'
    )
  );
