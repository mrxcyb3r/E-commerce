// Canonical analytics definitions — the single source of truth for metric
// semantics across the admin. Every aggregation in aggregate.ts / advanced.ts
// and every label on /admin/analytics must follow these definitions:
//
//   Metric        → event source → aggregation → denominator → time range
//   → uniqueness rule
//
// Rules enforced here:
//  1. RATES ARE VISITOR-BASED. A percentage is always
//     uniqueVisitors(numeratorAction) / uniqueVisitors(denominatorAction).
//     Event-count/event-count ratios can exceed 100% and must NEVER be shown
//     as %. rateUnique() returns null when the denominator is 0 so the UI
//     renders "—" instead of a misleading 0% or Infinity.
//  2. COUNTS state their basis explicitly (event count vs unique visitors).
//  3. ALL wall-clock interpretation uses Asia/Tashkent (UTC+5, no DST).
//     created_at is stored as UTC timestamptz; day/hour buckets below convert
//     to Tashkent before bucketing so "evening" means evening in Uzbekistan.
//  4. OWNER LANGUAGE ONLY. Technical event names never reach owner-facing UI;
//     EVENT_LABELS maps every event to plain Uzbek.
//  5. INTENT (contact) actions are canonically:
//     telegram_click + phone_click + directions_click + contact_click.
//     Every "intent"/"aloqa" total must use exactly this set.

import type { AnalyticsEvent, AnalyticsEventType } from '../../types/supabase-db';
import type { DateRange } from './aggregate';

// ---------------------------------------------------------------------------
// Timezone: Asia/Tashkent = UTC+5 year-round (no daylight saving).
// ---------------------------------------------------------------------------

export const STORE_TIMEZONE = 'Asia/Tashkent';
export const TASHKENT_OFFSET_MS = 5 * 3600 * 1000;

/** Tashkent wall-clock parts for a UTC timestamp. */
export function tashkentParts(input: string | number | Date): { hour: number; day: number; date: string } {
  const t = input instanceof Date ? input.getTime() : typeof input === 'number' ? input : new Date(input).getTime();
  const d = new Date(t + TASHKENT_OFFSET_MS);
  return {
    hour: d.getUTCHours(),
    day: d.getUTCDay(), // 0 = Sunday
    date: d.toISOString().slice(0, 10), // yyyy-mm-dd in Tashkent
  };
}

/** yyyy-mm-dd of "today" in Tashkent. */
export function tashkentToday(): string {
  return tashkentParts(Date.now()).date;
}

/** Epoch ms of Tashkent midnight that contains `nowMs`. */
export function startOfTashkentDay(nowMs: number): number {
  const { date } = tashkentParts(nowMs);
  return new Date(date + 'T00:00:00Z').getTime() - TASHKENT_OFFSET_MS;
}

/** Epoch ms of Tashkent Monday 00:00 of the current week. */
export function startOfTashkentWeek(nowMs: number): number {
  const { day } = tashkentParts(nowMs);
  const offset = day === 0 ? 6 : day - 1; // Monday-first
  return startOfTashkentDay(nowMs) - offset * 86400000;
}

/** Epoch ms of the 1st of the current month, 00:00 Tashkent. */
export function startOfTashkentMonth(nowMs: number): number {
  const t = new Date(nowMs + TASHKENT_OFFSET_MS);
  return Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), 1) - TASHKENT_OFFSET_MS;
}

/** Day bucket (yyyy-mm-dd, Tashkent) for an event, '' when unparseable. */
export function eventDay(ev: Pick<AnalyticsEvent, 'created_at'>): string {
  if (!ev.created_at) return '';
  const t = new Date(ev.created_at).getTime();
  if (!Number.isFinite(t)) return '';
  return tashkentParts(t).date;
}

// ---------------------------------------------------------------------------
// Event taxonomy (existing schema reused — no new event names).
// ---------------------------------------------------------------------------

/** Contact-intent events. Canonical set — every intent total uses all four. */
export const INTENT_EVENTS: readonly AnalyticsEventType[] = [
  'telegram_click',
  'phone_click',
  'directions_click',
  'contact_click',
];

export function isIntentEvent(t: string): boolean {
  return (INTENT_EVENTS as readonly string[]).includes(t);
}

/** Owner-facing Uzbek label for every known event type. No jargon leaks. */
export const EVENT_LABELS: Record<AnalyticsEventType, string> = {
  page_view: 'Sahifa ochilishi',
  product_view: 'Mahsulot ko‘rishi',
  product_dwell: 'Mahsulotda qolish',
  product_share: 'Mahsulot ulashishi',
  product_save: 'Sevimlilarga qo‘shish',
  product_unsave: 'Sevimlilardan o‘chirish',
  category_view: 'Kategoriya ochilishi',
  search: 'Qidiruv',
  feed_view: 'Video ko‘rishi',
  feed_like: 'Video yoqtirishi',
  feed_unlike: 'Yoqtirishni bekor qilish',
  feed_share: 'Video ulashishi',
  feed_product_click: 'Videodan mahsulotga o‘tish',
  feed_watch: 'Video tomosha davomi',
  feed_video_start: 'Video boshlanishi',
  feed_video_complete: 'Video oxirigacha ko‘rilishi',
  feed_video_retention: 'Video ushlab qolishi',
  feed_favorite: 'Videoni saqlash',
  feed_comment_open: 'Izohlar ochilishi',
  feed_comment_submit: 'Izoh qoldirilishi',
  feed_comment_view: 'Izohlar ko‘rilishi',
  feed_comment_delete: 'Izoh o‘chirilishi',
  feed_comment_hide: 'Izoh yashirilishi',
  feed_comment_restore: 'Izoh tiklanishi',
  telegram_click: 'Telegram bosilishi',
  phone_click: 'Qo‘ng‘iroq bosilishi',
  directions_click: 'Manzil/xarita bosilishi',
  ai_question: 'AI savol',
  price_offer: 'Narx taklifi',
  contact_click: 'Aloqa formasi',
  feedback_submit: 'Fikr yuborilishi',
  buy_list_add: 'Xarid ro‘yxatiga qo‘shish',
  buy_list_remove: 'Xarid ro‘yxatidan o‘chirish',
};

/** Owner-friendly traffic-source labels for raw metadata values. */
export const SOURCE_LABELS: Record<string, string> = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  facebook: 'Facebook',
  google: 'Google qidiruv',
  yandex: 'Yandex qidiruv',
  external: 'Boshqa saytlar',
  unknown: 'To‘g‘ridan-to‘g‘ri / noma’lum',
};

/** Owner-friendly device labels for raw metadata values. */
export const DEVICE_LABELS: Record<string, string> = {
  desktop: 'Kompyuter',
  mobile: 'Telefon',
  tablet: 'Planshet',
  unknown: 'Noma’lum',
};

// ---------------------------------------------------------------------------
// Visitor-based rates. ALWAYS null when denominator is 0 → UI shows "—".
// ---------------------------------------------------------------------------

/**
 * uniqueVisitors(numeratorAction) / uniqueVisitors(denominatorAction).
 * Returns 0..1 normally; can still exceed 1 only if the numerator set is not
 * a subset (documented per call-site); null when denominator is empty.
 */
export function rateUnique(numeratorVisitors: number, denominatorVisitors: number): number | null {
  if (denominatorVisitors <= 0) return null;
  return numeratorVisitors / denominatorVisitors;
}

/** Format a 0..1 rate for owner UI; "—" when null (insufficient data). */
export function formatRate(rate: number | null): string {
  if (rate === null || !Number.isFinite(rate)) return '—';
  return `${Math.round(rate * 100)}%`;
}

// ---------------------------------------------------------------------------
// Journeys: collapse consecutive duplicates, strip query strings for grouping.
// Consecutive identical page_views come from StrictMode double-fire, reloads,
// or query-only navigations (?v=, ?q=) — they carry no journey information.
// ---------------------------------------------------------------------------

/** Grouping key for a page_path: path without query string. */
export function journeyKey(pagePath: string): string {
  return pagePath.split('?')[0] || '/';
}

/** Remove consecutive duplicate steps from a page sequence. */
export function collapseJourney(seq: string[]): string[] {
  const out: string[] = [];
  let prevKey = '';
  for (const p of seq) {
    const k = journeyKey(p);
    if (k !== prevKey) {
      out.push(p);
      prevKey = k;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Identity resolution: owner UI must never show raw prod-/feed- IDs.
// ---------------------------------------------------------------------------

export const REMOVED_ENTITY_LABEL = 'O‘chirilgan mahsulot';
export const REMOVED_CATEGORY_LABEL = 'O‘chirilgan toifa';
export const REMOVED_VIDEO_LABEL = 'O‘chirilgan video';

/** Resolve an entity id to an owner-facing name; never leaks the raw id. */
export function resolveName(
  id: string,
  lookup: (id: string) => string | undefined,
  fallback: string
): string {
  return lookup(id) ?? fallback;
}

// ---------------------------------------------------------------------------
// Report periods: every export covers a real, labeled window ending today
// (Tashkent). daily = last 1 day, weekly = last 7, monthly = last 30.
// ---------------------------------------------------------------------------

export type ReportPeriodKey = 'daily' | 'weekly' | 'monthly';

export function periodRange(period: ReportPeriodKey): DateRange {
  const days = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
  const to = tashkentToday();
  const toMs = new Date(to + 'T00:00:00Z').getTime();
  const from = new Date(toMs - (days - 1) * 86400000).toISOString().slice(0, 10);
  return { from, to };
}

export const PERIOD_LABELS: Record<ReportPeriodKey, string> = {
  daily: 'Kunlik',
  weekly: 'Haftalik',
  monthly: 'Oylik',
};
