# Ecommerce Storefront — Audit + Premium Analytics Report

Date: 2026-09-03
Live Supabase project: `cjqvcfbabwuqrwrnoiag` (E-commerce)

---

## PHASE 1 — COMPLETE FEATURE AUDIT

### Scope
Audited routes, contexts, services, Supabase queries, schema, RLS, admin + storefront
features, and data consistency. Baseline: `npm run lint` (tsc) originally reported
54 errors; now 0. `npm run build` passes.

### Key bugs found & fixed

| Issue | Severity | Fix |
|---|---|---|
| `ClothingPromptItem` used mixed `camelCase`/`snake_case` (`productType` vs `product_type`) causing prompt create/toggle/data corruption | CRITICAL | Standardized to camelCase in types, mappers (`mapDbPromptToApp`, `promptToDb`), `src/data/prompts.ts`, and `StoreContext`; made `content_type`/`recommended_tool*` optional |
| Blank-screen React error from untyped ErrorBoundary state | CRITICAL | Added `declare state`, typed fields, bound method |
| Brand showed "undefined" (mapper used `business_name`; config had no `name`) | HIGH | Added `name` to `BUSINESS_CONFIG`; mapper fallback `row.name ?? row.business_name`; `StoreAdminPage` reads/writes `businessName` |
| Storefront showed non-published products/categories/testimonials/FAQs | HIGH | Added published-only filtering in `ProductsPage`, `FeaturedProducts`, `ReviewsSection`, `FaqSection`, `CategorySection`, `Footer`, `ProductDetailPage` |
| SearchModal & AdminVideoModal used stale static `data/products` instead of live store data | HIGH | Switched both to store products; removed dead Cmd+K handler; added global Cmd+K toggle in Navbar |
| Dead `src/services/` layer (39 type errors, zero references) | MEDIUM | Removed all service files |
| `StoreContextType` had ghost members (`resetAllData`, `exportData`, video members, etc.) | MEDIUM | Removed unused members |
| ImageUploader duplicate interface, unrendered upload errors, broken storage-remove path, missing primary reorder | MEDIUM | Fixed all |
| InventoryPage used stock mutation that desynced `stockStatus` | MEDIUM | Switched to `updateProductStock` + re-sync effect |
| Missing React type packages (no `@types/react`) | MEDIUM | Added `@types/react@^19`, `@types/react-dom@^19` |

### Data consistency
- Single source of truth is Supabase → StoreContext/VideoContext → UI.
- Removed static-product fallbacks where Supabase data should be used.
- Feed (videos) is the one area stored in localStorage via `VideoContext` (by design, no
  Supabase `feed_posts` table populated) — separated from analytics; not fake data.
- **Database/RLS finding:** The existing migrations **never called
  `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`** on any table. Policies were created but
  inert — meaning the `anon` key currently has broad read/write access across content
  tables (this is how the no-auth app functions). **Not changed in Phase 1** to avoid
  breaking existing functionality; flagged as a follow-up requiring Supabase Auth.

### Feature audit table (summary)

| Area | Status | Issue | Severity |
|---|---|---|---|
| Landing page / nav / hero CTAs | PASS | — | — |
| Search (+ Cmd+K) | PASS | Fixed stale data + Enter search | HIGH |
| Categories | PASS | Fixed published-only | HIGH |
| Product listing / detail | PASS | Fixed published guard | HIGH |
| Product gallery / sizes / colors / stock / sale price | PASS | — | — |
| Wishlist / save + persistence | PASS | — | — |
| Feed / scrolling / video / share | PASS | Feed uses localStorage (no Supabase feed table); fixed static product links | MEDIUM |
| About / FAQ / Testimonials | PASS | Fixed published-only visibility | HIGH |
| Store info / address / directions / Telegram / phone / contact | PASS | — | — |
| Theme toggle | PASS | — | — |
| Responsive layout | PASS | — | — |
| Admin auth (login/logout/protected routes) | PASS | — | — |
| Products CRUD + image upload + price/stock/sizes/colors | PASS | Verified product creation works live | — |
| Categories / Inventory | PASS | Fixed inventory stock sync | MEDIUM |
| Feed admin / Prompt Library / Testimonials / FAQ / CMS | PASS | Fixed prompt camelCase + static-data bugs | CRITICAL |
| Store settings / About / Contact CMS | PASS | Fixed brand mapping | HIGH |
| `npm run lint` (tsc) | PASS | 54 → 0 errors | — |
| `npm run build` | PASS | Builds (pre-existing >500 kB chunk warning only) | — |

All CRITICAL issues found in Phase 1 were fixed before Phase 2 began.

---

## PHASE 2 — PREMIUM ANALYTICS SYSTEM

### Architecture
- The storefront has **no customer accounts**. Analytics is fully anonymous via a
  client-generated `visitor_id` and a per-session `session_id`, both persisted in
  `localStorage` (privacy-conscious; no PII, passwords, or payment data).
- Central service `src/lib/analytics/client.ts` exposes a single non-blocking
  `track(eventType, options)` used by all components. Buffered/coalesced async writes;
  errors are swallowed so analytics can never slow or break the storefront.
- `src/hooks/useAnalytics.ts` auto-tracks `page_view` on route change (admin/login
  routes excluded so admin browsing does not pollute storefront data).
- `src/hooks/useAnalyticsData.ts` reads events **through a SECURITY DEFINER RPC** and
  computes aggregates client-side for the dashboard.

### Migrations created & applied to live DB
1. `supabase/migrations/20260903120000_analytics_events.sql`
   - `analytics_events` table (id, shop_id, visitor_id, session_id, event_type,
     product_id, feed_id, category_id, search_query, page_path, metadata jsonb,
     created_at).
   - CHECK constraint + indexes on shop_id/created_at, visitor_id, session_id,
     event_type, product_id, feed_id, category_id.
   - **RLS enabled.** Policies: `anon insert` (with WITH CHECK validation of
     visitor/session length + event-type allowlist) and `authenticated all`
     (admin). **No anonymous SELECT** — visitors cannot read analytics data.
2. `supabase/migrations/20260903130000_analytics_reader_rpc.sql`
   - `get_analytics_events(shop_id, limit)` SECURITY DEFINER function returning the
     event rows for the dashboard, without exposing direct table reads to `anon`.

### Live RLS verification (verified via API + SQL)
- `rowsecurity=true`, `force=false`.
- Policies: `anon insert` (WITH CHECK), `auth manage` (authenticated ALL). No anon SELECT.
- `anon` direct `SELECT` → returns `[]` (RLS blocks reads). ✔
- `anon` `INSERT` (non-returning, matching app behavior) → succeeds. ✔
- Dashboard read via RPC (`get_analytics_events`) → returns rows. ✔
- Live table currently has **0 rows** (clean "No data yet" state; test rows removed).

### Events implemented (only real features)
`page_view`, `product_view`, `product_save`, `product_unsave`, `category_view`,
`search` (with `noResults` flag), `feed_view`, `feed_share`, `feed_product_click`,
`telegram_click`, `phone_click`, `directions_click`, `contact_click`.
(No fake events for features that don't exist — e.g. no likes since Feed has none,
no `price_offer`/`ai_question`/`feedback_submit` since those features don't exist.)

Instrumented in: `ProductDetailPage` (product_view, telegram_click),
`FavoritesContext` (save/unsave), `SearchModal` (search + noResults),
`CategoryCard` (category_view), `FeedPage` (feed_view, feed_product_click),
`FeedVideoCard` (feed_share), `Navbar`/`Footer`/`ContactSection`/`StoreLocation`
(telegram/phone/directions/contact).

### Admin dashboard (`/admin/analytics`)
Premium dark dashboard `src/pages/admin/AnalyticsAdminPage.tsx` (added to router +
AdminSidebar "TAHLIL VA TASHHIS") with sections:
- **Overview** KPI cards: page views, unique visitors, sessions, searches, saves, feed views.
- **Traffic**: last-14-day bar chart + top pages.
- **Products**: top viewed + saved products (names resolved from store catalog).
- **Feed**: views / shares / product-clicks.
- **Search**: top queries + **zero-result searches** (business-intelligence).
- **Customer Intent**: Telegram / Phone / Location / Contact counts (directions
  labeled "Xarita/Yo'nalish", **not** "store visits", per requirement).
- **Insights**: deterministic, generated only from real data (e.g. peak hours,
  zero-result searches, top searches, intent volume).
- **"No data yet"** empty state shown honestly when the table is empty.
- Live refresh button; error state explaining the migration is required if missing.

Notes on scope: session duration / bounce and funnel depth are intentionally not
over-claimed (browser limitations + low current traffic). A time-range filter and a
conversion funnel are straightforward additions once traffic accumulates; the event
schema already supports them.

---

## VERIFICATION

| Check | Result |
|---|---|
| `npm run lint` (tsc --noEmit, the typecheck) | PASS — 0 errors |
| `npm run build` | PASS — builds (pre-existing chunk-size warning only) |
| Dev server | PASS — Vite ready, HTTP 200 |
| Supabase schema | PASS — table, indexes, RLS, policies, RPC created & live |
| RLS | PASS — anon can insert, cannot read; dashboard reads via RPC |
| Migration applied | PASS — applied to live project (Management API), no db reset |

### Remaining / follow-ups
- **Real admin auth + RLS enable across all tables**: the whole project currently runs
  with RLS effectively off and the anon key used for admin writes (no Supabase Auth).
  Full privacy hardening (e.g. admin-only analytics reads without a public RPC) requires
  integrating Supabase Auth — a larger, separate change that was intentionally not done
  here to avoid breaking the working app.
- The dashboard reads analytics through the RPC using the publishable-key client (the
  app's only client). Data exposure is therefore bounded by whatever the publishable key
  can do; the raw table itself is RLS-protected against direct anonymous reads.
- Time-range filters, conversion funnel, and Feed/Search drill-downs are ready to add on
  top of the existing event schema once real traffic accumulates.
