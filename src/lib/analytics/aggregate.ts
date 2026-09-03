// Pure aggregation over raw analytics events. No side effects, no I/O — these
// functions are deterministic and safe to memoize. Every figure is computed from
// the real raw events only; nothing is estimated or fabricated.

import type { AnalyticsEvent, AnalyticsEventType } from '../../types/supabase-db';

export type InterestLevel = 'low' | 'medium' | 'high';

export interface DateRange {
  from: string; // ISO date (yyyy-mm-dd)
  to: string; // ISO date (yyyy-mm-dd)
}

export const RANGE_PRESETS = [
  { key: '7d', label: 'Oxirgi 7 kun', days: 7 },
  { key: '14d', label: 'Oxirgi 14 kun', days: 14 },
  { key: '30d', label: 'Oxirgi 30 kun', days: 30 },
] as const;

export type RangeKey = (typeof RANGE_PRESETS)[number]['key'];

export function presetRange(key: RangeKey): DateRange {
  const days = RANGE_PRESETS.find((r) => r.key === key)?.days ?? 14;
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return {
    from: startOfUtcDay(from).toISOString().slice(0, 10),
    to: startOfUtcDay(to).toISOString().slice(0, 10),
  };
}

export function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function withinRange(ev: AnalyticsEvent, range: DateRange): boolean {
  if (!ev.created_at) return false;
  const day = ev.created_at.slice(0, 10);
  return day >= range.from && day <= range.to;
}

const INTENT_ACTIONS: AnalyticsEventType[] = [
  'telegram_click',
  'phone_click',
  'directions_click',
  'contact_click',
];

function visitNumber(ev: AnalyticsEvent): number {
  const n = Number(ev.metadata?.session_visit);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// ---------------------------------------------------------------------------
// Visitor / session metrics
// ---------------------------------------------------------------------------

export interface VisitorStats {
  uniqueVisitors: number;
  returningVisitors: number;
  newVisitors: number;
  returningRate: number; // 0..1, 0 if no unique visitors
  uniqueSessions: number;
  avgPagesPerSession: number; // page_views per session
  avgSessionLengthSec: number; // from real session_start metadata, 0 if unknown
  totalPageViews: number;
}

export function computeVisitorStats(events: AnalyticsEvent[], range: DateRange): VisitorStats {
  const inRange = events.filter((e) => withinRange(e, range));
  const visitors = new Set(inRange.map((e) => e.visitor_id));
  const returning = new Set<string>();
  const sessions = new Set(inRange.map((e) => e.session_id));

  for (const ev of inRange) {
    if (visitNumber(ev) > 1) returning.add(ev.visitor_id);
  }

  const uniqueVisitors = visitors.size;
  const uniqueSessions = sessions.size;

  // Session duration: from session_start metadata (ms) to the last event in that
  // session. Only reliable when session_start is present.
  const lastBySession = new Map<string, { start: number; end: number }>();
  for (const ev of inRange) {
    const start = Number(ev.metadata?.session_start);
    if (!Number.isFinite(start)) continue;
    const t = new Date(ev.created_at).getTime();
    const cur = lastBySession.get(ev.session_id);
    if (!cur || t > cur.end) {
      lastBySession.set(ev.session_id, { start, end: t });
    }
  }
  let totalSessionMs = 0;
  for (const { start, end } of lastBySession.values()) {
    if (end > start) totalSessionMs += end - start;
  }
  const avgSessionLengthSec =
    lastBySession.size > 0 ? Math.round(totalSessionMs / lastBySession.size / 1000) : 0;

  const pageViews = inRange.filter((e) => e.event_type === 'page_view').length;

  return {
    uniqueVisitors,
    returningVisitors: returning.size,
    newVisitors: uniqueVisitors - returning.size,
    returningRate: uniqueVisitors > 0 ? returning.size / uniqueVisitors : 0,
    uniqueSessions,
    avgPagesPerSession: uniqueSessions > 0 ? pageViews / uniqueSessions : 0,
    avgSessionLengthSec,
    totalPageViews: pageViews,
  };
}

// ---------------------------------------------------------------------------
// Event type counts
// ---------------------------------------------------------------------------

export interface EventCounts {
  [key: string]: number;
}

export function countByType(events: AnalyticsEvent[], range: DateRange): EventCounts {
  const counts: EventCounts = {};
  for (const ev of events) {
    if (!withinRange(ev, range)) continue;
    counts[ev.event_type] = (counts[ev.event_type] ?? 0) + 1;
  }
  return counts;
}

/**
 * Interest level buckets interactions by how "deep" the action is for a single
 * visitor. Derived only from real counts.
 */
export function interestFor(interactionCount: number, uniqueUsers: number): InterestLevel {
  if (uniqueUsers <= 0) return 'low';
  const perUser = interactionCount / uniqueUsers;
  if (perUser >= 3) return 'high';
  if (perUser >= 2) return 'medium';
  return 'low';
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export interface ProductMetric {
  id: string;
  views: number;
  uniqueViewers: number;
  returningViewers: number;
  saves: number;
  uniqueSavers: number;
  savesInterest: InterestLevel;
  telegramClicks: number;
  phoneClicks: number;
  mapClicks: number;
  feedProductClicks: number;
  firstSeen: string | null;
  lastSeen: string | null;
  interest: InterestLevel;
  engagementRate: number; // (saves+telegram+phone+map+feed clicks) / views
}

export function computeProducts(events: AnalyticsEvent[], range: DateRange): ProductMetric[] {
  const byProduct = new Map<string, AnalyticsEvent[]>();

  for (const ev of events) {
    if (!withinRange(ev, range) || !ev.product_id) continue;
    if (!byProduct.has(ev.product_id)) byProduct.set(ev.product_id, []);
    byProduct.get(ev.product_id)!.push(ev);
  }

  const metrics: ProductMetric[] = [];
  for (const [id, list] of byProduct) {
    const views = list.filter((e) => e.event_type === 'product_view').length;
    const viewerSet = new Set(list.filter((e) => e.event_type === 'product_view').map((e) => e.visitor_id));
    const saverSet = new Set(list.filter((e) => e.event_type === 'product_save').map((e) => e.visitor_id));
    const savingViewers = list.filter(
      (e) => e.event_type === 'product_view' && visitNumber(e) > 1
    );
    const returningViewers = new Set(savingViewers.map((e) => e.visitor_id)).size;
    const saves = list.filter((e) => e.event_type === 'product_save').length;
    const telegramClicks = list.filter((e) => e.event_type === 'telegram_click').length;
    const phoneClicks = list.filter((e) => e.event_type === 'phone_click').length;
    const mapClicks = list.filter((e) => e.event_type === 'directions_click').length;
    const feedProductClicks = list.filter((e) => e.event_type === 'feed_product_click').length;

    const times = list.map((e) => e.created_at).filter(Boolean).sort();
    const engagement = saves + telegramClicks + phoneClicks + mapClicks + feedProductClicks;

    // Interest reflects the strongest observed signal for this product: repeated
    // views OR repeated saves OR high engagement. A product favorited 3x by 1
    // user signals HIGH even with few recorded view events.
    const viewInterest = interestFor(views, viewerSet.size);
    const saveInterest = interestFor(saves, saverSet.size);
    const levelScore: Record<InterestLevel, number> = { low: 0, medium: 1, high: 2 };
    const interest: InterestLevel =
      levelScore[saveInterest] >= levelScore[viewInterest] ? saveInterest : viewInterest;

    metrics.push({
      id,
      views,
      uniqueViewers: viewerSet.size,
      returningViewers,
      saves,
      uniqueSavers: saverSet.size,
      savesInterest: saveInterest,
      telegramClicks,
      phoneClicks,
      mapClicks,
      feedProductClicks,
      firstSeen: times[0] ?? null,
      lastSeen: times[times.length - 1] ?? null,
      interest,
      engagementRate: views > 0 ? engagement / views : 0,
    });
  }
  return metrics;
}

export function topViewedProducts(products: ProductMetric[], n = 8): ProductMetric[] {
  return [...products].sort((a, b) => b.views - a.views).slice(0, n);
}

export function leastEngagedProducts(products: ProductMetric[], n = 8): ProductMetric[] {
  // Products with real views but low engagement; the shop owner can act on these.
  return [...products]
    .filter((p) => p.views > 0)
    .sort((a, b) => a.engagementRate - b.engagementRate || a.views - b.views)
    .slice(0, n);
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export interface CategoryMetric {
  id: string;
  views: number;
  uniqueVisitors: number;
  productOpens: number;
  favorites: number;
  uniqueSavers: number;
  conversions: number;
  engagementRate: number;
}

export function computeCategories(events: AnalyticsEvent[], range: DateRange): CategoryMetric[] {
  const map = new Map<
    string,
    { id: string; views: number; unique: Set<string>; opens: number; favs: number; savers: Set<string>; conv: number }
  >();

  for (const ev of events) {
    if (!withinRange(ev, range)) continue;
    const catId = ev.category_id as string | null;
    if (!catId) continue;
    let m = map.get(catId);
    if (!m) {
      m = { id: catId, views: 0, unique: new Set(), opens: 0, favs: 0, savers: new Set(), conv: 0 };
      map.set(catId, m);
    }
    if (ev.event_type === 'category_view') {
      m.views += 1;
      m.unique.add(ev.visitor_id);
    } else if (ev.event_type === 'product_view') {
      m.opens += 1;
      m.unique.add(ev.visitor_id);
    } else if (ev.event_type === 'product_save') {
      m.favs += 1;
      m.savers.add(ev.visitor_id);
    } else if (INTENT_ACTIONS.includes(ev.event_type)) {
      m.conv += 1;
    }
  }

  return Array.from(map.values()).map((m) => ({
    id: m.id,
    views: m.views,
    uniqueVisitors: m.unique.size,
    productOpens: m.opens,
    favorites: m.favs,
    uniqueSavers: m.savers.size,
    conversions: m.conv,
    engagementRate: m.views > 0 ? (m.opens + m.favs + m.conv) / m.views : 0,
  }));
}

export function bestCategory(categories: CategoryMetric[]): CategoryMetric | null {
  if (categories.length === 0) return null;
  return [...categories].sort((a, b) => b.views - a.views)[0];
}

export function weakestCategory(categories: CategoryMetric[]): CategoryMetric | null {
  if (categories.length === 0) return null;
  return [...categories].sort((a, b) => a.views - b.views)[0];
}

// ---------------------------------------------------------------------------
// Feed
// ---------------------------------------------------------------------------

export interface FeedMetric {
  id: string;
  views: number;
  uniqueViewers: number;
  likes: number;
  shares: number;
  productClicks: number;
  telegramClicks: number;
  watchEvents: number;
  totalWatchSec: number;
  avgWatchSec: number;
  feedProductConversion: number; // productClicks / views
}

export function computeFeed(events: AnalyticsEvent[], range: DateRange): FeedMetric[] {
  const map = new Map<
    string,
    {
      id: string;
      views: number;
      viewers: Set<string>;
      likes: number;
      shares: number;
      productClicks: number;
      telegramClicks: number;
      watchEvents: number;
      totalWatchSec: number;
    }
  >();

  for (const ev of events) {
    if (!withinRange(ev, range) || !ev.feed_id) continue;
    let m = map.get(ev.feed_id);
    if (!m) {
      m = { id: ev.feed_id, views: 0, viewers: new Set(), likes: 0, shares: 0, productClicks: 0, telegramClicks: 0, watchEvents: 0, totalWatchSec: 0 };
      map.set(ev.feed_id, m);
    }
    switch (ev.event_type) {
      case 'feed_view':
        m.views += 1;
        m.viewers.add(ev.visitor_id);
        break;
      case 'feed_like':
        m.likes += 1;
        break;
      case 'feed_share':
        m.shares += 1;
        break;
      case 'feed_product_click':
        m.productClicks += 1;
        break;
      case 'telegram_click':
        m.telegramClicks += 1;
        break;
      case 'feed_watch':
        m.watchEvents += 1;
        const sec = Number(ev.metadata?.durationSec);
        if (Number.isFinite(sec)) m.totalWatchSec += sec;
        break;
      default:
        break;
    }
  }

  return Array.from(map.values()).map((m) => ({
    id: m.id,
    views: m.views,
    uniqueViewers: m.viewers.size,
    likes: m.likes,
    shares: m.shares,
    productClicks: m.productClicks,
    telegramClicks: m.telegramClicks,
    watchEvents: m.watchEvents,
    totalWatchSec: m.totalWatchSec,
    avgWatchSec: m.watchEvents > 0 ? Math.round(m.totalWatchSec / m.watchEvents) : 0,
    feedProductConversion: m.views > 0 ? m.productClicks / m.views : 0,
  }));
}

export function topFeed(feed: FeedMetric[], n = 8): FeedMetric[] {
  return [...feed].sort((a, b) => b.views - a.views).slice(0, n);
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchMetric {
  query: string;
  count: number;
  uniqueVisitors: number;
  noResults: boolean;
  noResultCount: number;
  ledToProductView: boolean;
  ledToFavorite: boolean;
  ledToTelegram: boolean;
}

export interface SearchSummary {
  topSearches: SearchMetric[];
  noResultSearches: SearchMetric[];
  totalSearches: number;
  withResults: number;
  searchConversionRate: number; // searches leading to a product view
}

export function computeSearch(events: AnalyticsEvent[], range: DateRange): SearchSummary {
  const inRange = events.filter((e) => withinRange(e, range));
  const searchEvents = inRange.filter((e) => e.event_type === 'search');
  const map = new Map<
    string,
    {
      query: string;
      count: number;
      sessions: Set<string>;
      noResults: boolean;
      noResultCount: number;
      viewedSessions: Set<string>;
      favSessions: Set<string>;
      tgSessions: Set<string>;
    }
  >();

  for (const ev of searchEvents) {
    const q = (ev.search_query || '').trim();
    if (!q) continue;
    let m = map.get(q);
    if (!m) {
      m = { query: q, count: 0, sessions: new Set(), noResults: false, noResultCount: 0, viewedSessions: new Set(), favSessions: new Set(), tgSessions: new Set() };
      map.set(q, m);
    }
    m.count += 1;
    m.sessions.add(ev.session_id);
    if (ev.metadata?.noResults) {
      m.noResults = true;
      m.noResultCount += 1;
    }
  }

  // Correlate outcomes within the same session (real derived data).
  for (const ev of inRange) {
    if (ev.event_type === 'search') continue;
    for (const m of map.values()) {
      if (!m.sessions.has(ev.session_id)) continue;
      if (ev.event_type === 'product_view') m.viewedSessions.add(ev.session_id);
      if (ev.event_type === 'product_save') m.favSessions.add(ev.session_id);
      if (ev.event_type === 'telegram_click') m.tgSessions.add(ev.session_id);
    }
  }

  const metrics: SearchMetric[] = Array.from(map.values()).map((m) => ({
    query: m.query,
    count: m.count,
    uniqueVisitors: m.sessions.size,
    noResults: m.noResults,
    noResultCount: m.noResultCount,
    ledToProductView: m.viewedSessions.size > 0,
    ledToFavorite: m.favSessions.size > 0,
    ledToTelegram: m.tgSessions.size > 0,
  }));

  const totalSearches = metrics.reduce((sum, m) => sum + m.count, 0);
  const topSearches = [...metrics].sort((a, b) => b.count - a.count).slice(0, 8);
  const noResultSearches = [...metrics]
    .filter((m) => m.noResults)
    .sort((a, b) => b.noResultCount - a.noResultCount)
    .slice(0, 8);
  const convertedSearches = metrics.reduce((sum, m) => sum + (m.ledToProductView ? m.count : 0), 0);

  return {
    topSearches,
    noResultSearches,
    totalSearches,
    withResults: metrics.reduce((sum, m) => sum + (m.noResults ? 0 : m.count), 0),
    searchConversionRate: totalSearches > 0 ? convertedSearches / totalSearches : 0,
  };
}

// ---------------------------------------------------------------------------
// Intent
// ---------------------------------------------------------------------------

export interface IntentMetric {
  telegram: number;
  phone: number;
  directions: number;
  contact: number;
  total: number;
  uniqueIntentVisitors: number;
}

export function computeIntent(events: AnalyticsEvent[], range: DateRange): IntentMetric {
  const inRange = events.filter((e) => withinRange(e, range));
  let telegram = 0, phone = 0, directions = 0, contact = 0;
  const intentVisitors = new Set<string>();
  for (const ev of inRange) {
    switch (ev.event_type) {
      case 'telegram_click': telegram++; intentVisitors.add(ev.visitor_id); break;
      case 'phone_click': phone++; intentVisitors.add(ev.visitor_id); break;
      case 'directions_click': directions++; intentVisitors.add(ev.visitor_id); break;
      case 'contact_click': contact++; intentVisitors.add(ev.visitor_id); break;
      default: break;
    }
  }
  return {
    telegram, phone, directions, contact,
    total: telegram + phone + directions + contact,
    uniqueIntentVisitors: intentVisitors.size,
  };
}

// ---------------------------------------------------------------------------
// Traffic over time
// ---------------------------------------------------------------------------

export interface TrafficPoint {
  date: string;
  views: number;
  visitors: number;
}

export function trafficSeries(events: AnalyticsEvent[], range: DateRange): TrafficPoint[] {
  const byDay = new Map<string, { views: number; visitors: Set<string> }>();
  for (const ev of events) {
    if (!withinRange(ev, range) || ev.event_type !== 'page_view') continue;
    const day = ev.created_at?.slice(0, 10) ?? '';
    if (!day) continue;
    let p = byDay.get(day);
    if (!p) {
      p = { views: 0, visitors: new Set() };
      byDay.set(day, p);
    }
    p.views += 1;
    p.visitors.add(ev.visitor_id);
  }
  const points: TrafficPoint[] = [];
  const start = new Date(range.from + 'T00:00:00Z');
  const end = new Date(range.to + 'T00:00:00Z');
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    const p = byDay.get(key);
    points.push({ date: key, views: p?.views ?? 0, visitors: p?.visitors.size ?? 0 });
  }
  return points;
}

// ---------------------------------------------------------------------------
// Customer journey funnel (only measurable stages)
// ---------------------------------------------------------------------------

export interface FunnelStage {
  label: string;
  value: number;
}

export function buildFunnel(events: AnalyticsEvent[], range: DateRange): FunnelStage[] {
  const inRange = events.filter((e) => withinRange(e, range));
  const visitors = new Set(inRange.filter((e) => e.event_type === 'page_view').map((e) => e.visitor_id));
  const productVisitors = new Set(inRange.filter((e) => e.event_type === 'product_view').map((e) => e.visitor_id));
  const saveVisitors = new Set(inRange.filter((e) => e.event_type === 'product_save').map((e) => e.visitor_id));
  const contactVisitors = new Set(
    inRange.filter((e) => ['telegram_click', 'phone_click', 'contact_click'].includes(e.event_type)).map((e) => e.visitor_id)
  );
  const locationVisitors = new Set(
    inRange.filter((e) => e.event_type === 'directions_click').map((e) => e.visitor_id)
  );

  const stages: FunnelStage[] = [];
  if (visitors.size > 0) stages.push({ label: 'Tashrifchilar', value: visitors.size });
  if (productVisitors.size > 0) stages.push({ label: 'Mahsulot ko\'rgan', value: productVisitors.size });
  if (saveVisitors.size > 0) stages.push({ label: 'Saqlagan', value: saveVisitors.size });
  if (contactVisitors.size > 0) stages.push({ label: 'Bog\'langan', value: contactVisitors.size });
  if (locationVisitors.size > 0) stages.push({ label: 'Manzil ko\'rgan', value: locationVisitors.size });

  return stages;
}

// ---------------------------------------------------------------------------
// Hour-of-day activity and breakdowns
// ---------------------------------------------------------------------------

export interface HourBucket {
  hour: number;
  count: number;
}

export function hourlyActivity(events: AnalyticsEvent[], range: DateRange): HourBucket[] {
  const buckets: HourBucket[] = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
  for (const ev of events) {
    if (!withinRange(ev, range) || !ev.created_at) continue;
    buckets[new Date(ev.created_at).getUTCHours()].count += 1;
  }
  return buckets;
}

export interface BreakdownRow {
  label: string;
  value: number;
}

export function deviceBreakdown(events: AnalyticsEvent[], range: DateRange): BreakdownRow[] {
  const counts = new Map<string, number>();
  for (const ev of events) {
    if (!withinRange(ev, range)) continue;
    const device = typeof ev.metadata?.device === 'string' ? ev.metadata.device : 'unknown';
    counts.set(device, (counts.get(device) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function sourceBreakdown(events: AnalyticsEvent[], range: DateRange): BreakdownRow[] {
  const counts = new Map<string, number>();
  for (const ev of events) {
    if (!withinRange(ev, range)) continue;
    const source = typeof ev.metadata?.source === 'string' ? ev.metadata.source : 'unknown';
    counts.set(source, (counts.get(source) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}
