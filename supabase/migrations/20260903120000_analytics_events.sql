-- Supabase Migration: Analytics Events
-- Anonymous, privacy-conscious product/feed/search/intent analytics for the
-- local-commerce storefront. The storefront has NO customer accounts, so all
-- analytics are keyed by an anonymous visitor id generated client-side.
--
-- Security model:
--   * Anonymous visitors can only INSERT events (must be able to record behavior).
--   * Anonymous visitors CANNOT read/update/delete any analytics data.
--   * Authenticated (owner/admin) users can read and manage events for the dashboard.
--   * Event type is validated against an allowlist via a CHECK constraint and the
--     INSERT policy uses a WITH CHECK to prevent arbitrary writes.

-- ============================================================
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  shop_id text not null default 'default',
  visitor_id text not null,
  session_id text not null,
  event_type text not null check (
    event_type in (
      -- Visitor page events
      'page_view',

      -- Product events
      'product_view',
      'product_dwell',
      'product_share',
      'product_save',
      'product_unsave',

      -- Category events
      'category_view',

      -- Search events
      'search',

      -- Feed events
      'feed_view',
      'feed_like',
      'feed_unlike',
      'feed_share',
      'feed_product_click',
      'feed_watch',
      'feed_comment_open',
      'feed_comment_submit',
      'feed_comment_view',
      'feed_comment_delete',
      'feed_comment_hide',
      'feed_comment_restore',

      -- Intent events
      'telegram_click',
      'phone_click',
      'directions_click',
      'contact_click',

      -- AI events
      'ai_question',
      'price_offer',

      -- Feedback
      'feedback_submit'
    )
  ),
  product_id text,
  feed_id text,
  category_id text,
  search_query text,
  page_path text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indexes for the analytical queries the dashboard runs.
create index if not exists analytics_events_shop_created_idx
  on public.analytics_events (shop_id, created_at desc);
create index if not exists analytics_events_visitor_idx
  on public.analytics_events (visitor_id);
create index if not exists analytics_events_session_idx
  on public.analytics_events (session_id);
create index if not exists analytics_events_type_idx
  on public.analytics_events (event_type);
create index if not exists analytics_events_product_idx
  on public.analytics_events (product_id);
create index if not exists analytics_events_feed_idx
  on public.analytics_events (feed_id);
create index if not exists analytics_events_category_idx
  on public.analytics_events (category_id);

-- ============ RLS ============
alter table public.analytics_events enable row level security;

-- Anonymous visitors may insert events (record behavior).
-- WITH CHECK enforces a non-trivial visitor/session id and a valid event type so
-- anonymous users cannot inject arbitrary/malicious rows.
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

-- Authenticated (owner/admin) users can read and manage analytics.
drop policy if exists "auth manage analytics events" on public.analytics_events;
create policy "auth manage analytics events" on public.analytics_events
  for all to authenticated
  using (true)
  with check (true);

-- ============ Grants ============
-- anon: insert only (read is blocked by RLS).
grant insert on public.analytics_events to anon;
-- authenticated: full management for the admin dashboard.
grant select, insert, update, delete on public.analytics_events to authenticated;
