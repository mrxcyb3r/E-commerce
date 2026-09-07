// Report builders for daily / weekly / monthly summaries, plus CSV export.
// All numbers come from real events; reports are aggregations over real rows.

import type { AnalyticsEvent } from '../../types/supabase-db';
import { withinRange, type DateRange, type ProductMetric, type CategoryMetric, type FeedMetric } from './aggregate';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface ReportSummary {
  period: ReportPeriod;
  range: DateRange;
  uniqueVisitors: number;
  pageViews: number;
  sessions: number;
  productViews: number;
  saves: number;
  searches: number;
  intent: number;
  topProduct: string | null;
  topCategory: string | null;
  topFeed: string | null;
}

function summarize(
  events: AnalyticsEvent[],
  range: DateRange,
  products: ProductMetric[],
  categories: CategoryMetric[],
  feed: FeedMetric[],
  period: ReportPeriod
): ReportSummary {
  const inRange = events.filter((e) => withinRange(e, range));
  const counts = (t: string) => inRange.filter((e) => e.event_type === t).length;
  return {
    period,
    range,
    uniqueVisitors: new Set(inRange.map((e) => e.visitor_id)).size,
    pageViews: counts('page_view'),
    sessions: new Set(inRange.map((e) => e.session_id)).size,
    productViews: counts('product_view'),
    saves: counts('product_save'),
    searches: counts('search'),
    // Canonical intent set (telegram + phone + directions + contact) — matches
    // computeIntent and computeComparison. Previously contact_click was
    // excluded here, producing a third, conflicting "intent" number.
    intent: counts('telegram_click') + counts('phone_click') + counts('directions_click') + counts('contact_click'),
    topProduct: products.length ? [...products].sort((a, b) => b.views - a.views)[0]?.id ?? null : null,
    topCategory: categories.length ? [...categories].sort((a, b) => b.views - a.views)[0]?.id ?? null : null,
    topFeed: feed.length ? [...feed].sort((a, b) => b.views - a.views)[0]?.id ?? null : null,
  };
}

export function buildReport(
  events: AnalyticsEvent[],
  range: DateRange,
  products: ProductMetric[],
  categories: CategoryMetric[],
  feed: FeedMetric[],
  period: ReportPeriod
): ReportSummary {
  return summarize(events, range, products, categories, feed, period);
}

// --- CSV export -------------------------------------------------------------

const esc = (v: string | number): string => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function productCsv(products: ProductMetric[]): string {
  const header = [
    'product_id', 'views', 'unique_viewers', 'returning_viewers', 'saves', 'unique_savers',
    'shares', 'telegram', 'phone', 'map', 'avg_dwell_sec', 'engagement_rate', 'trending',
  ];
  const rows = products.map((p) =>
    [p.id, p.views, p.uniqueViewers, p.returningViewers, p.saves, p.uniqueSavers,
      p.shareClicks, p.telegramClicks, p.phoneClicks, p.mapClicks, p.avgDwellSec,
      (p.engagementRate * 100).toFixed(1), p.isTrending ? 'yes' : 'no']
      .map(esc)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

export function reportCsv(summary: ReportSummary): string {
  const header = ['period', 'from', 'to', 'visitors', 'page_views', 'sessions', 'product_views', 'saves', 'searches', 'intent', 'top_product', 'top_category', 'top_feed'];
  const row = [
    summary.period, summary.range.from, summary.range.to, summary.uniqueVisitors, summary.pageViews,
    summary.sessions, summary.productViews, summary.saves, summary.searches, summary.intent,
    summary.topProduct ?? '', summary.topCategory ?? '', summary.topFeed ?? '',
  ].map(esc).join(',');
  return [header.join(','), row].join('\n');
}
