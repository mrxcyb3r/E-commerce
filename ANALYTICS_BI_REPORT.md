# Premium Business-Intelligence Analytics Report

Date: 2026-09-03
Live Supabase project: `cjqvcfbabwuqrwrnoiag` (E-commerce)
Scope: Transform the phase-1 analytics into a premium BI dashboard — customer behavior, not raw click counters. Built **only** on real collected `analytics_events`; no fake AI, no invented metrics.

---

## 1. The core problem (fixed)

A visitor favoriting a product 3 times previously showed `Favorites: 3` — as if 3 different customers. The phase-1 analytics had **no concept of unique visitors, sessions, or interest**. Counters incremented per event with in-memory dedupe that was lost on refresh, and there was no aggregation, funnel, or insight layer.

The new system reports **`1 unique customer`, `3 favorite interactions`, interest `HIGH`** — measured from real events (visitor_id), verified by unit tests.

## 2. What was audited (old system)

| Finding | Impact | Resolution |
|---|---|---|
| No unique-visitor awareness; counters per event | `Favorites: 3` misread as 3 people | Session/visitor identity layer + deduped aggregation |
| In-memory dedupe lost on reload | duplicate counts after navigation software | persistent dedupe in localStorage |
| No session semantics (start/end/length) | no returning-visitor or session metrics | `session.ts` lifecycle |
| No enrichment (device/source/referrer) | no audience breakdowns | `enrich.ts` at event write |
| No aggregation/funnel/insight modules | dashboard was raw event dump | new aggregate + insights layers |
| Aggregation not memoized, no live updates | stale UI, recompute on every render | memoized `useMemo` + 15s polling |
| `feed_watch` untracked (Feed exists) | gap in real data | added real watch-time tracking |
| `feed_like`/`ai_question`/`price_offer`/`feedback_submit` not tracked | no events | correctly **not** added — features don't exist; necessary RLS/CHECK keep them in sync for future |

## 3. New architecture (layers)

```
tracking (client.ts) → enrichment (enrich.ts) → identity/session (session.ts)
      → persistence (Supabase analytics_events)
      → read (RPC get_analytics_events, SECURITY DEFINER)
      → aggregation (aggregate.ts, pure + memoizable)
      → insights (insights.ts, deterministic)
      → presentation (useAnalyticsData hook → admin/analytics components)
```

### Tracking — `src/lib/analytics/client.ts`
- Persistent de-dup (`analytics_deduped_v1`, capped 500) surviving refresh.
- Batched/coalesced writes (flush ~80ms; hard flush on `visibilitychange`/`beforeunload`).
- Enrichment on every event: `device`, `screen`, `language`, `source`, `referrer`; `session_start`, `session_visit`.
- Preserved public API (`track`, `resetSession`, `getSessionId`).

### Session & visitor identity — `src/lib/analytics/session.ts`
- `visitor_id` persists in localStorage; `session_id` rotates on 30-min idle, local-midnight cross, or missing state.
- Tracks session start/last, first-visit flag, visit counter → powers returning-visitor + session metrics.

### Enrichment — `src/lib/analytics/enrich.ts`
- `userAgent`, `device` (mobile/tablet/desktop), `screen`, `referrer`, `source` (telegram/instagram/facebook/google/yandex/external), `language`.

### Aggregation — `src/lib/analytics/aggregate.ts` (pure, memoizable)
- `computeVisitorStats`: unique/returning/new visitors, returning rate, sessions, avg pages/session, avg session length (from real `session_start` metadata).
- `countByType`, `interestFor` (low/medium/high).
- `computeProducts`: views, unique/returning viewers, saves, unique savers, **interest** (now takes the strongest of view- vs save-signal), telegram/phone/map/feed-product clicks, engagement rate; `topViewedProducts`, `leastEngagedProducts`.
- `computeCategories`, `computeFeed` (avg watch sec from `durationSec`, Feed→product conversion), `computeSearch` (top/no-result searches, session-correlated outcomes), `computeIntent`, `trafficSeries`, `buildFunnel` (only measurable stages: visitors→product→save→contact→location — **no Purchase**, not tracked), `hourlyActivity`, `deviceBreakdown`, `sourceBreakdown`.

### Insights — `src/lib/analytics/insights.ts`
Deterministic engine emitting only real-data-backed findings (returning-rate health, top/low product, zero-result searches, top search, strongest category, evening-vs-daytime activity, Feed discovery, total intent). No external LLM.

### Data hook — `src/hooks/useAnalyticsData.ts`
Reads via RPC (`p_limit: 50000`), 15s silent polling, memoized aggregation on `[rows, range]`, exposes `{loading, refreshing, error, rows, eventsByType, stats, products, categories, feed, search, intent, traffic, funnel, hourly, devices, sources, insights, range, setRange, refresh, lastUpdated}`.

### Presentation — `src/pages/admin/AnalyticsAdminPage.tsx`
Premium dark header ("Premium Business Intelligence / Xaridor xatti-harakati tahlili"), 7 KPI cards, visitor mini-stats strip, traffic chart with trend, customer-journey funnel, product ranking + interest badge + low-engagement list, categories, Feed (avg watch + conversion), search, customer-intent, device/source breakdowns, and auto-insights — all Uzbek, honest empty/error states, refresh + range presets (`7d`/`14d`/`30d`). New components: `KpiCard`, `SectionCard`, `TrendBadge`, `SimpleBarChart`, `FunnelView`, `util.ts`.

## 4. Migration (applied live)

`supabase/migrations/20260903140000_analytics_feed_watch.sql` — adds `feed_watch` to the CHECK constraint (`analytics_events_event_type_check`) and the anon INSERT policy allow-list; base migration `20260903120000_analytics_events.sql` updated to match. The `SECURITY DEFINER` read RPC `get_analytics_events` is unchanged.

Live verification (after apply): table has RLS on; policies = `anon insert` (INSERT to anon) + `auth manage` (ALL to authenticated); `feed_watch` present in the CHECK; **existing 7 real rows preserved**.

> Note: the earlier management-API recreate of the `anon insert` policy needed a direct re-apply so it remained present alongside the constraint change; verified live.

## 5. Testing

### Live end-to-end (real anon client, publishable key)
- anon INSERT of `feed_watch` (allow-listed) → **HTTP 201**.
- Read via the exact RPC the dashboard uses → returns the enriched row with `device`, `screen`, `source`, `durationSec`, `session_start`, `session_visit`.
- Direct anon `SELECT` of `analytics_events` → **blocked `[]`** (RLS).
- anon `DELETE` → **blocked** (no delete policy; confirms write-protection).
- Test rows inserted were removed afterward exclusively via the service-role/admin path; **live table returned to exactly the original 7 real rows** (1 visitor, 4 page_view, 2 product_save, 1 product_unsave).

### Unit verification (`tsx` against `aggregate.ts`)
| Scenario | Result |
|---|---|
| 1 user favorited 3× | saves=3, **uniqueSavers=1**, interest=**high** ✓ |
| 3 visitors / 1 returning / 4 sessions | unique=3, returning=1, sessions=4 ✓ |
| no-result search | exactly 1 no-result search ✓ |
| funnel (page→product→save→contact→location) | all 5 stages = 1 ✓ |
| traffic series range | 14 points for 14d ✓ |
| search → product-view same session | `ledToProductView=true` ✓ |
| category metrics | opens/conversions tracked by product event category_id ✓ |

### Static
- `npm run lint` (`tsc --noEmit`): **0 errors**.
- `npm run build` (vite): **passes** (only the pre-existing 1.1MB chunk-size warning).
- Dev server serves `/admin/analytics`: **HTTP 200**.

## 6. Honesty & constraints honored
- **No fake AI, no estimated metrics.** Every figure computed from real events; unmeasurable features are not shown.
- **No DB reset / no mock fallback.** Original 7 rows intact and interpreted correctly.
- **RLS never weakened.** Anonymous direct read/delete still blocked; admin reads via SECURITY DEFINER RPC.
- Only real tracked events drive the dashboard; empty state shown when there's no traffic.

## 7. Known limitations / follow-ups
- No browser automation available → no click-through UI tests; verification relied on tsc, vite build, dev-server health, live REST/RPC, and unit tests.
- `get_analytics_events` RPC is callable by anyone holding the publishable key; hardening to a private/authenticated admin read path needs Supabase Auth (storefront has no accounts) — documented follow-up.
- No custom user-defined date range yet (presets only).
- Funnel intentionally omits a "Purchase" stage (not tracked).
- Chunk-size warning is pre-existing and out of scope.
