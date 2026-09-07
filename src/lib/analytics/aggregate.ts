// Pure aggregation over raw analytics events. No side effects, no I/O — these
// functions are deterministic and safe to memoize. Every figure is computed from
// the real raw events only; nothing is estimated or fabricated.
//
// Canonical semantics live in ./metrics.ts and are enforced here:
// - Rates are UNIQUE-VISITOR based (numerator visitors / denominator visitors)
//   so a numerator drawn from the same visitor set can never exceed 100%.
//   rateUnique() returns null when the denominator is empty → UI shows "—".
// - Wall-clock bucketing uses Asia/Tashkent (see eventDay()).

import type { AnalyticsEvent } from '../../types/supabase-db';
import {
  eventDay,
  rateUnique,
  tashkentParts,
  tashkentToday,
  collapseJourney,
  journeyKey,
  isIntentEvent,
} from './metrics';

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
  // Day boundaries in Asia/Tashkent so "last 7 days" matches the owner's wall
  // clock and the Tashkent-bucketed events (see eventDay/withinRange).
  const to = tashkentToday();
  const toMs = new Date(to + 'T00:00:00Z').getTime();
  const from = new Date(toMs - (days - 1) * 86400000).toISOString().slice(0, 10);
  return { from, to };
}

export function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function withinRange(ev: AnalyticsEvent, range: DateRange): boolean {
  const day = eventDay(ev); // yyyy-mm-dd in Asia/Tashkent, '' when unparseable
  if (!day) return false;
  return day >= range.from && day <= range.to;
}

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
  // Denominator = sessions that actually opened at least one page. Sessions
  // built only from non-page events (e.g. a lone feed_like) must not dilute
  // the average — previously they did, systematically underestimating it.
  const sessionsWithPageView = new Set(
    inRange.filter((e) => e.event_type === 'page_view').map((e) => e.session_id)
  ).size;

  return {
    uniqueVisitors,
    returningVisitors: returning.size,
    newVisitors: uniqueVisitors - returning.size,
    returningRate: uniqueVisitors > 0 ? returning.size / uniqueVisitors : 0,
    uniqueSessions,
    avgPagesPerSession: sessionsWithPageView > 0 ? pageViews / sessionsWithPageView : 0,
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
  shareClicks: number;
  feedProductClicks: number;
  avgDwellSec: number; // real measured time on product pages
  firstSeen: string | null;
  lastSeen: string | null;
  interest: InterestLevel;
  // Visitor-based rates (uniqueVisitors(action) / uniqueViewers). Numerators
  // are visitor SETS, so values are bounded 0..1; null = no viewers in range
  // (UI shows "—"). Event totals (saves, telegramClicks, …) stay as counts.
  engagementRate: number | null;
  isTrending: boolean; // rising view activity in the recent half of the range
  feedLikes: number;
  uniqueLikers: number;
  uniqueIntentVisitors: number; // visitors with telegram/phone/map/feed-click
  uniqueSharers: number;
  uniqueEngaged: number; // visitors with any save/intent/share/feed-click/like
  wishlistRate: number | null; // uniqueSavers / uniqueViewers
  clickThroughRate: number | null; // uniqueIntentVisitors / uniqueViewers
  averageViewTimeSec: number;
  scrollDepthPct: number;
  // Visitors who both saved AND contacted (save→contact affinity). Coarse:
  // no temporal order enforced — documented, not a true ordered funnel.
  conversionFunnelConversion: number | null;
  popularityRank: number;
  trendScore: number;
  trafficSources: Record<string, number>;
  deviceBreakdown: Record<string, number>;
}

export function computeProducts(events: AnalyticsEvent[], range: DateRange): ProductMetric[] {
  const byProduct = new Map<string, AnalyticsEvent[]>();

  for (const ev of events) {
    if (!withinRange(ev, range) || !ev.product_id) continue;
    if (!byProduct.has(ev.product_id)) byProduct.set(ev.product_id, []);
    byProduct.get(ev.product_id)!.push(ev);
  }

  // Midpoint within the range, used to separate "earlier" vs "recent" for
  // trend detection (based only on real event timestamps).
  const mid = new Date(range.to + 'T00:00:00Z').getTime();
  const midLow = new Date(range.from + 'T00:00:00Z').getTime();
  const rangeMid = midLow + (mid - midLow) / 2;

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
        const shareClicks = list.filter((e) => e.event_type === 'product_share').length;
        const feedProductClicks = list.filter((e) => e.event_type === 'feed_product_click').length;
        const feedLikes = list.filter((e) => e.event_type === 'feed_like').length;
        const uniqueLikers = new Set(list.filter((e) => e.event_type === 'feed_like').map((e) => e.visitor_id)).size;
        // Visitor sets for bounded rates (numerator ⊆ denominator by construction).
        const intentVisitors = new Set(
          list
            .filter((e) =>
              e.event_type === 'telegram_click' ||
              e.event_type === 'phone_click' ||
              e.event_type === 'directions_click' ||
              e.event_type === 'feed_product_click'
            )
            .map((e) => e.visitor_id)
        );
        const sharerVisitors = new Set(
          list.filter((e) => e.event_type === 'product_share').map((e) => e.visitor_id)
        );
        const engagedVisitors = new Set([
          ...saverSet,
          ...intentVisitors,
          ...sharerVisitors,
          ...new Set(list.filter((e) => e.event_type === 'feed_like').map((e) => e.visitor_id)),
        ]);

        // Sorted view event timestamps (real metadata), used for firstSeen/lastSeen.
        const times = list
          .filter((e) => e.event_type === 'product_view' && e.created_at)
          .map((e) => e.created_at as string)
          .sort();

        // Real measured dwell time (seconds) from product_dwell events.
        const dwellSecs = list
          .filter((e) => e.event_type === 'product_dwell')
          .map((e) => Number(e.metadata?.durationSec))
          .filter((n) => Number.isFinite(n) && n > 0);
        const avgDwellSec =
          dwellSecs.length > 0 ? Math.round(dwellSecs.reduce((s, n) => s + n, 0) / dwellSecs.length) : 0;

        // Trend: view events in the recent half vs the earlier half of the range.
        const earlierViews = list.filter(
          (e) => e.event_type === 'product_view' && e.created_at && new Date(e.created_at).getTime() < rangeMid
        ).length;
        const recentViews = views - earlierViews;
        const isTrending =
          recentViews >= Math.max(2, Math.ceil(earlierViews * 1.5)) && views > 0;

        // Wishlist rate: uniqueSavers / uniqueViewers (bounded 0..1).
        const wishlistRate = rateUnique(saverSet.size, viewerSet.size);

        // Click-through: visitors who contacted / uniqueViewers (bounded 0..1).
        const clickThroughRate = rateUnique(intentVisitors.size, viewerSet.size);

        // Average viewing time from product_dwell events
        const averageViewTimeSec = avgDwellSec;

        // Scroll depth is derived from product_view events with metadata
        // If no scroll metadata available, default to 0
        const scrollDepthPct = 0; // Would require additional client-side tracking

        // Save→contact affinity: visitors with BOTH a save and a contact
        // action, over unique viewers. No temporal order enforced.
        const saveVisitors = new Set(list.filter((e) => e.event_type === 'product_save').map((e) => e.visitor_id));
        const contactVisitors = new Set(
          list
            .filter((e) => e.event_type === 'telegram_click' || e.event_type === 'phone_click' || e.event_type === 'directions_click')
            .map((e) => e.visitor_id)
        );
        const saveAndContact = [...saveVisitors].filter((v) => contactVisitors.has(v)).length;
        const conversionFunnelConversion = rateUnique(saveAndContact, viewerSet.size);

        // Popularity rank (1 = most viewed)
        // We'll compute this later after all products are sorted

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
          shareClicks,
          feedProductClicks,
          feedLikes,
          uniqueLikers,
          avgDwellSec,
          wishlistRate,
          clickThroughRate,
          averageViewTimeSec,
          scrollDepthPct,
          conversionFunnelConversion,
          firstSeen: times[0] ?? null,
          lastSeen: times[times.length - 1] ?? null,
          interest,
          // Engagement: engaged visitors / unique viewers (bounded 0..1).
          engagementRate: rateUnique(engagedVisitors.size, viewerSet.size),
          isTrending,
          popularityRank: 0,
          trendScore: 0,
          trafficSources: {} as Record<string, number>,
          deviceBreakdown: {} as Record<string, number>,
          uniqueIntentVisitors: intentVisitors.size,
          uniqueSharers: sharerVisitors.size,
          uniqueEngaged: engagedVisitors.size,
        });
      }
  // Assign popularity ranks (1 = most views)
  const sortedByViews = [...metrics].sort((a, b) => b.views - a.views);
  sortedByViews.forEach((p, i) => { var _p; return (_p = p).popularityRank = i + 1; });
  // Also update the original metrics array by reference
  metrics.forEach(p => {
    const rankRef = sortedByViews.find(x => x.id === p.id);
    if (rankRef) p.popularityRank = rankRef.popularityRank;
  });
  return metrics;
}

export function topViewedProducts(products: ProductMetric[], n = 8): ProductMetric[] {
  return [...products].sort((a, b) => b.views - a.views).slice(0, n);
}

export function leastEngagedProducts(products: ProductMetric[], n = 8): ProductMetric[] {
  // Products with real views but low engagement; the shop owner can act on these.
  return [...products]
    .filter((p) => p.views > 0)
    .sort((a, b) => (a.engagementRate ?? 0) - (b.engagementRate ?? 0) || a.views - b.views)
    .slice(0, n);
}

export function trendingProducts(products: ProductMetric[], n = 8): ProductMetric[] {
  // Products whose view activity is rising in the recent half of the range.
  return [...products].filter((p) => p.isTrending).sort((a, b) => b.views - a.views).slice(0, n);
}

export function lowestEngagementProducts(products: ProductMetric[], n = 8): ProductMetric[] {
  // Products with views but very low engagement rate
  return [...products]
    .filter((p) => p.views > 0 && (p.engagementRate ?? 1) < 0.1)
    .sort((a, b) => (a.engagementRate ?? 0) - (b.engagementRate ?? 0))
    .slice(0, n);
}

export function productsByRank(products: ProductMetric[], rank: number): ProductMetric | null {
  return [...products].find((p) => p.popularityRank === rank) ?? null;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export interface CategoryMetric {
  id: string;
  views: number; // category_view events (category page/card opens)
  uniqueVisitors: number; // visitors with category_view OR product_view OR save OR intent in this category
  productOpens: number; // product_view events carrying this category_id
  favorites: number;
  uniqueSavers: number;
  conversions: number; // intent events carrying this category_id
  // Engaged visitors (any open/save/intent) / uniqueVisitors — bounded 0..1,
  // null when nobody interacted. Previously (opens+favs+conv)/category_views,
  // which routinely exceeded 100% because direct product opens rarely fire a
  // category_view first.
  engagementRate: number | null;
  trending: boolean;
  popularityRank: number;
  trafficSources: Record<string, number>;
  topProductId: string | null; // product_id with most product_views in category
  topProductViews: number;
}

export function computeCategories(events: AnalyticsEvent[], range: DateRange): CategoryMetric[] {
  const map = new Map<
    string,
    { id: string; views: number; unique: Set<string>; engaged: Set<string>; opens: number; favs: number; savers: Set<string>; conv: number; productViewsById: Map<string, number> }
  >();

  for (const ev of events) {
    if (!withinRange(ev, range)) continue;
    const catId = ev.category_id as string | null;
    if (!catId) continue;
    let m = map.get(catId);
    if (!m) {
      m = { id: catId, views: 0, unique: new Set(), engaged: new Set(), opens: 0, favs: 0, savers: new Set(), conv: 0, productViewsById: new Map() };
      map.set(catId, m);
    }
    if (ev.event_type === 'category_view') {
      m.views += 1;
      m.unique.add(ev.visitor_id);
      m.engaged.add(ev.visitor_id);
    } else if (ev.event_type === 'product_view') {
      m.opens += 1;
      m.unique.add(ev.visitor_id);
      m.engaged.add(ev.visitor_id);
      // Track product views within category
      const pv = m.productViewsById.get(ev.product_id ?? 'unknown') ?? 0;
      m.productViewsById.set(ev.product_id ?? 'unknown', pv + 1);
    } else if (ev.event_type === 'product_save') {
      m.favs += 1;
      m.savers.add(ev.visitor_id);
      m.unique.add(ev.visitor_id);
      m.engaged.add(ev.visitor_id);
    } else if (isIntentEvent(ev.event_type)) {
      m.conv += 1;
      m.unique.add(ev.visitor_id);
      m.engaged.add(ev.visitor_id);
    }
  }

  const metrics: CategoryMetric[] = [];
  const rankMap = new Map<string, number>();
  // First pass: compute all metrics and rank by views
  for (const [id, m] of map.entries()) {
    // Top product = MAX product_views, not first-seen (previous code took the
    // first map entry, mislabeling an arbitrary product as "top").
    let topProductId: string | null = null;
    let topProductViews = 0;
    for (const [pid, pv] of m.productViewsById.entries()) {
      if (pid !== 'unknown' && pv > topProductViews) {
        topProductViews = pv;
        topProductId = pid;
      }
    }
    rankMap.set(id, topProductViews);
    metrics.push({
      id: m.id,
      views: m.views,
      uniqueVisitors: m.unique.size,
      productOpens: m.opens,
      favorites: m.favs,
      uniqueSavers: m.savers.size,
      conversions: m.conv,
      engagementRate: rateUnique(m.engaged.size, m.unique.size),
      trending: false, // will be set below
      popularityRank: 0,
      topProductId,
      topProductViews,
      trafficSources: {} as Record<string, number>,
    });
  }
  // Sort by views descending for ranking
  metrics.sort((a, b) => b.views - a.views);
  // Assign popularity ranks
  metrics.forEach((m, i) => { var _m; return (_m = m).popularityRank = i + 1; });

  // Set trending: categories with rising view activity in recent half
  const mid = new Date(range.to + 'T00:00:00Z').getTime();
  const midLow = new Date(range.from + 'T00:00:00Z').getTime();
  const rangeMid = midLow + (mid - midLow) / 2;

  for (const m of metrics) {
    const catEvents = events.filter((e) => withinRange(e, range) && e.category_id as string === m.id);
    const catViews = catEvents.filter((e) => e.event_type === 'category_view').length;
    const earlierViews = catEvents.filter((e) => e.event_type === 'category_view' && e.created_at && new Date(e.created_at).getTime() < rangeMid).length;
    const recentViews = catViews - earlierViews;
    m.trending = recentViews >= Math.max(2, Math.ceil(earlierViews * 1.5)) && catViews > 0;
  }

  // Re-sort by popularity rank (already done), but ensure trending is set
  return metrics.map((m) => ({
    id: m.id,
    views: m.views,
    uniqueVisitors: m.uniqueVisitors,
    productOpens: m.productOpens,
    favorites: m.favorites,
    uniqueSavers: m.uniqueSavers,
    conversions: m.conversions,
    engagementRate: m.engagementRate,
    trending: m.trending,
    popularityRank: m.popularityRank,
    trafficSources: m.trafficSources,
    topProductId: m.topProductId,
    topProductViews: m.topProductViews,
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
  views: number; // feed_view events
  uniqueViewers: number; // visitors with a feed_view
  likes: number;
  uniqueLikers: number;
  shares: number;
  productClicks: number;
  uniqueClickers: number;
  telegramClicks: number;
  watchEvents: number;
  totalWatchSec: number; // summed feed_watch durationSec (real measured seconds)
  avgWatchSec: number;
  // Unique clickers / unique viewers (bounded 0..1, null when no viewers).
  feedProductConversion: number | null;
  comments: number; // feed_comment_submit only — drawer OPENS are not comments
  uniqueCommenters: number; // visitors who submitted a comment
  // Unique engaged visitors (like/share/click/telegram/save) / unique viewers.
  engagementScore: number | null;
  videoStarts: number;
  uniqueStarters: number;
  videoCompletes: number;
  uniqueCompleters: number;
  // Unique completers / unique starters (bounded 0..1, null when no starts).
  completionRate: number | null;
  favorites: number; // feed_favorite with action=save
  unfavorites: number; // feed_favorite with action=unsave
  retentions: RetentionPoint[]; // per-video retention curve from feed_video_retention events
}

export interface RetentionPoint {
  bucket: string; // e.g. '3s','5s','10s','25%','50%','75%','100%'
  count: number;
  uniqueVisitors: number;
  rate: number | null; // unique bucket visitors / unique starters, null if none
}

export function computeFeed(events: AnalyticsEvent[], range: DateRange): FeedMetric[] {
  const map = new Map<
    string,
    {
      id: string;
      views: number;
      viewers: Set<string>;
      likes: number;
      uniqueLikers: Set<string>;
      shares: number;
      productClicks: number;
      clickers: Set<string>;
      telegramClicks: number;
      telegramVisitors: Set<string>;
      watchEvents: number;
      totalWatchSec: number;
      comments: number;
      commenters: Set<string>;
      videoStarts: number;
      starters: Set<string>;
      videoCompletes: number;
      completers: Set<string>;
      favorites: number;
      favoriteVisitors: Set<string>;
      unfavorites: number;
      retentions: Map<string, { count: number; visitors: Set<string> }>;
    }
  >();

  for (const ev of events) {
    if (!withinRange(ev, range) || !ev.feed_id) continue;
    let m = map.get(ev.feed_id);
    if (!m) {
      m = { id: ev.feed_id, views: 0, viewers: new Set(), likes: 0, uniqueLikers: new Set(), shares: 0, productClicks: 0, clickers: new Set(), telegramClicks: 0, telegramVisitors: new Set(), watchEvents: 0, totalWatchSec: 0, comments: 0, commenters: new Set(), videoStarts: 0, starters: new Set(), videoCompletes: 0, completers: new Set(), favorites: 0, favoriteVisitors: new Set(), unfavorites: 0, retentions: new Map() };
      map.set(ev.feed_id, m);
    }
    switch (ev.event_type) {
      case 'feed_view':
        m.views += 1;
        m.viewers.add(ev.visitor_id);
        break;
      case 'feed_like':
        m.likes += 1;
        m.uniqueLikers.add(ev.visitor_id);
        break;
      case 'feed_share':
        m.shares += 1;
        break;
      case 'feed_product_click':
        m.productClicks += 1;
        m.clickers.add(ev.visitor_id);
        break;
      case 'telegram_click':
        m.telegramClicks += 1;
        m.telegramVisitors.add(ev.visitor_id);
        break;
      case 'feed_watch':
        m.watchEvents += 1;
        const sec = Number(ev.metadata?.durationSec);
        if (Number.isFinite(sec)) m.totalWatchSec += sec;
        break;
      case 'feed_video_start':
        m.videoStarts += 1;
        m.starters.add(ev.visitor_id);
        break;
      case 'feed_video_complete':
        m.videoCompletes += 1;
        m.completers.add(ev.visitor_id);
        break;
      case 'feed_favorite':
        if (ev.metadata?.action === 'unsave') m.unfavorites += 1;
        else {
          m.favorites += 1;
          m.favoriteVisitors.add(ev.visitor_id);
        }
        break;
      case 'feed_video_retention': {
        const bucket = String(ev.metadata?.bucket ?? '');
        if (bucket) {
          let r = m.retentions.get(bucket);
          if (!r) {
            r = { count: 0, visitors: new Set() };
            m.retentions.set(bucket, r);
          }
          r.count += 1;
          r.visitors.add(ev.visitor_id);
        }
        break;
      }
      // NOTE: feed_comment_open (drawer opens) intentionally NOT counted as a
      // comment — only submitted comments are comments.
      case 'feed_comment_submit':
        m.comments += 1;
        m.commenters.add(ev.visitor_id);
        break;
      default:
        break;
    }
  }

  const ORDER: string[] = ['start', '3s', '5s', '10s', '25%', '50%', '75%', '100%'];

  return Array.from(map.values()).map((m) => {
    const retentions: RetentionPoint[] = ORDER.filter((b) => m.retentions.has(b)).map((b) => {
      const r = m.retentions.get(b)!;
      return {
        bucket: b,
        count: r.count,
        uniqueVisitors: r.visitors.size,
        rate: rateUnique(r.visitors.size, m.starters.size),
      };
    });
    const engaged = new Set([
      ...m.uniqueLikers,
      ...m.clickers,
      ...m.telegramVisitors,
      ...m.favoriteVisitors,
    ]);
    return {
      id: m.id,
      views: m.views,
      uniqueViewers: m.viewers.size,
      likes: m.likes,
      uniqueLikers: m.uniqueLikers.size,
      shares: m.shares,
      productClicks: m.productClicks,
      uniqueClickers: m.clickers.size,
      telegramClicks: m.telegramClicks,
      watchEvents: m.watchEvents,
      totalWatchSec: m.totalWatchSec,
      avgWatchSec: m.watchEvents > 0 ? Math.round(m.totalWatchSec / m.watchEvents) : 0,
      feedProductConversion: rateUnique(m.clickers.size, m.viewers.size),
      comments: m.comments,
      uniqueCommenters: m.commenters.size,
      engagementScore: rateUnique(engaged.size, m.viewers.size),
      videoStarts: m.videoStarts,
      uniqueStarters: m.starters.size,
      videoCompletes: m.videoCompletes,
      uniqueCompleters: m.completers.size,
      completionRate: rateUnique(m.completers.size, m.starters.size),
      favorites: m.favorites,
      unfavorites: m.unfavorites,
      retentions,
    };
  });
}

export function topFeed(feed: FeedMetric[], n = 8): FeedMetric[] {
  return [...feed].sort((a, b) => b.views - a.views).slice(0, n);
}

// ---------------------------------------------------------------------------
// Feed module analytics (dedicated Feed admin)
// ---------------------------------------------------------------------------

export interface FeedOverview {
  impressions: number; // feed_view count
  uniqueViewers: number; // visitors with at least one feed_view (NOT any feed event)
  videoStarts: number;
  videoCompletes: number;
  averageWatchSec: number; // weighted by watch events
  totalWatchSec: number; // summed feed_watch durationSec (real measured seconds)
  completionRate: number | null; // unique completers / unique starters
  // Unique engaged visitors / unique viewers (bounded 0..1, null if none).
  engagementRate: number | null;
  likes: number;
  comments: number; // comment_submit events
  shares: number;
  productClicks: number;
  telegramClicks: number;
  favorites: number;
  videoCount: number; // distinct feed ids with any activity
}

export function computeFeedOverview(events: AnalyticsEvent[], range: DateRange): FeedOverview {
  const inRange = events.filter((e) => withinRange(e, range) && e.feed_id);
  const feedIds = new Set<string>();
  const viewers = new Set<string>();
  const starters = new Set<string>();
  const completers = new Set<string>();
  const engaged = new Set<string>();
  let impressions = 0;
  let starts = 0;
  let completes = 0;
  let totalWatchSec = 0;
  let watchEvents = 0;
  let likes = 0;
  let shares = 0;
  let productClicks = 0;
  let telegramClicks = 0;
  let comments = 0;
  let favorites = 0;

  for (const ev of inRange) {
    if (!ev.feed_id) continue;
    feedIds.add(ev.feed_id);
    switch (ev.event_type) {
      case 'feed_view': impressions += 1; viewers.add(ev.visitor_id); break;
      case 'feed_video_start': starts += 1; starters.add(ev.visitor_id); break;
      case 'feed_video_complete': completes += 1; completers.add(ev.visitor_id); break;
      case 'feed_watch': {
        watchEvents += 1;
        const s = Number(ev.metadata?.durationSec);
        if (Number.isFinite(s)) totalWatchSec += s;
        break;
      }
      case 'feed_like': likes += 1; engaged.add(ev.visitor_id); break;
      case 'feed_share': shares += 1; engaged.add(ev.visitor_id); break;
      case 'feed_product_click': productClicks += 1; engaged.add(ev.visitor_id); break;
      case 'telegram_click': telegramClicks += 1; engaged.add(ev.visitor_id); break;
      case 'feed_comment_submit': comments += 1; break;
      case 'feed_favorite':
        if (ev.metadata?.action !== 'unsave') {
          favorites += 1;
          engaged.add(ev.visitor_id);
        }
        break;
      default: break;
    }
  }

  return {
    impressions,
    uniqueViewers: viewers.size,
    videoStarts: starts,
    videoCompletes: completes,
    averageWatchSec: watchEvents > 0 ? Math.round(totalWatchSec / watchEvents) : 0,
    totalWatchSec,
    completionRate: rateUnique(completers.size, starters.size),
    engagementRate: rateUnique(engaged.size, viewers.size),
    likes,
    comments,
    shares,
    productClicks,
    telegramClicks,
    favorites,
    videoCount: feedIds.size,
  };
}

export interface FeedFunnelStage {
  label: string;
  value: number;
  rate: number; // relative to previous stage
}

export function computeFeedFunnel(events: AnalyticsEvent[], range: DateRange): FeedFunnelStage[] {
  const inRange = events.filter((e) => withinRange(e, range) && e.feed_id);
  const counts: Record<string, number> = {
    impressions: 0,
    starts: 0,
    retained5s: 0,
    productClick: 0,
    favorite: 0,
    telegram: 0,
  };
  for (const ev of inRange) {
    if (!ev.feed_id) continue;
    switch (ev.event_type) {
      case 'feed_view': counts.impressions += 1; break;
      case 'feed_video_start': counts.starts += 1; break;
      case 'feed_video_retention':
        if (ev.metadata?.bucket === '5s') counts.retained5s += 1;
        break;
      case 'feed_product_click': counts.productClick += 1; break;
      case 'feed_favorite':
        if (ev.metadata?.action !== 'unsave') counts.favorite += 1;
        break;
      case 'telegram_click': counts.telegram += 1; break;
      default: break;
    }
  }
  const steps: { label: string; key: 'impressions' | 'starts' | 'retained5s' | 'productClick' | 'favorite' | 'telegram' }[] = [
    { label: 'Feed ko\'rinishi', key: 'impressions' },
    { label: 'Video boshlandi', key: 'starts' },
    { label: '5 soniya ushlandi', key: 'retained5s' },
    { label: 'Mahsulot ochildi', key: 'productClick' },
    { label: 'Saqlangan', key: 'favorite' },
    { label: 'Telegram', key: 'telegram' },
  ];
  let prev = 0;
  return steps.map((s) => {
    const value = counts[s.key];
    const stage: FeedFunnelStage = { label: s.label, value, rate: prev > 0 ? value / prev : 0 };
    prev = value;
    return stage;
  });
}

export interface FeedActivityPoint {
  date: string; // yyyy-mm-dd
  impressions: number;
  starts: number;
  likes: number;
  shares: number;
  productClicks: number;
  favorites: number;
  watchSec: number;
  completes: number;
}

export function computeFeedActivityTrend(events: AnalyticsEvent[], range: DateRange): FeedActivityPoint[] {
  const inRange = events.filter((e) => withinRange(e, range) && e.feed_id);
  const map = new Map<string, FeedActivityPoint>();
  const start = range.from;
  const end = range.to;
  let cur = start;
  while (cur <= end) {
    map.set(cur, { date: cur, impressions: 0, starts: 0, likes: 0, shares: 0, productClicks: 0, favorites: 0, watchSec: 0, completes: 0 });
    const d = new Date(cur + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + 1);
    cur = d.toISOString().slice(0, 10);
  }
  for (const ev of inRange) {
    if (!ev.feed_id) continue;
    const day = eventDay(ev); // Tashkent day — matches range buckets
    const p = map.get(day);
    if (!p) continue;
    switch (ev.event_type) {
      case 'feed_view': p.impressions += 1; break;
      case 'feed_video_start': p.starts += 1; break;
      case 'feed_like': p.likes += 1; break;
      case 'feed_share': p.shares += 1; break;
      case 'feed_product_click': p.productClicks += 1; break;
      case 'feed_video_complete': p.completes += 1; break;
      case 'feed_favorite':
        if (ev.metadata?.action !== 'unsave') p.favorites += 1;
        break;
      case 'feed_watch': {
        const s = Number(ev.metadata?.durationSec);
        if (Number.isFinite(s)) p.watchSec += s;
        break;
      }
      default: break;
    }
  }
  return Array.from(map.values());
}

export interface FeedLikeTrendPoint {
  date: string;
  likes: number;
  unlikes: number;
}

export function computeFeedLikeTrend(events: AnalyticsEvent[], range: DateRange): FeedLikeTrendPoint[] {
  const inRange = events.filter((e) => withinRange(e, range) && e.feed_id);
  const map = new Map<string, FeedLikeTrendPoint>();
  let idx = range.from;
  while (idx <= range.to) {
    map.set(idx, { date: idx, likes: 0, unlikes: 0 });
    const d = new Date(idx + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + 1);
    idx = d.toISOString().slice(0, 10);
  }
  for (const ev of inRange) {
    if (!ev.feed_id) continue;
    const day = eventDay(ev); // Tashkent day — matches range buckets
    const p = map.get(day);
    if (!p) continue;
    if (ev.event_type === 'feed_like') p.likes += 1;
    else if (ev.event_type === 'feed_unlike') p.unlikes += 1;
  }
  return Array.from(map.values());
}

export interface FeedProductMetric {
  productId: string;
  feedClicks: number; // feed_product_click where product_id set
  uniqueClickers: number;
  labelClicks: number; // clicks without product id (impressions of a product-less card)
  impressions: number; // feed_view where a product is linked (from metadata productId if present)
  favorites: number; // feed_favorite (product_id set)
  productViews: number; // product_view events for that product (ALL views, not only post-click)
  uniqueProductViewers: number;
  // Unique product viewers among clickers / unique clickers. Coarse affinity
  // (no click→view session join): productViews counts every organic view too,
  // so this is an upper-bound affinity signal, null when nobody clicked.
  conversionRate: number | null;
}

export function computeFeedProductPerformance(events: AnalyticsEvent[], range: DateRange): FeedProductMetric[] {
  const map = new Map<
    string,
    { feedClicks: number; clickers: Set<string>; labelClicks: number; favorites: number; productViews: number; viewers: Set<string>; clickerViewers: Set<string> }
  >();
  for (const ev of events) {
    if (!withinRange(ev, range)) continue;
    const pid = ev.product_id || (ev.metadata?.productId as string | undefined);
    if (!pid) continue;
    let m = map.get(pid);
    if (!m) {
      m = { feedClicks: 0, clickers: new Set(), labelClicks: 0, favorites: 0, productViews: 0, viewers: new Set(), clickerViewers: new Set() };
      map.set(pid, m);
    }
    switch (ev.event_type) {
      case 'feed_product_click':
        m.feedClicks += 1;
        m.clickers.add(ev.visitor_id);
        break;
      case 'feed_favorite':
        if (ev.metadata?.action !== 'unsave') m.favorites += 1;
        break;
      case 'product_view':
        m.productViews += 1;
        m.viewers.add(ev.visitor_id);
        if (m.clickers.has(ev.visitor_id)) m.clickerViewers.add(ev.visitor_id);
        break;
      default: break;
    }
  }
  return Array.from(map.entries()).map(([productId, m]) => ({
    productId,
    feedClicks: m.feedClicks,
    uniqueClickers: m.clickers.size,
    labelClicks: 0,
    impressions: 0,
    favorites: m.favorites,
    productViews: m.productViews,
    uniqueProductViewers: m.viewers.size,
    conversionRate: rateUnique(m.clickerViewers.size, m.clickers.size),
  }));
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchMetric {
  query: string;
  count: number; // total search events for this query
  uniqueVisitors: number; // UNIQUE VISITORS who searched (was: sessions)
  uniqueSearchers: number;
  noResults: boolean;
  noResultCount: number;
  ledToProductView: boolean; // same-visitor correlation, no order enforced
  ledToFavorite: boolean;
  ledToTelegram: boolean;
}

export interface SearchSummary {
  topSearches: SearchMetric[];
  noResultSearches: SearchMetric[];
  totalSearches: number; // search events
  uniqueSearchers: number; // unique visitors who searched at least once
  withResults: number; // search EVENTS whose own metadata says results existed
  withoutResults: number;
  // Unique searchers who also viewed a product / unique searchers.
  // Coarse same-range affinity (no before/after order enforced).
  searchConversionRate: number | null;
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
      visitors: Set<string>;
      withResults: number;
      withoutResults: number;
      viewedVisitors: Set<string>;
      favVisitors: Set<string>;
      tgVisitors: Set<string>;
    }
  >();

  for (const ev of searchEvents) {
    const q = (ev.search_query || '').trim();
    if (!q) continue;
    let m = map.get(q);
    if (!m) {
      m = { query: q, count: 0, sessions: new Set(), visitors: new Set(), withResults: 0, withoutResults: 0, viewedVisitors: new Set(), favVisitors: new Set(), tgVisitors: new Set() };
      map.set(q, m);
    }
    m.count += 1;
    m.sessions.add(ev.session_id);
    m.visitors.add(ev.visitor_id);
    // Per-EVENT result flag: a query with 1 failure + 9 successes counts 9
    // with-results (previously the whole query was marked resultless).
    if (ev.metadata?.noResults) m.withoutResults += 1;
    else m.withResults += 1;
  }

  // Correlate outcomes within the same VISITOR in range (coarse affinity, no
  // before/after order enforced — documented, not causal proof).
  const queryVisitors = new Map<string, Set<string>>();
  for (const ev of searchEvents) {
    const q = (ev.search_query || '').trim();
    if (!q) continue;
    let s = queryVisitors.get(q);
    if (!s) {
      s = new Set();
      queryVisitors.set(q, s);
    }
    s.add(ev.visitor_id);
  }
  for (const ev of inRange) {
    if (ev.event_type === 'search') continue;
    for (const [q, visitors] of queryVisitors) {
      if (!visitors.has(ev.visitor_id)) continue;
      const m = map.get(q);
      if (!m) continue;
      if (ev.event_type === 'product_view') m.viewedVisitors.add(ev.visitor_id);
      if (ev.event_type === 'product_save') m.favVisitors.add(ev.visitor_id);
      if (isIntentEvent(ev.event_type)) m.tgVisitors.add(ev.visitor_id);
    }
  }

  const metrics: SearchMetric[] = Array.from(map.values()).map((m) => ({
    query: m.query,
    count: m.count,
    uniqueVisitors: m.visitors.size,
    uniqueSearchers: m.visitors.size,
    noResults: m.withoutResults > 0,
    noResultCount: m.withoutResults,
    ledToProductView: m.viewedVisitors.size > 0,
    ledToFavorite: m.favVisitors.size > 0,
    ledToTelegram: m.tgVisitors.size > 0,
  }));

  const totalSearches = metrics.reduce((sum, m) => sum + m.count, 0);
  const topSearches = [...metrics].sort((a, b) => b.count - a.count).slice(0, 8);
  const noResultSearches = [...metrics]
    .filter((m) => m.noResults)
    .sort((a, b) => b.noResultCount - a.noResultCount)
    .slice(0, 8);
  const allSearchers = new Set<string>();
  const convertingSearchers = new Set<string>();
  for (const m of map.values()) {
    for (const v of m.visitors) allSearchers.add(v);
    for (const v of m.viewedVisitors) convertingSearchers.add(v);
  }

  return {
    topSearches,
    noResultSearches,
    totalSearches,
    uniqueSearchers: allSearchers.size,
    withResults: Array.from(map.values()).reduce((s, m) => s + m.withResults, 0),
    withoutResults: Array.from(map.values()).reduce((s, m) => s + m.withoutResults, 0),
    searchConversionRate: rateUnique(convertingSearchers.size, allSearchers.size),
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
    const day = eventDay(ev); // Tashkent day — matches range buckets
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
  const categoryVisitors = new Set(
    inRange
      .filter((e) => e.event_type === 'category_view' || (e.event_type === 'product_view' && e.category_id))
      .map((e) => e.visitor_id)
  );
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
  if (categoryVisitors.size > 0) stages.push({ label: 'Kategoriya', value: categoryVisitors.size });
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
    // Asia/Tashkent hour — owner reads "18:00" as local evening.
    buckets[tashkentParts(ev.created_at).hour].count += 1;
  }
  return buckets;
}

export interface BreakdownRow {
  label: string;
  value: number; // UNIQUE VISITORS with this attribute (see below)
  events: number; // total events carrying this attribute
}

/**
 * Visitor-basis breakdowns. The previous event-count version labeled
 * "678 desktop + 107 mobile" next to "55 visitors" — heavy users dominated
 * and totals could not reconcile. Now: unique visitors per attribute value;
 * a visitor seen on two devices counts in both (disclosed in UI subtitle).
 * The raw event count rides along for transparency.
 */
function visitorBreakdown(
  events: AnalyticsEvent[],
  range: DateRange,
  pick: (e: AnalyticsEvent) => string
): BreakdownRow[] {
  const visitors = new Map<string, Set<string>>();
  const eventCounts = new Map<string, number>();
  for (const ev of events) {
    if (!withinRange(ev, range)) continue;
    const k = pick(ev);
    eventCounts.set(k, (eventCounts.get(k) ?? 0) + 1);
    let s = visitors.get(k);
    if (!s) {
      s = new Set();
      visitors.set(k, s);
    }
    s.add(ev.visitor_id);
  }
  return Array.from(visitors.entries())
    .map(([label, s]) => ({ label, value: s.size, events: eventCounts.get(label) ?? 0 }))
    .sort((a, b) => b.value - a.value);
}

export function deviceBreakdown(events: AnalyticsEvent[], range: DateRange): BreakdownRow[] {
  return visitorBreakdown(events, range, (e) =>
    typeof e.metadata?.device === 'string' ? e.metadata.device : 'unknown'
  );
}

export function sourceBreakdown(events: AnalyticsEvent[], range: DateRange): BreakdownRow[] {
  return visitorBreakdown(events, range, (e) =>
    typeof e.metadata?.source === 'string' ? e.metadata.source : 'unknown'
  );
}
