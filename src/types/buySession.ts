export interface BuySessionItem {
  id: string;
  qty: number;
  size?: string;
  color?: string;
  notes?: string;
}

export interface BuySessionLine extends BuySessionItem {
  product: import('../types/product').Product;
  lineTotal: number;
}

export interface BuySession {
  v: number;
  ts: number;
  exp: number;
  code: string;
  items: BuySessionItem[];
  storeId: string;
  checksum: string;
}

export interface BuySessionDisplay {
  session: BuySession;
  lines: BuySessionLine[];
  totalCount: number;
  totalSum: number;
  expiresAt: Date;
  timeRemaining: number;
}

export const BUY_SESSION_VERSION = 1;
export const BUY_SESSION_TTL_MS = 4 * 60 * 60 * 1000;
export const BUY_SESSION_CODE_LENGTH = 7;

const EXCLUDED_CHARS = new Set(['O', '0', 'I', '1', 'L', 'o', 'i', 'l']);
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generatePasscode(length: number = BUY_SESSION_CODE_LENGTH): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * ALPHABET.length);
    result += ALPHABET[randomIndex];
  }
  return result;
}

function simpleChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(4, '0');
}

export function createBuySession(
  items: BuySessionItem[],
  storeId: string
): BuySession {
  const now = Date.now();
  const code = generatePasscode();
  const payload = {
    v: BUY_SESSION_VERSION,
    ts: now,
    exp: now + BUY_SESSION_TTL_MS,
    code,
    items,
    storeId,
  };
  const payloadStr = JSON.stringify(payload);
  const checksum = simpleChecksum(payloadStr);
  return { ...payload, checksum };
}

export function validateBuySession(session: unknown): session is BuySession {
  if (!session || typeof session !== 'object') return false;
  const s = session as Record<string, unknown>;
  return (
    typeof s.v === 'number' &&
    typeof s.ts === 'number' &&
    typeof s.exp === 'number' &&
    typeof s.code === 'string' &&
    Array.isArray(s.items) &&
    typeof s.storeId === 'string' &&
    typeof s.checksum === 'string'
  );
}

export function verifyChecksum(session: BuySession): boolean {
  const { checksum, ...payload } = session;
  const payloadStr = JSON.stringify(payload);
  return simpleChecksum(payloadStr) === checksum;
}

export function isSessionExpired(session: BuySession): boolean {
  return Date.now() > session.exp;
}

export function getSessionTimeRemaining(session: BuySession): number {
  return Math.max(0, session.exp - Date.now());
}

export function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  if (hours > 0) return `${hours}soat ${minutes}min`;
  if (minutes > 0) return `${minutes}min ${seconds}sek`;
  return `${seconds}sek`;
}

export function encodeSessionForQR(session: BuySession): string {
  const payload = {
    v: session.v,
    code: session.code,
    cs: session.checksum,
  };
  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeSessionFromQR(qrData: string): Partial<BuySession> | null {
  try {
    const padded = qrData.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(padded)));
    const parsed = JSON.parse(json);
    if (parsed.v && parsed.code && parsed.cs) {
      return { v: parsed.v, code: parsed.code, checksum: parsed.cs };
    }
    return null;
  } catch {
    return null;
  }
}

export const QR_VERSION = 1;