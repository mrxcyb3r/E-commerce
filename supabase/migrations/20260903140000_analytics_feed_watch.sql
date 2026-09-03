-- Supabase Migration: Analytics event allowlist extension
-- Adds feed_watch (video watch-time) to the event_type allowlist. This is a
-- real, measurable event emitted from the Feed video player; it is NOT a fake or
-- estimated metric. The CHECK constraint and the anon INSERT policy allowlist
-- must be kept in sync with the TypeScript union in src/types/supabase-db.ts.

-- The original inline column CHECK gets the default name <table>_event_type_check.
alter table public.analytics_events
  drop constraint if exists analytics_events_event_type_check;

alter table public.analytics_events
  add constraint analytics_events_event_type_check check (
    event_type in (
      'page_view',
      'product_view',
      'product_save',
      'product_unsave',
      'category_view',
      'search',
      'feed_view',
      'feed_like',
      'feed_share',
      'feed_product_click',
      'feed_watch',
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
      'product_save',
      'product_unsave',
      'category_view',
      'search',
      'feed_view',
      'feed_like',
      'feed_share',
      'feed_product_click',
      'feed_watch',
      'telegram_click',
      'phone_click',
      'directions_click',
      'ai_question',
      'price_offer',
      'contact_click',
      'feedback_submit'
    )
  );
