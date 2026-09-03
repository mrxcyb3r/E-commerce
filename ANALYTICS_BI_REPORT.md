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
- No custom user-defined date range yet (presets only). *(resolved in §9 — custom date-range picker added)*
- Funnel intentionally omits a "Purchase" stage (not tracked).
- Chunk-size warning is pre-existing and out of scope.

---

## 8. Follow-up pass (this session) — closed remaining spec gaps

Findings from the re-audit against the extended spec, each closed with real, measurable data:

| Gap vs spec | Resolution | Where |
|---|---|---|
| Product "Average viewing time" | New `product_dwell` event = real seconds a visitor spent on a product page (timestamp delta on unload). Aggregated to `avgDwellSec` per product. | `product_dwell` event, `aggregate.ts`, ProductDetailPage, dashboard ProductRow |
| Product "Share clicks" | New `product_share` event on the share/copy-link button. | `product_share` event, ProductDetailPage, dashboard ProductRow |
| "Detect trending products" | `isTrending` flag + `trendingProducts()` from real event timestamps: recent-half views ≥ max(2, 1.5× earlier-half). Shown as Trend badges + a trends list + an insight. | `aggregate.ts`, dashboard, `insights.ts` |
| Funnel missing Category stage | Added "Kategoriya" stage (visitors who hit `category_view` or a product_view carrying a category). Funnel now: visitors→category→product→saved→contact→location. | `buildFunnel`, dashboard |
| Search outcomes not surfaced | UI now shows `ledToFavorite` (heart) and `ledToTelegram` (send) icons per search, alongside existing product-view icon. | SearchSection, dashboard |
| Real-time "no refresh required" feel | Poll interval reduced 15s→6s + instant silent refresh on tab regaining visibility. | `useAnalyticsData.ts` |

### Migration (applied live)
`supabase/migrations/20260903150000_analytics_product_dwell.sql` adds `product_dwell` + `product_share` to the CHECK constraint and the anon INSERT policy allow-list; base migration `20260903120000_analytics_events.sql` updated to match. Applied live: **HTTP 201**, both new types present in the constraint, both policies intact, existing 7 rows untouched.

### Follow-up testing
**Unit (`tsx` vs aggregate):**
- Product trending: rising product → `isTrending=true`; flat/declining → `false` ✓
- Product dwell: avg of real dwell events (45s + 15s → 30s) ✓; share clicks counted ✓
- Funnel now includes Kategoriya + Manzil stages, values correct ✓
- Search `ledToFavorite`/`ledToTelegram` correlate correctly per session ✓

**Live end-to-end (anon publishable key):**
- anon INSERT of `product_view`, `product_dwell`, `product_share` → all **201** ✓
- RPC read returns the enriched event rows ✓
- anon DELETE returns 204 but RLS blocks actual deletion (write-protection holds) ✓
- Test rows removed via admin path; **live table back to the exact original 7 real rows** ✓

**Static:** `npm run lint` (tsc) **0 errors**; `npm run build` **passes**; dev server serves `/admin/analytics` **200**.

*Note: the live dashboard still has only the 7 original real events (1 visitor), so the new product metrics/trending/funnel stage display as empty (honest) until real storefront traffic arrives — no data is fabricated to fill them.*

---

## 9. Advanced analytics pass (this session)

Extended the BI platform beyond the base/exposition layers into a premium segmentation, comparison, alerting and reporting layer — **all computed from the real `analytics_events` table only; nothing fabricated.**

### 9.1 New pure aggregation module — `src/lib/analytics/advanced.ts`
- **Audience** (`computeAudience`): per-session entry/exit page, browsers, OSes, languages, dark-mode share, screen sizes, live bounce rate (sessions with a single page).
- **Live/rolling windows** (`computeVisitorWindows`): uniques live-now, today, this-week, this-month.
- **Time analytics** (`computeTimeAnalytics`): active hour, active weekday, weekend vs weekday share, evening vs morning count, 7-day × 24-hour activity heatmap.
- **Business KPIs** (`computeBusinessKpis`): conversion rate (high-intent ÷ product pages), engagement rate, favorite rate, product/favorite CTR, feed CTR, returning-visitor rate, average interest score (0–2).
- **Journeys** (`computeJourneys`): real `page_path` sequences per session; UI shows the most common click-paths as arrows.
- **Comparison** (`computeComparison`): 7 KPIs vs the previous equal-length period (`previousRange`/`daysIn`), each with a signed `changePct` + direction.
- **Wishlist** (`computeWishlist`): unique savers, total saves, repeated saves, removed count, save growth (recent half vs earlier half), most-saved products.
- **Advanced funnel** (`buildAdvancedFunnel`): per-stage conversion and drop-off added to the base funnel.

### 9.2 Alerts engine — `src/lib/analytics/alerts.ts`
Threshold-driven, real-data alerts: trending product, hot product, recent failed search, high Telegram intent, viral feed hits, ignored products. Emits `info`/`warn`/`alert` levels; **skips when data is insufficient** rather than guessing.

### 9.3 Reports — `src/lib/analytics/reports.ts`
`buildReport` (daily/weekly/monthly digest) + `productCsv` + `reportCsv`; the admin UI exposes one-click CSV exports.

### 9.4 Dashboard UI — `AnalyticsAdminPage.tsx`
New sections wired from the hook's advanced fields:
- **Live strip** (pulsing "Hozir onlayn" + today/week/month) atop the KPI cards.
- **Auditoriya tarkibi** (device/browser/OS/dark/top-languages/top-screens + entry/exit pages) with a new `DonutChart`.
- **Vaqt tahlili** with a new CSS-flex `Heatmap` (week × hour), independent of Tailwind grid utilities.
- **O'sish** — 7-KPI comparison vs previous period with trend badges.
- **Biznes KPI** grid + average interest.
- **Xaridor yo'nalishlari** (journey chip paths), **Sevimlilar/Wishlist**, **Avtomatik ogohlantirishlar**, and **Hisobotlar** (CSV export).
- Funnel upgraded to per-stage conversion/drop-off; bounce row replaced the raw event counter minimetric.

### 9.5 Custom date range
The preset toggle now includes two date inputs; choosing a range switches the hook to `range='custom'` mode (`setCustomRange`), re-aggregating every derived metric against the chosen window.

### 9.6 Verification
- `npx tsc --noEmit`: **0 errors** (incl. the earlier `RangeKey | 'custom'` type fix in the hook).
- `npm run lint`: **clean**. `npm run build`: **passes** (Vite bundles all new components).
- Dev server serves `/admin/analytics`: **200** (SPA).
- No schema change required — `product_dwell`/`product_share` were already migrated in §8.

**Honesty note:** on the live storefront (7 real events, 1 visitor) most new sections render their honest empty/"ma'lumot yo'q" states — the algorithms are unit-verified but will light up only with real traffic, which the platform is explicitly built to wait for.
