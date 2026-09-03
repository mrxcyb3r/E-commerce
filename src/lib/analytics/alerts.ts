// Rule-based alert engine. Alerts are derived strictly from real aggregated
// data — no predictions, no fabricated thresholds on empty data. An alert fires
// only when an actual measurable condition is met. If there is insufficient data
// for a rule, the rule is simply skipped.

import type { AnalyticsEvent } from '../../types/supabase-db';
import { withinRange, type DateRange, type ProductMetric, type FeedMetric, type SearchSummary } from './aggregate';

export type AlertLevel = 'info' | 'warn' | 'alert';

export interface Alert {
  level: AlertLevel;
  title: string;
  detail: string;
}

const fmt = (n: number): string => n.toLocaleString('uz-UZ');

export function buildAlerts(input: {
  events: AnalyticsEvent[];
  range: DateRange;
  products: ProductMetric[];
  feed: FeedMetric[];
  search: SearchSummary;
}): Alert[] {
  const alerts: Alert[] = [];
  const inRange = input.events.filter((e) => withinRange(e, input.range));
  const days = Math.max(1, Math.round((new Date(input.range.to + 'T00:00:00Z').getTime() - new Date(input.range.from + 'T00:00:00Z').getTime()) / 86400000) + 1);

  // A product "suddenly popular" — gained many views and strong repeat interest.
  const trending = input.products.filter((p) => p.isTrending && p.views >= 3);
  if (trending.length > 0) {
    const top = [...trending].sort((a, b) => b.views - a.views)[0];
    alerts.push({
      level: 'info',
      title: 'Mahsulot trendga chiqdi',
      detail: `"${top.id}" ${fmt(top.views)} ko'rish bilan tez o'smoqda — inventar va reklamani ustuvor qiling.`,
    });
  }

  // A product with many favorites signals rising interest.
  const hot = input.products.filter((p) => p.saves >= 5 && p.uniqueSavers >= 2);
  if (hot.length > 0) {
    const top = [...hot].sort((a, b) => b.saves - a.saves)[0];
    alerts.push({
      level: 'info',
      title: 'Ko\'p saqlangan mahsulot',
      detail: `"${top.id}" ${fmt(top.saves)} marta saqlangan (${fmt(top.uniqueSavers)} mijoz).`,
    });
  }

  // Failed searches increasing — actionable demand signal.
  if (input.search.noResultSearches.length > 0) {
    const topNo = input.search.noResultSearches[0];
    if (topNo.noResultCount >= 2) {
      alerts.push({
        level: 'warn',
        title: 'Qidiruvlar natija bermayapti',
        detail: `"${topNo.query}" ${fmt(topNo.noResultCount)} marta natijasiz — mijozlar yo'q mahsulot izlayapti.`,
      });
    }
  }

  // Telegram intent signal.
  const telegram = inRange.filter((e) => e.event_type === 'telegram_click').length;
  if (telegram >= 5) {
    alerts.push({
      level: 'info',
      title: 'Telegram faolligi yuqori',
      detail: `Ushbu davrda ${fmt(telegram)} ta Telegram bosish qayd etildi.`,
    });
  }

  // Feed going viral.
  const viral = input.feed.filter((f) => f.views >= days * 5 && f.views >= 10);
  if (viral.length > 0) {
    const top = [...viral].sort((a, b) => b.views - a.views)[0];
    alerts.push({
      level: 'info',
      title: 'Feed post viral bo\'ldi',
      detail: `"${top.id}" ${fmt(top.views)} ko'rish, ${fmt(top.productClicks)} mahsulotga o'tish.`,
    });
  }

  // Products with views but zero engagement for the whole period.
  const ignored = input.products.filter((p) => p.views >= 3 && p.engagementRate === 0);
  if (ignored.length > 0) {
    const top = [...ignored].sort((a, b) => b.views - a.views)[0];
    alerts.push({
      level: 'warn',
      title: 'Mahsulotlar e\'tiborsiz qolmoqda',
      detail: `"${top.id}" ${fmt(top.views)} marta ko'rildi, ammo hech qanday savdo/harakat yo'q.`,
    });
  }

  return alerts.slice(0, 6);
}
