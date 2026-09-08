// Shop Operations — local-first stores for daily business operations.
//
// Buy Sessions, recorded Sales, and Discount Campaigns are persisted to
// localStorage through typed, versioned, pure functions. Every record is
// forward-compatible with a future server sync: the same shapes map 1:1 to
// Supabase tables (buy_sessions, sales, campaigns) and the getters here are the
// seam where a remote RPC/table swap would land. No checkouts, payments, or
// shipping — this module records operations only, exactly like a register.
//
// Keys carry a `_v1` suffix so a future schema change adds a new key instead
// of corrupting existing data (mirrors the localStorage pattern used by
// SaveToBuy/BuySession contexts).

import { BuySession, BuySessionItem, encodeSessionForQR } from '../../types/buySession';

// ---------------------------------------------------------------------------
// Buy Sessions registry
// ---------------------------------------------------------------------------

export type BuySessionStatus = 'active' | 'viewed' | 'completed' | 'expired' | 'cancelled';

export interface AdminBuySession extends BuySession {
  /** Current lifecycle state managed by staff + the context auto-expiry. */
  status: BuySessionStatus;
  /** Timestamp of the last status change (ms). */
  statusAt: number;
  /** First time a staff member loaded this session for a sale (ms). */
  viewedAt?: number;
  /** Staff note attached during sale processing. */
  notes?: string;
  /** Staff confirmation that quantities/products were verified. */
  verified?: boolean;
  /** Recorded sale id when the session was completed/cancelled. */
  saleId?: string;
}

const SESSIONS_KEY = 'ops_buy_sessions_v1';

function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function persist(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore (private mode / quota)
  }
}

/** Effective status — an un-cancelled session whose expiry passed is "expired". */
export function effectiveSessionStatus(s: AdminBuySession): BuySessionStatus {
  if (s.status === 'cancelled' || s.status === 'completed') return s.status;
  if (Date.now() > s.exp) return 'expired';
  return s.status;
}

/** Register a freshly created session; never downgrades a terminal status. */
export function registerBuySession(session: BuySession): void {
  const all = safeParse<AdminBuySession[]>(SESSIONS_KEY, []);
  const existing = all.find((x) => x.code === session.code);
  if (existing && (existing.status === 'completed' || existing.status === 'cancelled')) return;
  const next: AdminBuySession =
    existing && effectiveSessionStatus(existing) === 'expired'
      ? { ...existing, ...session }
      : {
          ...session,
          status: existing?.status ?? 'active',
          statusAt: existing?.statusAt ?? session.ts,
          viewedAt: existing?.viewedAt,
          notes: existing?.notes,
          verified: existing?.verified,
          saleId: existing?.saleId,
        };
  const idx = all.findIndex((x) => x.code === session.code);
  if (idx >= 0) all[idx] = next;
  else all.unshift(next);
  persist(SESSIONS_KEY, all.slice(0, 200));
}

/** Mark an active session as seen by staff (used by the sale flow). */
export function markSessionViewed(code: string): void {
  updateSessionStatus(code, (s) =>
    effectiveSessionStatus(s) === 'active' ? 'viewed' : s.status
  );
}

export function setSessionStatus(code: string, status: BuySessionStatus): void {
  updateSessionStatus(code, () => status);
}

function updateSessionStatus(
  code: string,
  derive: (s: AdminBuySession) => BuySessionStatus
): void {
  const all = safeParse<AdminBuySession[]>(SESSIONS_KEY, []);
  const idx = all.findIndex((x) => x.code.toUpperCase() === code.toUpperCase());
  if (idx < 0) return;
  const prev = all[idx];
  const status = derive(prev);
  if (status === prev.status) return;
  const viewedAt = status !== 'active' && !prev.viewedAt ? Date.now() : prev.viewedAt;
  all[idx] = { ...prev, status, statusAt: Date.now(), viewedAt };
  persist(SESSIONS_KEY, all);
}

/** All sessions, newest first, with effective (expiry-aware) status. */
export function listBuySessions(): AdminBuySession[] {
  const all = safeParse<AdminBuySession[]>(SESSIONS_KEY, []);
  return all
    .map((s) => ({ ...s, status: effectiveSessionStatus(s) as BuySessionStatus }))
    .sort((a, b) => b.ts - a.ts);
}

export function getBuySessionByCode(code: string): AdminBuySession | undefined {
  const needle = code.toUpperCase();
  return listBuySessions().find((s) => s.code.toUpperCase() === needle);
}

export function markSessionProcessed(code: string, saleId: string): void {
  const all = safeParse<AdminBuySession[]>(SESSIONS_KEY, []);
  const idx = all.findIndex((x) => x.code.toUpperCase() === code.toUpperCase());
  if (idx < 0) return;
  all[idx] = { ...all[idx], saleId, notes: all[idx].notes };
  persist(SESSIONS_KEY, all);
}

export interface SessionSearchFilters {
  query?: string;
  status?: BuySessionStatus | 'all';
  from?: number;
  to?: number;
}

/** Search by passcode, product name fragment, or customer-visit time text. */
export function searchBuySessions(
  filters: SessionSearchFilters,
  resolveProduct?: (id: string) => string
): AdminBuySession[] {
  const all = listBuySessions();
  const { query, status, from, to } = filters;
  const q = query?.trim().toLowerCase() ?? '';
  return all.filter((s) => {
    if (status && status !== 'all' && s.status !== status) return false;
    if (from != null && s.ts < from) return false;
    if (to != null && s.ts > to) return false;
    if (!q) return true;
    if (s.code.toLowerCase().includes(q)) return true;
    if (s.items.some((i) => i.id.toLowerCase().includes(q))) return true;
    if (resolveProduct && s.items.some((i) => (resolveProduct(i.id) || '').toLowerCase().includes(q))) {
      return true;
    }
    return false;
  });
}

export function sessionQrPayload(session: AdminBuySession): string {
  return encodeSessionForQR(session);
}

// ---------------------------------------------------------------------------
// Sales ledger
// ---------------------------------------------------------------------------

export type SaleStatus = 'completed' | 'partial' | 'cancelled';

export interface StoreSale {
  id: string;
  code: string;
  status: SaleStatus;
  items: BuySessionItem[];
  totalSum: number;
  totalCount: number;
  notes?: string;
  completedAt: number;
}

const SALES_KEY = 'ops_sales_v1';

export function recordSale(sale: Omit<StoreSale, 'id' | 'completedAt'>): StoreSale {
  const all = safeParse<StoreSale[]>(SALES_KEY, []);
  const record: StoreSale = {
    ...sale,
    id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    completedAt: Date.now(),
  };
  all.unshift(record);
  persist(SALES_KEY, all.slice(0, 200));
  return record;
}

export function listSales(): StoreSale[] {
  return safeParse<StoreSale[]>(SALES_KEY, []).sort((a, b) => b.completedAt - a.completedAt);
}

export function salesOnDay(dayStartMs: number, dayEndMs: number): StoreSale[] {
  return listSales().filter(
    (s) => s.status !== 'cancelled' && s.completedAt >= dayStartMs && s.completedAt <= dayEndMs
  );
}

/** Sum the monetary value of line items using a product price resolver. */
export function sessionEstimatedValue(
  items: BuySessionItem[],
  resolvePrice: (id: string) => number
): number {
  return items.reduce((sum, i) => {
    const price = resolvePrice(i.id) || 0;
    return sum + price * i.qty;
  }, 0);
}

// ---------------------------------------------------------------------------
// Discount Campaigns — management + analytics only, no checkout coupling.
// Status is derived from beginAt/endAt walls; staff can force start/finish.
// ---------------------------------------------------------------------------

export type CampaignType = 'percentage' | 'fixed' | 'bogo' | 'code';

export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'expired';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  /** percentage: 0-100 discount; fixed: amount (so'm); bogo: buy N; code: compatible buy-session code. */
  value: number;
  /** Buy X Get Y: how many to buy (X). */
  buyQty?: number;
  /** Buy X Get Y: how many free (Y). */
  getQty?: number;
  /** Campaign code (for type 'code'). */
  code?: string;
  description?: string;
  beginAt: number | null;
  endAt: number | null;
  createdAt: number;
  /** Force-started / force-finished flags the owner set manually. */
  forceRunning?: boolean;
  forceExpired?: boolean;
}

const CAMPAIGNS_KEY = 'ops_campaigns_v1';

export function campaignStatus(c: Campaign): CampaignStatus {
  const now = Date.now();
  if (c.forceExpired) return 'expired';
  if (c.forceRunning) return 'running';
  if (c.endAt != null && now > c.endAt) return 'expired';
  if (c.beginAt != null && now >= c.beginAt) return 'running';
  if (c.beginAt != null && c.beginAt > now) return 'scheduled';
  return 'draft';
}

export function listCampaigns(): Campaign[] {
  return safeParse<Campaign[]>(CAMPAIGNS_KEY, []).sort((a, b) => b.createdAt - a.createdAt);
}

export function saveCampaign(c: Campaign): void {
  const all = safeParse<Campaign[]>(CAMPAIGNS_KEY, []);
  const idx = all.findIndex((x) => x.id === c.id);
  if (idx >= 0) all[idx] = c;
  else all.unshift(c);
  persist(CAMPAIGNS_KEY, all.slice(0, 100));
}

export function deleteCampaign(id: string): void {
  persist(
    CAMPAIGNS_KEY,
    safeParse<Campaign[]>(CAMPAIGNS_KEY, []).filter((c) => c.id !== id)
  );
}

export function nextCampaignId(): string {
  return `campaign-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
}

// ---------------------------------------------------------------------------
// Time helpers (Asia/Tashkent — the shop's wall clock)
// ---------------------------------------------------------------------------

const TASHKENT_OFFSET_MS = 5 * 3600 * 1000;

export function tashkentMidnight(nowMs: number): number {
  const d = new Date(nowMs + TASHKENT_OFFSET_MS);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - TASHKENT_OFFSET_MS;
}

export function formatDateTime(input: number | string | Date): string {
  const t = input instanceof Date ? input.getTime() : typeof input === 'number' ? input : new Date(input).getTime();
  if (!Number.isFinite(t)) return '—';
  const d = new Date(t + TASHKENT_OFFSET_MS);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function formatShortTime(input: number): string {
  const d = new Date(input + TASHKENT_OFFSET_MS);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}