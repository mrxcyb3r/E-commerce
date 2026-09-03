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

function countBreakdown(events: AnalyticsEvent[], key: (e: AnalyticsEvent) => string): BreakdownRow[] {
  const map = new Map<string, number>();
  for (const e of events) {
    const k = key(e);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
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
    browsers: countBreakdown(inRange, (e) => metaStr(e, 'browser')),
    oses: countBreakdown(inRange, (e) => metaStr(e, 'os')),
    languages: countBreakdown(inRange, (e) => metaStr(e, 'language')),
    darkMode: countBreakdown(inRange, (e) => (e.metadata?.dark_mode === true ? 'dark' : 'light')),
    screens: countBreakdown(inRange, (e) => metaStr(e, 'screen')),
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
  const now = Date.now();
  const liveCut = now - liveWindowMs;
  const live = new Set<string>();
  const today = new Set<string>();
  const week = new Set<string>();
  const month = new Set<string>();

  const todayStart = startOfUtcDay(new Date()).getTime();
  const weekStart = (() => {
    const d = new Date();
    const day = d.getDay();
    const offset = day === 0 ? 6 : day - 1;
    d.setDate(d.getDate() - offset);
    return startOfUtcDay(d).getTime();
  })();
  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).getTime();

  for (const e of events) {
    if (!withinRange(e, range) || !e.created_at) continue;
    const t = new Date(e.created_at).getTime();
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
    const d = new Date(e.created_at!);
    const dow = d.getUTCDay();
    const h = d.getUTCHours();
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
  conversionRate: number; // intent actions / page_views
  engagementRate: number; // (saves+shares+intent) / page_views
  favoriteRate: number; // product_save / product_view
  productCtr: number; // (telegram+phone+directions+share) / product_view
  feedCtr: number; // feed_product_click / feed_view
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
  const pageViews = inRange.filter((e) => e.event_type === 'page_view').length;
  const productViews = inRange.filter((e) => e.event_type === 'product_view').length;
  const feedViews = inRange.filter((e) => e.event_type === 'feed_view').length;
  const saves = inRange.filter((e) => e.event_type === 'product_save').length;
  const shares = inRange.filter((e) => ['product_share', 'feed_share'].includes(e.event_type)).length;
  const intent = inRange.filter((e) =>
    ['telegram_click', 'phone_click', 'directions_click', 'contact_click'].includes(e.event_type)
  ).length;
  const feedClicks = inRange.filter((e) => e.event_type === 'feed_product_click').length;

  const score: Record<InterestLevel, number> = { low: 0, medium: 1, high: 2 };
  const withViews = input.products.filter((p) => p.views > 0);
  const avgInterest =
    withViews.length > 0 ? withViews.reduce((s, p) => s + score[p.interest], 0) / withViews.length : 0;

  return {
    conversionRate: pageViews > 0 ? intent / pageViews : 0,
    engagementRate: pageViews > 0 ? (saves + shares + intent) / pageViews : 0,
    favoriteRate: productViews > 0 ? saves / productViews : 0,
    productCtr: productViews > 0 ? (intent + shares) / productViews : 0,
    feedCtr: feedViews > 0 ? feedClicks / feedViews : 0,
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
    const trimmed = seq.slice(0, maxLen);
    const key = trimmed.join(' > ');
    const cur = map.get(key);
    if (cur) cur.count += 1;
    else map.set(key, { path: trimmed, count: 1 });
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
  changePct: number; // (cur-prev)/prev, 0 if prev is 0
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
    changePct: p[key] > 0 ? ((c[key] - p[key]) / p[key]) * 100 : 0,
  });
  return {
    pageViews: mk('Sahifa ko\'rishlar', 'pageViews'),
    visitors: mk('Noyob tashrifchilar', 'visitors'),
    sessions: mk('Sessiyalar', 'sessions'),
    productViews: mk('Mahsulot ko\'rishlar', 'productViews'),
    saves: mk('Saqlashlar', 'saves'),
    searches: mk('Qidiruvlar', 'searches'),
    intent: mk('Sotib olish niyati', 'intent'),
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

