import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { BUSINESS_CONFIG } from '../config/business';
import type { AnalyticsEvent } from '../types/supabase-db';
import {
  presetRange,
  type DateRange,
  type RangeKey,
  type VisitorStats,
  type EventCounts,
  type ProductMetric,
  type CategoryMetric,
  type FeedMetric,
  type SearchSummary,
  type IntentMetric,
  type TrafficPoint,
  type FunnelStage,
  type HourBucket,
  type BreakdownRow,
  computeVisitorStats,
  countByType,
  computeProducts,
  computeCategories,
  computeFeed,
  computeFeedOverview,
  computeFeedFunnel,
  computeFeedActivityTrend,
  computeFeedLikeTrend,
  computeFeedProductPerformance,
  computeSearch,
  computeIntent,
  trafficSeries,
  buildFunnel,
  hourlyActivity,
  deviceBreakdown,
  sourceBreakdown,
} from '../lib/analytics/aggregate';
import { buildInsights, type Insight } from '../lib/analytics/insights';
import {
  computeAudience,
  computeTimeAnalytics,
  computeVisitorWindows,
  computeJourneys,
  computeComparison,
  computeWishlist,
  computeBusinessKpis,
  buildAdvancedFunnel,
  type Audience,
  type TimeAnalytics,
  type VisitorWindows,
  type Journey,
  type KpiCompare,
  type WishlistMetric,
  type BusinessKpis,
  type AdvancedFunnelStage,
} from '../lib/analytics/advanced';
import { buildAlerts, type Alert } from '../lib/analytics/alerts';
import { buildReport, productCsv, reportCsv, type ReportPeriod, type ReportSummary } from '../lib/analytics/reports';
import { periodRange } from '../lib/analytics/metrics';

const SHOP_ID = BUSINESS_CONFIG.name || 'default';
export const POLL_INTERVAL_MS = 6000;
export const LIVE_WINDOW_MS = 5 * 60 * 1000;

type CustomRange = { from: string; to: string } | null;

export interface AnalyticsData {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  rows: number;
  /** Raw all-time event rows (unfiltered fetch, capped by the RPC limit). */
  events: AnalyticsEvent[];
  eventsInRange: number;
  eventsByType: EventCounts;
  stats: VisitorStats;
  products: ProductMetric[];
  categories: CategoryMetric[];
  feed: FeedMetric[];
  feedOverview: ReturnType<typeof computeFeedOverview>;
  feedFunnel: ReturnType<typeof computeFeedFunnel>;
  feedActivityTrend: ReturnType<typeof computeFeedActivityTrend>;
  feedLikeTrend: ReturnType<typeof computeFeedLikeTrend>;
  feedProductPerformance: ReturnType<typeof computeFeedProductPerformance>;
  search: SearchSummary;
  intent: IntentMetric;
  traffic: TrafficPoint[];
  funnel: FunnelStage[];
  advancedFunnel: AdvancedFunnelStage[];
  hourly: HourBucket[];
  devices: BreakdownRow[];
  sources: BreakdownRow[];
  insights: Insight[];
  alerts: Alert[];
  audience: Audience;
  timeAnalytics: TimeAnalytics;
  visitorWindows: VisitorWindows;
  journeys: Journey[];
  comparison: Record<string, KpiCompare>;
  wishlist: WishlistMetric;
  kpis: BusinessKpis;
  report: ReportSummary;
  range: RangeKey | 'custom';
  rangeDate: DateRange;
  isCustomRange: boolean;
  setRange: (r: RangeKey) => void;
  setCustomRange: (from: string, to: string) => void;
  buildReportCsv: (period: ReportPeriod) => string;
  buildProductCsv: () => string;
  refresh: () => Promise<void>;
  lastUpdated: number | null;
}

export function useAnalyticsData(resolvers?: {
  resolveProduct?: (id: string) => string;
  resolveCategory?: (id: string) => string;
}): AnalyticsData {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<AnalyticsEvent[]>([]);
  const [rangeKey, setRangeKey] = useState<RangeKey | 'custom'>('14d');
  const [custom, setCustom] = useState<CustomRange>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (opts?.silent) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.rpc('get_analytics_events', {
        p_shop_id: SHOP_ID,
        p_limit: 50000,
      });
      if (err) throw err;
      setRows((data as AnalyticsEvent[]) ?? []);
      setLastUpdated(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analitika ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time: poll silently so charts update as new events arrive.
  useEffect(() => {
    const id = setInterval(() => {
      void load({ silent: true });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  // Refresh immediately when the tab regains focus.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const setRange = useCallback((r: RangeKey) => {
    setRangeKey(r);
    setCustom(null);
  }, []);

  const setCustomRange = useCallback((from: string, to: string) => {
    setRangeKey('custom');
    setCustom({ from, to });
  }, []);

  const range: DateRange = useMemo(() => {
    if (rangeKey === 'custom' && custom) return custom;
    return presetRange(rangeKey as RangeKey);
  }, [rangeKey, custom]);

  const aggregate = useMemo(() => {
    const stats = computeVisitorStats(rows, range);
    const eventsByType = countByType(rows, range);
    const products = computeProducts(rows, range);
    const categories = computeCategories(rows, range);
    const feed = computeFeed(rows, range);
    const feedOverview = computeFeedOverview(rows, range);
    const feedFunnel = computeFeedFunnel(rows, range);
    const feedActivityTrend = computeFeedActivityTrend(rows, range);
    const feedLikeTrend = computeFeedLikeTrend(rows, range);
    const feedProductPerformance = computeFeedProductPerformance(rows, range);
    const search = computeSearch(rows, range);
    const intent = computeIntent(rows, range);
    const traffic = trafficSeries(rows, range);
    const funnel = buildFunnel(rows, range);
    const advancedFunnel = buildAdvancedFunnel(rows, range);
    const hourly = hourlyActivity(rows, range);
    const devices = deviceBreakdown(rows, range);
    const sources = sourceBreakdown(rows, range);
    const insights = buildInsights({
      stats,
      products,
      categories,
      feed,
      search,
      intent,
      events: rows,
      range,
      resolveProduct: resolvers?.resolveProduct,
      resolveCategory: resolvers?.resolveCategory,
    });    const alerts = buildAlerts({
      events: rows,
      range,
      products,
      feed,
      search,
      resolveProduct: resolvers?.resolveProduct,
      resolveVideo: undefined,
    });
    const audience = computeAudience(rows, range);
    const timeAnalytics = computeTimeAnalytics(rows, range);
    const visitorWindows = computeVisitorWindows(rows, range, LIVE_WINDOW_MS);
    const journeys = computeJourneys(rows, range);
    const comparison = computeComparison({ events: rows, range, products, feed });
    const wishlist = computeWishlist(rows, range);
    const kpis = computeBusinessKpis({ events: rows, range, products, feed, categories, returningRate: stats.returningRate });
    const report = buildReport(rows, range, products, categories, feed, 'weekly');    return {
      stats,
      eventsByType,
      products,
      categories,
      feed,
      feedOverview,
      feedFunnel,
      feedActivityTrend,
      feedLikeTrend,
      feedProductPerformance,
      search,
      intent,
      traffic,
      funnel,
      advancedFunnel,
      hourly,
      devices,
      sources,
      insights,
      alerts,
      audience,
      timeAnalytics,
      visitorWindows,
      journeys,
      comparison,
      wishlist,
      kpis,
      report,
    };
  }, [rows, range, resolvers]);

  const buildReportCsv = useCallback(
    (period: ReportPeriod) => {
      // Each export covers its own real window (daily = last 1 day, weekly =
      // last 7, monthly = last 30, Asia/Tashkent) — previously every button
      // exported the currently selected range with a different label.
      const periodKey = period === 'daily' ? 'daily' : period === 'weekly' ? 'weekly' : 'monthly';
      const r = buildReport(rows, periodRange(periodKey), aggregate.products, aggregate.categories, aggregate.feed, period);
      return reportCsv(r);
    },
    [rows, aggregate]
  );

  const buildProductCsv = useCallback(() => productCsv(aggregate.products), [aggregate]);

  return {
    loading,
    refreshing,
    error,
    rows: rows.length,
    events: rows,
    // Total EVENTS inside the selected range (the `rows` count above is the
    // unfiltered all-time fetch size — never mix them in one card row).
    eventsInRange: Object.values(aggregate.eventsByType).reduce((s, n) => s + n, 0),
    eventsByType: aggregate.eventsByType,
    stats: aggregate.stats,
    products: aggregate.products,
    categories: aggregate.categories,
    feed: aggregate.feed,
    feedOverview: aggregate.feedOverview,
    feedFunnel: aggregate.feedFunnel,
    feedActivityTrend: aggregate.feedActivityTrend,
    feedLikeTrend: aggregate.feedLikeTrend,
    feedProductPerformance: aggregate.feedProductPerformance,
    search: aggregate.search,
    intent: aggregate.intent,
    traffic: aggregate.traffic,
    funnel: aggregate.funnel,
    advancedFunnel: aggregate.advancedFunnel,
    hourly: aggregate.hourly,
    devices: aggregate.devices,
    sources: aggregate.sources,
    insights: aggregate.insights,
    alerts: aggregate.alerts,
    audience: aggregate.audience,
    timeAnalytics: aggregate.timeAnalytics,
    visitorWindows: aggregate.visitorWindows,
    journeys: aggregate.journeys,
    comparison: aggregate.comparison,
    wishlist: aggregate.wishlist,
    kpis: aggregate.kpis,
    report: aggregate.report,
    range: rangeKey,
    rangeDate: range,
    isCustomRange: rangeKey === 'custom',
    setRange,
    setCustomRange,
    buildReportCsv,
    buildProductCsv,
    refresh,
    lastUpdated,
  };
}
