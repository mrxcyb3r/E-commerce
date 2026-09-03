import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { BUSINESS_CONFIG } from '../config/business';
import type { AnalyticsEvent, AnalyticsEventType } from '../types/supabase-db';

const SHOP_ID = BUSINESS_CONFIG.name || 'default';

export interface AnalyticsMetric {
  label: string;
  value: number;
  icon: string;
  color: string;
  subtext: string;
}

export interface DayCount {
  date: string;
  count: number;
}

export interface AnalyticsData {
  loading: boolean;
  error: string | null;
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  eventsByType: Record<string, number>;
  trafficByDay: DayCount[];
  topPages: { page: string; count: number }[];
  topProducts: { id: string; views: number; saves: number }[];
  topSearches: { query: string; count: number }[];
  noResultSearches: { query: string; count: number }[];
  feedActivity: { views: number; shares: number; productClicks: number };
  intent: { telegram: number; phone: number; directions: number; contact: number };
  insightLines: string[];
  refresh: () => Promise<void>;
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function useAnalyticsData(limit = 10000): AnalyticsData {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<AnalyticsEvent[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Reads go through a SECURITY DEFINER RPC so the analytics_events table
      // stays RLS-protected against direct anonymous reads.
      const { data, error: err } = await supabase.rpc('get_analytics_events', {
        p_shop_id: SHOP_ID,
        p_limit: limit,
      });
      if (err) {
        throw err;
      }
      setRows((data as AnalyticsEvent[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analitika ma\'lumotlarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const events = rows.slice().reverse();

  const byType: Record<string, number> = {};
  for (const ev of events) {
    byType[ev.event_type] = (byType[ev.event_type] ?? 0) + 1;
  }

  const visitors = new Set(events.map((e) => e.visitor_id)).size;
  const sessions = new Set(events.map((e) => e.session_id)).size;

  const dayBuckets: Record<string, number> = {};
  for (const ev of events) {
    if (ev.created_at) {
      const key = startOfUtcDay(new Date(ev.created_at)).toISOString().slice(0, 10);
      dayBuckets[key] = (dayBuckets[key] ?? 0) + 1;
    }
  }
  const sortedDays = Object.entries(dayBuckets).sort((a, b) => (a[0] < b[0] ? -1 : 1));

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - (13 - i));
    return startOfUtcDay(d).toISOString().slice(0, 10);
  });
  const trafficByDay: DayCount[] = last14.map((date) => ({
    date,
    count: dayBuckets[date] ?? 0,
  }));

  const pageCounts: Record<string, number> = {};
  const productStats: Record<string, { views: number; saves: number; unsaves: number }> = {};
  const searchCounts: Record<string, number> = {};
  const noResultCounts: Record<string, number> = {};

  let feedViews = 0;
  let feedShares = 0;
  let feedProductClicks = 0;
  let telegram = 0;
  let phone = 0;
  let directions = 0;
  let contact = 0;

  for (const ev of events) {
    if (ev.page_path) pageCounts[ev.page_path] = (pageCounts[ev.page_path] ?? 0) + 1;

    if (ev.event_type === 'product_view' && ev.product_id) {
      const s = productStats[ev.product_id] ?? { views: 0, saves: 0, unsaves: 0 };
      s.views += 1;
      productStats[ev.product_id] = s;
    } else if (ev.event_type === 'product_save' && ev.product_id) {
      const s = productStats[ev.product_id] ?? { views: 0, saves: 0, unsaves: 0 };
      s.saves += 1;
      productStats[ev.product_id] = s;
    } else if (ev.event_type === 'product_unsave' && ev.product_id) {
      const s = productStats[ev.product_id] ?? { views: 0, saves: 0, unsaves: 0 };
      s.unsaves += 1;
      productStats[ev.product_id] = s;
    }

    if (ev.event_type === 'search') {
      const q = ev.search_query?.trim();
      if (q) {
        if (ev.metadata?.noResults) {
          noResultCounts[q] = (noResultCounts[q] ?? 0) + 1;
        }
        searchCounts[q] = (searchCounts[q] ?? 0) + 1;
      }
    }

    if (ev.event_type === 'feed_view') feedViews += 1;
    else if (ev.event_type === 'feed_share') feedShares += 1;
    else if (ev.event_type === 'feed_product_click') feedProductClicks += 1;
    else if (ev.event_type === 'telegram_click') telegram += 1;
    else if (ev.event_type === 'phone_click') phone += 1;
    else if (ev.event_type === 'directions_click') directions += 1;
    else if (ev.event_type === 'contact_click') contact += 1;
  }

  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([page, count]) => ({ page, count }));

  const topProducts = Object.entries(productStats)
    .map(([id, s]) => ({ id, views: s.views, saves: s.saves }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  const topSearches = Object.entries(searchCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([query, count]) => ({ query, count }));

  const noResultSearches = Object.entries(noResultCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([query, count]) => ({ query, count }));

  const insightLines: string[] = buildInsights({
    events,
    byType,
    visitors,
    topProducts,
    topSearches,
    noResultSearches,
  });

  return {
    loading,
    error,
    totalPageViews: byType.page_view ?? 0,
    uniqueVisitors: visitors,
    totalSessions: sessions,
    eventsByType: byType,
    trafficByDay,
    topPages,
    topProducts,
    topSearches,
    noResultSearches,
    feedActivity: { views: feedViews, shares: feedShares, productClicks: feedProductClicks },
    intent: { telegram, phone, directions, contact },
    insightLines,
    refresh,
  };
}

interface InsightsInput {
  events: AnalyticsEvent[];
  byType: Record<string, number>;
  visitors: number;
  topProducts: { id: string; views: number; saves: number }[];
  topSearches: { query: string; count: number }[];
  noResultSearches: { query: string; count: number }[];
}

function buildInsights(input: InsightsInput): string[] {
  const lines: string[] = [];
  const { events, byType, visitors, topProducts, topSearches, noResultSearches } = input;
  const total = events.length;

  if (total === 0) {
    return lines;
  }

  if (byType.page_view) {
    lines.push(
      `Umumiy tashriflar: ${byType.page_view} sahifa ochilishi, ${visitors} noyob tashrifchi.`
    );
  }

  if (topProducts.length > 0) {
    const best = topProducts[0];
    lines.push(
      `Eng ko'p ko'rilgan mahsulot: ${byType[best.id] ? '' : ''}${best.views} ko'rish, ${best.saves} saqlash.`
    );
  }

  const night = events.filter(
    (e) =>
      e.created_at &&
      (new Date(e.created_at).getUTCHours() >= 19 ||
        new Date(e.created_at).getUTCHours() < 8)
  ).length;
  if (night > 0 && total > 0) {
    const pct = Math.round((night / total) * 100);
    lines.push(`${pct}% faollik kechki va tungi soatlarda (19:00 - 08:00) qayd etilgan.`);
  }

  if (noResultSearches.length > 0) {
    const topNo = noResultSearches[0];
    lines.push(`"${topNo.query}" qidiruvi (${topNo.count} marta) natija bermadi — mahsulot katalogida yo'q.`);
  }

  if (topSearches.length > 0) {
    lines.push(`Eng keng tarqalgan qidiruv: "${topSearches[0].query}" (${topSearches[0].count} marta).`);
  }

  const intent =
    (byType.telegram_click ?? 0) +
    (byType.phone_click ?? 0) +
    (byType.directions_click ?? 0) +
    (byType.contact_click ?? 0);
  if (intent > 0) {
    lines.push(
      `${intent} ta sotib olish niyati harakati (Telegram/Telefon/Xarita/Aloqa) qayd etildi.`
    );
  }

  const catEvents = events.filter((e) => e.event_type === 'category_view');
  if (catEvents.length > 0) {
    lines.push(`Kategoriyalar ${catEvents.length} marta ko'rib chiqilgan.`);
  }

  return lines.slice(0, 6);
}
