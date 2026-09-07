// Advanced analytics aggregations. Pure, deterministic, memoizable — every value
// is derived strictly from real analytics_events (no estimation, no fabrication).
// These complement the core module (aggregate.ts) with higher-level, dashboard-level
// metrics: audience composition, time analytics, growth, journeys, KPIs, reports.

import type { AnalyticsEvent } from '../../types/supabase-db';
import {
  withinRange,
  startOfUtcDay,
  type DateRange,
  type ProductMetric,
  type CategoryMetric,
  type FeedMetric,
  type InterestLevel,
} from './aggregate';
import {
  tashkentParts,
  startOfTashkentDay,
  startOfTashkentWeek,
  startOfTashkentMonth,
  collapseJourney,
  journeyKey,
  rateUnique,
} from './metrics';

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/** Build a range of equal length immediately preceding `range` (for comparison). */
export function previousRange(range: DateRange): DateRange {
  const to = startOfUtcDay(new Date(range.from + 'T00:00:00Z'));
  const len = daysIn(range);
  to.setDate(to.getUTCDate() - 1);
  const from = new Date(to);
  from.setDate(from.getUTCDate() - (len - 1));
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export function daysIn(range: DateRange): number {
  const a = new Date(range.from + 'T00:00:00Z').getTime();
  const b = new Date(range.to + 'T00:00:00Z').getTime();
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

// ---------------------------------------------------------------------------
// Audience composition
// ---------------------------------------------------------------------------

export interface BreakdownRow {
  label: string;
  value: number;
}

export interface Audience {
  entryPages: BreakdownRow[];
  exitPages: BreakdownRow[];
  browsers: BreakdownRow[];
  oses: BreakdownRow[];
  languages: BreakdownRow[];
  darkMode: BreakdownRow[];
  screens: BreakdownRow[];
  bounceRate: number; // 0..1 sessions with exactly one page_view / total sessions
}

function metaStr(e: AnalyticsEvent, key: string): string {
  const v = e.metadata?.[key];
  return typeof v === 'string' && v ? v : 'unknown';
}

/**
 * Visitor-basis variant: unique visitors per attribute value (a visitor on
 * two browsers counts in both). Event-count versions misled owners
 * ("Chrome 678" next to "55 visitors"); audience composition must be people.
 */
function visitorBreakdown(events: AnalyticsEvent[], key: (e: AnalyticsEvent) => string): BreakdownRow[] {
  const map = new Map<string, Set<string>>();
  for (const e of events) {
    const k = key(e);
    let s = map.get(k);
    if (!s) {
      s = new Set();
      map.set(k, s);
    }
    s.add(e.visitor_id);
  }
  return Array.from(map.entries())
    .map(([label, s]) => ({ label, value: s.size }))
    .sort((a, b) => b.value - a.value);
}

export function computeAudience(events: AnalyticsEvent[], range: DateRange): Audience {
  const inRange = events.filter((e) => withinRange(e, range));

  // Entry page: first page_view of each session; Exit page: last page_view.
  const sessions = new Map<string, { first: string | null; last: string | null; pageViews: number }>();
  const ordered = [...inRange]
    .filter((e) => e.event_type === 'page_view' && !!e.page_path)
    .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
  for (const e of ordered) {
    let s = sessions.get(e.session_id);
    if (!s) {
      s = { first: e.page_path!, last: e.page_path!, pageViews: 0 };
      sessions.set(e.session_id, s);
    }
    s.last = e.page_path!;
    s.pageViews += 1;
  }

  const entryCounts = new Map<string, number>();
  const exitCounts = new Map<string, number>();
  let singleViewSessions = 0;
  for (const s of sessions.values()) {
    if (s.first) entryCounts.set(s.first, (entryCounts.get(s.first) ?? 0) + 1);
    if (s.last) exitCounts.set(s.last, (exitCounts.get(s.last) ?? 0) + 1);
    if (s.pageViews === 1) singleViewSessions += 1;
  }
  const toRows = (m: Map<string, number>): BreakdownRow[] =>
    Array.from(m.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

  return {
    entryPages: toRows(entryCounts),
    exitPages: toRows(exitCounts),
    browsers: visitorBreakdown(inRange, (e) => metaStr(e, 'browser')),
    oses: visitorBreakdown(inRange, (e) => metaStr(e, 'os')),
    languages: visitorBreakdown(inRange, (e) => metaStr(e, 'language')),
    darkMode: visitorBreakdown(inRange, (e) => (e.metadata?.dark_mode === true ? 'dark' : 'light')),
    screens: visitorBreakdown(inRange, (e) => metaStr(e, 'screen')),
    bounceRate: sessions.size > 0 ? singleViewSessions / sessions.size : 0,
  };
}

// ---------------------------------------------------------------------------
// Live / today / week / month visitors
// ---------------------------------------------------------------------------

export interface VisitorWindows {
  liveNow: number; // unique visitors with an event in the last N minutes
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export function computeVisitorWindows(
  events: AnalyticsEvent[],
  range: DateRange,
  liveWindowMs: number
): VisitorWindows {
  // Absolute windows (live / today / week / month) are computed over ALL
  // loaded events, NOT filtered by the selected relative range — a past custom
  // range must not zero out "who is online now". Day bounds use Asia/Tashkent.
  void range;
  const now = Date.now();
  const liveCut = now - liveWindowMs;
  const live = new Set<string>();
  const today = new Set<string>();
  const week = new Set<string>();
  const month = new Set<string>();

  const todayStart = startOfTashkentDay(now);
  const weekStart = startOfTashkentWeek(now);
  const monthStart = startOfTashkentMonth(now);

  for (const e of events) {
    if (!e.created_at) continue;
    const t = new Date(e.created_at).getTime();
    if (!Number.isFinite(t)) continue;
    if (t >= liveCut) live.add(e.visitor_id);
    if (t >= todayStart) today.add(e.visitor_id);
    if (t >= weekStart) week.add(e.visitor_id);
    if (t >= monthStart) month.add(e.visitor_id);
  }

  return { liveNow: live.size, today: today.size, thisWeek: week.size, thisMonth: month.size };
}

// ---------------------------------------------------------------------------
// Time analytics
// ---------------------------------------------------------------------------

export interface TimeAnalytics {
  activeHour: number;
  activeDay: number; // 0..6 (0 = Sunday) with most events
  weekendShare: number; // 0..1 of events on Sat/Sun
  eveningCount: number;
  morningCount: number;
  totalEvents: number; // in-range events (honest denominator for shares)
  weekdayHourly: number[][]; // [day][hour] counts, day 0=Sun, hour 0-23
}

export function computeTimeAnalytics(events: AnalyticsEvent[], range: DateRange): TimeAnalytics {
  const inRange = events.filter((e) => withinRange(e, range) && !!e.created_at);
  const hourCounts = Array.from({ length: 24 }, () => 0);
  const dayCounts = Array.from({ length: 7 }, () => 0);
  const weekdayHourly = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));

  let weekend = 0;
  let evening = 0;
  let morning = 0;

  for (const e of inRange) {
    // Asia/Tashkent wall clock — "evening 18:00" means 18:00 in Uzbekistan,
    // not 18:00 UTC (which is 23:00 local).
    const { day: dow, hour: h } = tashkentParts(e.created_at!);
    hourCounts[h] += 1;
    dayCounts[dow] += 1;
    weekdayHourly[dow][h] += 1;
    if (dow === 0 || dow === 6) weekend += 1;
    if (h >= 18) evening += 1;
    if (h >= 5 && h < 12) morning += 1;
  }

  const total = inRange.length;
  const activeHour = argMax(hourCounts);
  const activeDay = argMax(dayCounts);

  return {
    activeHour,
    activeDay,
    weekendShare: total > 0 ? weekend / total : 0,
    eveningCount: evening,
    morningCount: morning,
    totalEvents: total,
    weekdayHourly,
  };
}

function argMax(arr: number[]): number {
  let best = 0;
  for (let i = 1; i < arr.length; i++) if (arr[i] > arr[best]) best = i;
  return best;
}

// ---------------------------------------------------------------------------
// Business KPIs
// ---------------------------------------------------------------------------

export interface BusinessKpis {
  // All visitor-based (uniqueVisitors(action) / uniqueVisitors(base)),
  // bounded 0..1, null when the base set is empty (UI shows "—").
  conversionRate: number | null; // unique intent visitors / unique visitors
  engagementRate: number | null; // unique engaged visitors / unique visitors
  favoriteRate: number | null; // unique savers / unique product viewers
  productCtr: number | null; // unique intent visitors among product viewers / unique product viewers
  feedCtr: number | null; // unique feed→product clickers / unique feed viewers
  returningRate: number;
  avgInterest: number; // 0..2 average of product interest scores
  bestProductViews: number;
  bestFeedViews: number;
}

export function computeBusinessKpis(input: {
  events: AnalyticsEvent[];
  range: DateRange;
  products: ProductMetric[];
  feed: FeedMetric[];
  categories: CategoryMetric[];
  returningRate: number;
}): BusinessKpis {
  const inRange = input.events.filter((e) => withinRange(e, input.range));
  const visitors = new Set<string>();
  const intentVisitors = new Set<string>();
  const engagedVisitors = new Set<string>();
  const productViewers = new Set<string>();
  const productIntentVisitors = new Set<string>();
  const savers = new Set<string>();
  const feedViewers = new Set<string>();
  const feedClickers = new Set<string>();

  for (const e of inRange) {
    visitors.add(e.visitor_id);
    switch (e.event_type) {
      case 'telegram_click':
      case 'phone_click':
      case 'directions_click':
      case 'contact_click':
        intentVisitors.add(e.visitor_id);
        engagedVisitors.add(e.visitor_id);
        break;
      case 'product_view':
        productViewers.add(e.visitor_id);
        break;
      case 'product_save':
      case 'product_share':
      case 'feed_like':
      case 'feed_share':
      case 'feed_favorite':
        engagedVisitors.add(e.visitor_id);
        break;
      case 'feed_view':
        feedViewers.add(e.visitor_id);
        break;
      case 'feed_product_click':
        feedClickers.add(e.visitor_id);
        engagedVisitors.add(e.visitor_id);
        break;
      default:
        break;
    }
    if (e.event_type === 'product_save') savers.add(e.visitor_id);
  }
  // Intent visitors restricted to product viewers (for product CTR).
  const productViewerSet = productViewers;
  for (const e of inRange) {
    if (
      productViewerSet.has(e.visitor_id) &&
      (e.event_type === 'telegram_click' ||
        e.event_type === 'phone_click' ||
        e.event_type === 'directions_click' ||
        e.event_type === 'contact_click')
    ) {
      productIntentVisitors.add(e.visitor_id);
    }
  }

  const score: Record<InterestLevel, number> = { low: 0, medium: 1, high: 2 };
  const withViews = input.products.filter((p) => p.views > 0);
  const avgInterest =
    withViews.length > 0 ? withViews.reduce((s, p) => s + score[p.interest], 0) / withViews.length : 0;

  return {
    conversionRate: rateUnique(intentVisitors.size, visitors.size),
    engagementRate: rateUnique(engagedVisitors.size, visitors.size),
    favoriteRate: rateUnique(savers.size, productViewers.size),
    productCtr: rateUnique(productIntentVisitors.size, productViewers.size),
    feedCtr: rateUnique(feedClickers.size, feedViewers.size),
    returningRate: input.returningRate,
    avgInterest,
    bestProductViews: withViews.length ? Math.max(...withViews.map((p) => p.views)) : 0,
    bestFeedViews: input.feed.length ? Math.max(...input.feed.map((f) => f.views)) : 0,
  };
}

// ---------------------------------------------------------------------------
// Customer journeys (page_path sequences per session)
// ---------------------------------------------------------------------------

export interface Journey {
  path: string[];
  count: number;
}

export function computeJourneys(events: AnalyticsEvent[], range: DateRange, maxLen = 4): Journey[] {
  const bySession = new Map<string, string[]>();
  const ordered = [...events]
    .filter((e) => withinRange(e, range) && e.event_type === 'page_view' && e.page_path)
    .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
  for (const e of ordered) {
    const arr = bySession.get(e.session_id) ?? [];
    arr.push(e.page_path!);
    bySession.set(e.session_id, arr);
  }

  const map = new Map<string, Journey>();
  for (const seq of bySession.values()) {
    // Collapse consecutive duplicates (StrictMode double-fire, reloads,
    // query-only navigations like ?v= / ?q=) and group query-string variants
    // of the same page together — "Bosh sahifa → Bosh sahifa → Bosh sahifa"
    // carries no journey information.
    const collapsed = collapseJourney(seq).map(journeyKey).slice(0, maxLen);
    if (collapsed.length === 0) continue;
    const key = collapsed.join(' > ');
    const cur = map.get(key);
    if (cur) cur.count += 1;
    else map.set(key, { path: collapsed, count: 1 });
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 10);
}

// ---------------------------------------------------------------------------
// Growth: compare current range vs previous equal-length range
// ---------------------------------------------------------------------------

export interface KpiCompare {
  label: string;
  current: number;
  previous: number;
  hasPrevious: boolean; // false when the previous window has zero of this metric
  changePct: number | null; // (cur-prev)/prev*100, null when prev is 0
}

export function computeComparison(input: {
  events: AnalyticsEvent[];
  range: DateRange;
  products: ProductMetric[];
  feed: FeedMetric[];
}): Record<string, KpiCompare> {
  const prev = previousRange(input.range);
  const cur = (r: DateRange): Record<string, number> => {
    const evs = input.events.filter((e) => withinRange(e, r));
    return {
      pageViews: evs.filter((e) => e.event_type === 'page_view').length,
      visitors: new Set(evs.map((e) => e.visitor_id)).size,
      sessions: new Set(evs.map((e) => e.session_id)).size,
      productViews: evs.filter((e) => e.event_type === 'product_view').length,
      saves: evs.filter((e) => e.event_type === 'product_save').length,
      searches: evs.filter((e) => e.event_type === 'search').length,
      intent: evs.filter((e) =>
        ['telegram_click', 'phone_click', 'directions_click', 'contact_click'].includes(e.event_type)
      ).length,
    };
  };
  const c = cur(input.range);
  const p = cur(prev);
  const mk = (label: string, key: string): KpiCompare => ({
    label,
    current: c[key],
    previous: p[key],
    hasPrevious: p[key] > 0,
    changePct: p[key] > 0 ? ((c[key] - p[key]) / p[key]) * 100 : null,
  });
  return {
    pageViews: mk('Sahifa ko\'rishlar', 'pageViews'),
    visitors: mk('Noyob tashrifchilar', 'visitors'),
    sessions: mk('Sessiyalar', 'sessions'),
    productViews: mk('Mahsulot ko\'rishlar', 'productViews'),
    saves: mk('Saqlashlar', 'saves'),
    searches: mk('Qidiruvlar', 'searches'),
    // Intent = contact clicks (Telegram/phone/map/form), NOT purchases.
    intent: mk('Aloqa niyati (bosishlar)', 'intent'),
  };
}

// ---------------------------------------------------------------------------
// Wishlist analytics
// ---------------------------------------------------------------------------

export interface WishlistMetric {
  uniqueSavers: number;
  totalSaves: number;
  repeatedSaves: number; // saves beyond the first per visitor
  removedCount: number;
  saveGrowth: number; // saves - unsaves in range
  mostSaved: BreakdownRow[];
}

export function computeWishlist(events: AnalyticsEvent[], range: DateRange): WishlistMetric {
  const inRange = events.filter((e) => withinRange(e, range));
  const savers = new Set<string>();
  const perVisitor = new Map<string, number>();
  let removed = 0;
  const savedPerProduct = new Map<string, number>();

  for (const e of inRange) {
    if (e.event_type === 'product_save') {
      savers.add(e.visitor_id);
      perVisitor.set(e.visitor_id, (perVisitor.get(e.visitor_id) ?? 0) + 1);
      if (e.product_id) savedPerProduct.set(e.product_id, (savedPerProduct.get(e.product_id) ?? 0) + 1);
    } else if (e.event_type === 'product_unsave') {
      removed += 1;
    }
  }

  let repeated = 0;
  for (const n of perVisitor.values()) if (n > 1) repeated += n - 1;

  return {
    uniqueSavers: savers.size,
    totalSaves: inRange.filter((e) => e.event_type === 'product_save').length,
    repeatedSaves: repeated,
    removedCount: removed,
    saveGrowth: inRange.filter((e) => e.event_type === 'product_save').length - removed,
    mostSaved: Array.from(savedPerProduct.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value),
  };
}

// ---------------------------------------------------------------------------
// Trend detection helpers (post-process ProductMetric / CategoryMetric)
// ---------------------------------------------------------------------------

export function fastestGrowingProducts(products: ProductMetric[], n = 6): ProductMetric[] {
  return [...products].filter((p) => p.isTrending && p.views > 0).sort((a, b) => b.views - a.views).slice(0, n);
}

export function losingInterestProducts(products: ProductMetric[], n = 6): ProductMetric[] {
  // Products with real views but declining recent activity (not trending) and low engagement.
  return [...products]
    .filter((p) => p.views >= 2 && !p.isTrending && p.engagementRate < 0.2)
    .sort((a, b) => a.engagementRate - b.engagementRate)
    .slice(0, n);
}

// ---------------------------------------------------------------------------
// Advanced funnel: adds per-stage conversion and drop-off to the core stages
// ---------------------------------------------------------------------------

export interface AdvancedFunnelStage {
  label: string;
  value: number;
  conversionFromPrev: number | null; // 0..1
  dropOffFromPrev: number | null; // 0..1, 0 when previous is 0 or equal
}

export function buildAdvancedFunnel(events: AnalyticsEvent[], range: DateRange): AdvancedFunnelStage[] {
  // Reuse the same stage value definitions as the core funnel.
  const inRange = events.filter((e) => withinRange(e, range));

  const stages: { label: string; visitors: Set<string> }[] = [
    { label: 'Tashrifchilar', visitors: new Set(inRange.filter((e) => e.event_type === 'page_view').map((e) => e.visitor_id)) },
    {
      label: 'Kategoriya',
      visitors: new Set(inRange.filter((e) => e.event_type === 'category_view' || (e.event_type === 'product_view' && e.category_id)).map((e) => e.visitor_id)),
    },
    { label: "Mahsulot ko'rgan", visitors: new Set(inRange.filter((e) => e.event_type === 'product_view').map((e) => e.visitor_id)) },
    { label: 'Saqlagan', visitors: new Set(inRange.filter((e) => e.event_type === 'product_save').map((e) => e.visitor_id)) },
    { label: "Bog'langan", visitors: new Set(inRange.filter((e) => ['telegram_click', 'phone_click', 'contact_click'].includes(e.event_type)).map((e) => e.visitor_id)) },
    { label: "Manzil ko'rgan", visitors: new Set(inRange.filter((e) => e.event_type === 'directions_click').map((e) => e.visitor_id)) },
  ];

  return stages
    .filter((s) => s.visitors.size > 0)
    .map((s, i, arr) => {
      const prev = i > 0 ? arr[i - 1].visitors.size : null;
      const conversionFromPrev = prev !== null && prev > 0 ? s.visitors.size / prev : null;
      const dropOffFromPrev =
        prev !== null && prev > 0 ? Math.max(0, 1 - s.visitors.size / prev) : null;
      return { label: s.label, value: s.visitors.size, conversionFromPrev, dropOffFromPrev };
    });
}

