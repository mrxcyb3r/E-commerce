// Session lifecycle for anonymous analytics.
//
// A "session" is a bounded group of events from the same visitor. Because there
// are no accounts, we approximate a session boundary locally:
//   * rotate the session id when the visitor is idle > 30 minutes, OR
//   * rotate at local midnight, OR
//   * a brand-new tab with no stored session.
//
// We persist the session id, its start time, and the last-seen time so the
// dashboard can compute real session duration and pages-per-session from actual
// timestamps rather than guessing.

const SESSION_KEY = 'analytics_session_id';
const SESSION_START_KEY = 'analytics_session_start';
const SESSION_LAST_KEY = 'analytics_session_last';
const VISIT_COUNT_KEY = 'analytics_visit_count';
const FIRST_VISIT_KEY = 'analytics_first_visit';
const VISITOR_KEY = 'analytics_visitor_id';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export interface SessionInfo {
  sessionId: string;
  sessionStart: number;
  firstVisit: number | null;
  visitNumber: number;
  isNewSession: boolean;
}

function readNum(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function readStr(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isSameLocalDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

let cached: SessionInfo | null = null;

/**
 * Returns the current session, rotating the id when an idle/time boundary is
 * crossed. The result is memoized for the lifetime of this module so repeated
 * track() calls within the same page session share one id.
 */
export function getSessionInfo(): SessionInfo {
  if (cached) return cached;

  const now = Date.now();
  const existingId = readStr(SESSION_KEY);
  const start = readNum(SESSION_START_KEY);
  const last = readNum(SESSION_LAST_KEY);

  let sessionId = existingId;
  let sessionStart = start;
  let isNewSession = false;

  const expired =
    !existingId ||
    start == null ||
    (last != null && now - last > IDLE_TIMEOUT_MS) ||
    (start != null && !isSameLocalDay(start, now));

  if (expired) {
    sessionId = `${uid()}-${now.toString(36)}`;
    sessionStart = now;
    isNewSession = true;
    write(SESSION_KEY, sessionId);
    write(SESSION_START_KEY, String(now));
  }

  write(SESSION_LAST_KEY, String(now));

  // First-visit tracking: persist the timestamp of the very first visit and a
  // visit counter, so "returning vs new" can be derived without accounts.
  let firstVisit = readNum(FIRST_VISIT_KEY);
  let visitNumber = readNum(VISIT_COUNT_KEY) ?? 0;
  if (firstVisit == null) {
    firstVisit = now;
    write(FIRST_VISIT_KEY, String(now));
  }
  if (isNewSession) {
    visitNumber += 1;
    write(VISIT_COUNT_KEY, String(visitNumber));
  }

  cached = {
    sessionId,
    sessionStart,
    firstVisit,
    visitNumber: Math.max(1, visitNumber),
    isNewSession,
  };
  return cached;
}

export function getVisitorId(): string {
  const existing = readStr(VISITOR_KEY);
  if (existing) return existing;
  const fresh = uid();
  write(VISITOR_KEY, fresh);
  return fresh;
}

export function resetSession(): void {
  cached = null;
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_START_KEY);
    localStorage.removeItem(SESSION_LAST_KEY);
  } catch {
    /* ignore */
  }
}
