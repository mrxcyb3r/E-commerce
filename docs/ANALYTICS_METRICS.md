# Analytics — canonical metric definitions

Code source of truth: `src/lib/analytics/metrics.ts`.
Aggregations: `src/lib/analytics/aggregate.ts`, `src/lib/analytics/advanced.ts`.
Tracking client: `src/lib/analytics/client.ts` (+ `session.ts`, `enrich.ts`).
Schema: `supabase/migrations/20260903120000_analytics_events.sql` +
`20260907120000_analytics_event_types_complete.sql` (32 event types).

## Identity

- **Visitor** = `analytics_visitor_id` in localStorage (random UUID, persists).
- **Session** = `analytics_session_id`; rotates after 30 min inactivity or new
  local day. `session_visit` counts visits (localStorage `analytics_visit_count`).
- All wall-clock bucketing uses **Asia/Tashkent (UTC+5, no DST)**.

## Event taxonomy (existing names reused)

| event | meaning | dedupe |
|---|---|---|
| `page_view` | route change (non-admin), with `page_path` | same path within 2 s skipped (double-fire guard) |
| `product_view` | product detail opened (`product_id`, `category_id`) | once per visitor per product (localStorage) |
| `product_dwell` | seconds + max scroll on product page unload | every unload ≥1 s |
| `product_save` / `product_unsave` | favorite toggle | every toggle |
| `category_view` | category card/collection click | once per visitor per category |
| `search` | search submitted (`search_query`, `metadata.noResults`) | every submit |
| `feed_view` | feed video became active | once per visitor per video |
| `feed_video_start/complete/retention/watch` | playback telemetry | every occurrence |
| `feed_like` (action like/unlike), `feed_favorite` (save/unsave), `feed_share`, `feed_product_click`, `feed_comment_*` | feed interactions | every occurrence |
| `telegram_click` (+`product_id` on PDP), `phone_click`, `directions_click`, `contact_click` | contact actions | every click |
| `product_share` (+`method`) | product share | every share |

**Intent (contact) canonical set** = telegram + phone + directions + contact.
Every intent total uses all four.

## Metric definitions

- **Visitors** — unique `visitor_id` in range.
- **Sessions** — unique `session_id` in range (all event types).
- **Page views** — `page_view` event count in range.
- **Product views** — `product_view` event count; **unique viewers** — visitors
  with ≥1 `product_view`. Dashboard "today" cards use the same event.
- **Saves** — `product_save` event count ("saqlash hodisalari"); the live
  favorites list is a different concept and is labeled separately.
- **Searches** — `search` event count; **unique searchers** — visitors.
- **Telegram / Phone / Location / Contact** — respective click event counts.
- **Video views** — `feed_view` count; **unique viewers** — visitors with a
  `feed_view`. Watch time = summed `feed_watch.durationSec` (measured).
- **Shares** — `product_share` + `feed_share` event counts (shown separately
  per section).
- **Devices / sources / audience** — UNIQUE VISITORS per attribute value
  (a visitor on two devices counts in both).
- **Bounce rate** — sessions with exactly 1 `page_view` / sessions with ≥1
  `page_view`. **Return rate** — visitors with any `session_visit > 1` /
  all visitors.
- **Conversion-style rates** — always unique-visitors / unique-visitors
  (e.g. savers/viewers, intent visitors/visitors); `null` → UI shows "—".
- **Growth** — current range vs previous equal-length range; `null` change
  (previous = 0) shows "yangi", never 0%.
- **Journeys** — per-session `page_view` paths, consecutive duplicates
  collapsed, query strings stripped for grouping, top 10.
- **Funnel stages** — independent per-stage visitor sets, NOT a sequential
  cohort (disclosed in UI subtitle).

## Known data notes

- Events fired before migration `20260907120000` for types outside the old
  20-value DB allowlist were rejected by the CHECK constraint (bulk inserts
  are atomic, so whole batches were lost). The migration widens the allowlist
  to all 32 client event types, and the client now retries failed batches
  row-by-row.
- `category_view` fires on card clicks, not category page opens; direct
  product opens usually have no preceding `category_view` — category "views"
  therefore undercount exposure, while product opens are shown alongside.
- Actions without a view (share/contact from feed or lists) are legitimate:
  counts and unique-viewer rates are shown side by side, never forced equal.
- `NIke` brand typo and empty homepage slides are CONTENT issues in
  production data — fix via admin UI, not code.
