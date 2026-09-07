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
import { eventDay, tashkentParts } from './metrics';

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
  /** Owner-facing name resolvers — insights must never print raw prod- IDs. */
  resolveProduct?: (id: string) => string;
  resolveCategory?: (id: string) => string;
}

const fmt = (n: number): string => n.toLocaleString('uz-UZ');

export function buildInsights(input: InsightInput): Insight[] {
  const insights: Insight[] = [];
  const { stats, products, categories, feed, search, intent, events, range } = input;
  const pName = input.resolveProduct ?? ((id: string) => id);
  const cName = input.resolveCategory ?? ((id: string) => id);

  const totalEvents = events.filter((e) => {
    const day = eventDay(e);
    return day !== '' && day >= range.from && day <= range.to;
  }).length;
  if (totalEvents === 0) return insights;

  // Visitor health — only claim "returning is growing" when the returning
  // calculation has real support (≥5 returning visitors); otherwise stay quiet
  // instead of manufacturing advice.
  if (stats.uniqueVisitors > 0) {
    if (stats.returningRate >= 0.2 && stats.returningVisitors >= 5) {
      insights.push({
        kind: 'good',
        text: `${fmt(stats.uniqueVisitors)} noyob tashrifchidan ${fmt(stats.returningVisitors)} tasi qayta kelgan (${Math.round(stats.returningRate * 100)}%) — do'konga qaytib kelayotganlar ko'paymoqda.`,
      });
    } else if (stats.uniqueVisitors >= 5) {
      insights.push({
        kind: 'info',
        text: `${fmt(stats.uniqueVisitors)} noyob tashrifchi qayd etildi.`,
      });
    }
  }

  // Product attention
  const productsWithViews = products.filter((p) => p.views > 0);
  if (productsWithViews.length > 0) {
    const [top] = [...productsWithViews].sort((a, b) => b.views - a.views);
    insights.push({
      kind: 'good',
      text: `Eng ko'p e'tibor: "${pName(top.id)}" — ${fmt(top.views)} ko'rish, ${fmt(top.uniqueViewers)} noyob tomoshabin, ${fmt(top.saves)} marta saqlangan.`,
    });
  }

  // Trending products — rising view activity in the recent half of the range.
  const trending = productsWithViews.filter((p) => p.isTrending).sort((a, b) => b.views - a.views);
  if (trending.length > 0) {
    const t = trending[0];
    insights.push({
      kind: 'good',
      text: `Trenddagi mahsulot: "${pName(t.id)}" — so'nggi davrda ko'rishlar oshib bormoqda (${fmt(t.views)} ko'rish).`,
    });
  }

  // Long-dwell products — real measured time spent on the product page.
  const dwellers = productsWithViews
    .filter((p) => p.avgDwellSec >= 10)
    .sort((a, b) => b.avgDwellSec - a.avgDwellSec);
  if (dwellers.length > 0) {
    const d = dwellers[0];
    insights.push({
      kind: 'info',
      text: `Mijozlar "${pName(d.id)}" sahifasida uzoq qolmoqda (o'rtacha ${fmt(d.avgDwellSec)} soniya) — tavsif va rasmlar diqqatni tortmoqda.`,
    });
  }

  // Products with views but low engagement (actionable) — engagementRate is
  // visitor-based and bounded, so the % shown is always honest.
  const lowEngagement = [...productsWithViews]
    .filter((p) => p.views >= 2 && (p.engagementRate ?? 1) < 0.15)
    .sort((a, b) => (a.engagementRate ?? 0) - (b.engagementRate ?? 0))
    .slice(0, 1);
  if (lowEngagement.length > 0) {
    const p = lowEngagement[0];
    const rate = p.engagementRate === null ? '—' : `${Math.round(p.engagementRate * 100)}%`;
    insights.push({
      kind: 'warn',
      text: `"${pName(p.id)}" ${fmt(p.views)} marta ko'rildi, lekin kam ishtirok (${rate}) — narx yoki tavsifni qayta ko'rib chiqish foydali bo'lishi mumkin.`,
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

  // Category strength — only when category tracking has real support
  // (≥1 category view); "strongest: 0 views" helps nobody.
  if (categories.length > 0) {
    const best = [...categories].sort((a, b) => b.views - a.views)[0];
    if (best.views > 0) {
      insights.push({
        kind: 'good',
        text: `Eng kuchli toifa: "${cName(best.id)}" — ${fmt(best.views)} ko'rish, ${fmt(best.productOpens)} mahsulot ochilishi, ${fmt(best.conversions)} aloqa harakati.`,
      });
    }
  }

  // Time of day — Asia/Tashkent hours and Tashkent day buckets.
  const hourly = Array.from({ length: 24 }, (_, h) => h);
  const countByHour = hourly.map((h) => ({
    h,
    c: events.filter(
      (e) => {
        if (!e.created_at) return false;
        const day = eventDay(e);
        return tashkentParts(e.created_at).hour === h && day >= range.from && day <= range.to;
      }
    ).length,
  }));
  const evening = countByHour.filter((x) => x.h >= 18 && x.h <= 23).reduce((s, x) => s + x.c, 0);
  const daytime = countByHour.filter((x) => x.h >= 9 && x.h < 18).reduce((s, x) => s + x.c, 0);
  if (evening > 0 && daytime > 0 && evening >= daytime) {
    insights.push({
      kind: 'info',
      text: `Faollik asosan kechki soatlarda (18:00–23:59): ${fmt(evening)} ta harakat, kunduzgi ${fmt(daytime)} tadan ko'proq.`,
    });
  }

  // Feed performance
  const feedWithViews = feed.filter((f) => f.views > 0);
  if (feedWithViews.length > 0) {
    const totalFeedProductClicks = feedWithViews.reduce((s, f) => s + f.productClicks, 0);
    const topFeed = [...feedWithViews].sort((a, b) => b.views - a.views)[0];
    insights.push({
      kind: 'good',
      text: `Video ko'rishlar samara bermoqda: eng yaxshi post ${fmt(topFeed.views)} ko'rish va ${fmt(topFeed.productClicks)} mahsulotga o'tish berdi.`,
    });
    if (totalFeedProductClicks > 0 && stats.totalPageViews > 0) {
      insights.push({
        kind: 'info',
        text: `Feed orqali ${fmt(totalFeedProductClicks)} ta mahsulotga o'tish qayd etildi — videolar mijozlarni mahsulotlarga olib kelyapti.`,
      });
    }
  }

  // Intent
  if (intent.total > 0) {
    insights.push({
      kind: 'good',
      text: `${fmt(intent.total)} ta aloqa harakati (${fmt(intent.telegram)} Telegram, ${fmt(intent.phone)} qo'ng'iroq, ${fmt(intent.directions)} manzil) qayd etildi.`,
    });
  }

  return insights.slice(0, 8);
}
