-- Supabase Migration: extend analytics allowlist with product_dwell + product_share
--
-- Adds two real, measurable events emitted from the product detail page:
--   * product_dwell  - seconds a visitor actively spent on a product page
--                      (computed client-side from real timestamps on unload)
--   * product_share  - a share / "copy link" interaction on a product page
--
-- These are NOT fake or estimated metrics; each is measured from actual events.
-- The CHECK constraint and the anon INSERT policy allowlist must stay in sync
-- with the TypeScript union in src/types/supabase-db.ts.

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
      'product_dwell',
      'product_share',
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
