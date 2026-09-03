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
  computeSearch,
  computeIntent,
  trafficSeries,
  buildFunnel,
  hourlyActivity,
  deviceBreakdown,
  sourceBreakdown,
} from '../lib/analytics/aggregate';
import { buildInsights, type Insight } from '../lib/analytics/insights';

const SHOP_ID = BUSINESS_CONFIG.name || 'default';
export const POLL_INTERVAL_MS = 15000;

export interface AnalyticsData {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  rows: number;
  eventsByType: EventCounts;
  stats: VisitorStats;
  products: ProductMetric[];
  categories: CategoryMetric[];
  feed: FeedMetric[];
  search: SearchSummary;
  intent: IntentMetric;
  traffic: TrafficPoint[];
  funnel: FunnelStage[];
  hourly: HourBucket[];
  devices: BreakdownRow[];
  sources: BreakdownRow[];
  insights: Insight[];
  range: RangeKey;
  setRange: (r: RangeKey) => void;
  refresh: () => Promise<void>;
  lastUpdated: number | null;
}

export function useAnalyticsData(): AnalyticsData {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<AnalyticsEvent[]>([]);
  const [rangeKey, setRangeKey] = useState<RangeKey>('14d');
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

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const setRange = useCallback((r: RangeKey) => {
    setRangeKey(r);
  }, []);

  const range: DateRange = useMemo(() => presetRange(rangeKey), [rangeKey]);

  const aggregate = useMemo(() => {
    const stats = computeVisitorStats(rows, range);
    const eventsByType = countByType(rows, range);
    const products = computeProducts(rows, range);
    const categories = computeCategories(rows, range);
    const feed = computeFeed(rows, range);
    const search = computeSearch(rows, range);
    const intent = computeIntent(rows, range);
    const traffic = trafficSeries(rows, range);
    const funnel = buildFunnel(rows, range);
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
    });
    return {
      stats,
      eventsByType,
      products,
      categories,
      feed,
      search,
      intent,
      traffic,
      funnel,
      hourly,
      devices,
      sources,
      insights,
    };
  }, [rows, range]);

  return {
    loading,
    refreshing,
    error,
    rows: rows.length,
    eventsByType: aggregate.eventsByType,
    stats: aggregate.stats,
    products: aggregate.products,
    categories: aggregate.categories,
    feed: aggregate.feed,
    search: aggregate.search,
    intent: aggregate.intent,
    traffic: aggregate.traffic,
    funnel: aggregate.funnel,
    hourly: aggregate.hourly,
    devices: aggregate.devices,
    sources: aggregate.sources,
    insights: aggregate.insights,
    range: rangeKey,
    setRange,
    refresh,
    lastUpdated,
  };
}
