-- Supabase Migration: converge analytics allowlist to Shop Operations events
--
-- Phase 9-11 added customer-intent and operations events (buy_list_*, buy_session_*,
-- onboarding_*, sale_*, campaign_*, dashboard_task_completed, activity_opened, ...) to the
-- TypeScript AnalyticsEventType union, but the DB allowlist (20260907120000, 31 values) was
-- never extended. Rows for those new types were rejected per-row by the client's fallback,
-- so owner analytics silently missed them. This migration converges both the column CHECK
-- and the anon INSERT policy to the exact current union (62 values).
--
-- Re-runnable (DROP IF EXISTS guards per docs/MIGRATIONS.md). No table or RLS semantic
-- changes: anonymous INSERT-only + authenticated full manage stays as-is. Existing rows are
-- unaffected (the constraint only gates future writes).
--
-- Guard queries (before AND after):
--   select pg_get_constraintdef(oid) from pg_constraint
--   where conname = 'analytics_events_event_type_check';
--   select policyname, with_check from pg_policies
--   where tablename = 'analytics_events' and policyname = 'anon insert analytics events';
-- Pass = all listed types present, length guards intact.

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
      'feedback_submit',
      'buy_list_add',
      'buy_list_remove',
      'buy_list_open',
      'buy_list_move_to_favorites',
      'buy_session_created',
      'buy_session_regenerated',
      'buy_session_shared',
      'buy_session_copied',
      'buy_session_expired',
      'buy_session_opened',
      'homepage_view',
      'related_product_click',
      'onboarding_started',
      'onboarding_completed',
      'product_created',
      'video_uploaded',
      'homepage_published',
      'store_completed',
      'dashboard_quick_action',
      'notification_clicked',
      'sale_completed',
      'sale_cancelled',
      'sale_partial',
      'buy_session_loaded',
      'buy_session_searched',
      'inventory_issue_fixed',
      'campaign_created',
      'campaign_started',
      'campaign_finished',
      'dashboard_task_completed',
      'activity_opened'
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
      'feedback_submit',
      'buy_list_add',
      'buy_list_remove',
      'buy_list_open',
      'buy_list_move_to_favorites',
      'buy_session_created',
      'buy_session_regenerated',
      'buy_session_shared',
      'buy_session_copied',
      'buy_session_expired',
      'buy_session_opened',
      'homepage_view',
      'related_product_click',
      'onboarding_started',
      'onboarding_completed',
      'product_created',
      'video_uploaded',
      'homepage_published',
      'store_completed',
      'dashboard_quick_action',
      'notification_clicked',
      'sale_completed',
      'sale_cancelled',
      'sale_partial',
      'buy_session_loaded',
      'buy_session_searched',
      'inventory_issue_fixed',
      'campaign_created',
      'campaign_started',
      'campaign_finished',
      'dashboard_task_completed',
      'activity_opened'
    )
  );