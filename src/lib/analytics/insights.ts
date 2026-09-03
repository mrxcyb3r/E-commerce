// Deterministic business-insight engine. Every insight is derived strictly from
// the aggregated real data passed in. No external AI, no fabrication. If there
// is not enough signal for a claim, the insight is simply not emitted.

import type {
  VisitorStats,
  ProductMetric,
  CategoryMetric,
  FeedMetric,
  SearchSummary,
  IntentMetric,
  DateRange,
} from './aggregate';
import type { AnalyticsEvent } from '../../types/supabase-db';

export interface Insight {
  text: string;
  kind: 'good' | 'warn' | 'info';
}

interface InsightInput {
  stats: VisitorStats;
  products: ProductMetric[];
  categories: CategoryMetric[];
  feed: FeedMetric[];
  search: SearchSummary;
  intent: IntentMetric;
  events: AnalyticsEvent[];
  range: DateRange;
}

const fmt = (n: number): string => n.toLocaleString('uz-UZ');

export function buildInsights(input: InsightInput): Insight[] {
  const insights: Insight[] = [];
  const { stats, products, categories, feed, search, intent, events, range } = input;

  const totalEvents = events.filter((e) => e.created_at && e.created_at.slice(0, 10) >= range.from && e.created_at.slice(0, 10) <= range.to).length;
  if (totalEvents === 0) return insights;

  // Visitor health
  if (stats.uniqueVisitors > 0) {
    if (stats.returningRate >= 0.2) {
      insights.push({
        kind: 'good',
        text: `${fmt(stats.uniqueVisitors)} noyob tashrifchidan ${fmt(stats.returningVisitors)} tasi qayta kelgan (${Math.round(stats.returningRate * 100)}%) — do'konga sodiq mijozlar shakllanmoqda.`,
      });
    } else {
      insights.push({
        kind: 'info',
        text: `${fmt(stats.uniqueVisitors)} noyob tashrifchi qayd etildi. Qayta tashriflar hali kam — mijozlarni Telegram orqali qayta jalb qilish mumkin.`,
      });
    }
  }

  // Product attention
  const productsWithViews = products.filter((p) => p.views > 0);
  if (productsWithViews.length > 0) {
    const [top] = [...productsWithViews].sort((a, b) => b.views - a.views);
    insights.push({
      kind: 'good',
      text: `Eng ko'p e'tibor: "${top.id}" — ${fmt(top.views)} ko'rish, ${fmt(top.uniqueViewers)} noyob tomoshabin, ${fmt(top.saves)} marta saqlangan.`,
    });
  }

  // Products with views but low engagement (actionable)
  const lowEngagement = [...productsWithViews]
    .filter((p) => p.views >= 2 && p.engagementRate < 0.15)
    .sort((a, b) => a.engagementRate - b.engagementRate)
    .slice(0, 1);
  if (lowEngagement.length > 0) {
    const p = lowEngagement[0];
    insights.push({
      kind: 'warn',
      text: `"${p.id}" ${fmt(p.views)} marta ko'rildi, lekin kam ishtirok (${Math.round(p.engagementRate * 100)}%) — narx yoki tavsifni qayta ko'rib chiqish foydali bo'lishi mumkin.`,
    });
  }

  // Searches without results
  if (search.noResultSearches.length > 0) {
    const topNo = search.noResultSearches[0];
    insights.push({
      kind: 'warn',
      text: `"${topNo.query}" qidiruvi ${fmt(topNo.noResultCount)} marta natija bermadi — mijozlar katalogda yo'q mahsulot izlayapti.`,
    });
  }

  // Best search
  if (search.topSearches.length > 0) {
    const topSearch = search.topSearches[0];
    insights.push({
      kind: 'info',
      text: `Eng keng tarqalgan qidiruv: "${topSearch.query}" (${fmt(topSearch.count)} marta, ${fmt(topSearch.uniqueVisitors)} noyob foydalanuvchi).`,
    });
  }

  // Category strength
  if (categories.length > 0) {
    const best = [...categories].sort((a, b) => b.views - a.views)[0];
    insights.push({
      kind: 'good',
      text: `Eng kuchli toifa: ${fmt(best.views)} ko'rish, ${fmt(best.productOpens)} mahsulot ochilishi, ${fmt(best.conversions)} bog'lanish harakati.`,
    });
  }

  // Time of day
  const hourly = Array.from({ length: 24 }, (_, h) => h);
  const countByHour = hourly.map((h) => ({
    h,
    c: events.filter(
      (e) => e.created_at && new Date(e.created_at).getUTCHours() === h &&
        e.created_at.slice(0, 10) >= range.from && e.created_at.slice(0, 10) <= range.to
    ).length,
  }));
  const evening = countByHour.filter((x) => x.h >= 18 && x.h <= 23).reduce((s, x) => s + x.c, 0);
  const daytime = countByHour.filter((x) => x.h >= 9 && x.h < 18).reduce((s, x) => s + x.c, 0);
  if (evening > 0 && daytime > 0 && evening >= daytime) {
    insights.push({
      kind: 'info',
      text: `Faollik asosan kechki soatlarda (18:00–23:59): ${fmt(evening)} ta harakat kunduzgi ${fmt(daytime)} tadan ko'p.`,
    });
  }

  // Feed performance
  const feedWithViews = feed.filter((f) => f.views > 0);
  if (feedWithViews.length > 0) {
    const totalFeedProductClicks = feedWithViews.reduce((s, f) => s + f.productClicks, 0);
    const topFeed = [...feedWithViews].sort((a, b) => b.views - a.views)[0];
    insights.push({
      kind: 'good',
      text: `Video kontent ishlayapti: eng yaxshi post ${fmt(topFeed.views)} ko'rish va ${fmt(topFeed.productClicks)} mahsulotga o'tish berdi.`,
    });
    if (totalFeedProductClicks > 0 && stats.totalPageViews > 0) {
      insights.push({
        kind: 'info',
        text: `Feed video orqali ${fmt(totalFeedProductClicks)} ta mahsulotga o'tish qayd etildi — kashfiyot kanali sifatida ishlayapti.`,
      });
    }
  }

  // Intent
  if (intent.total > 0) {
    insights.push({
      kind: 'good',
      text: `${fmt(intent.total)} ta yuqori niyatli harakat (${fmt(intent.telegram)} Telegram, ${fmt(intent.phone)} qo'ng'iroq, ${fmt(intent.directions)} manzil) qayd etildi.`,
    });
  }

  return insights.slice(0, 8);
}
