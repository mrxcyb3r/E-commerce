import { supabase } from '../supabase/client';
import type { AnalyticsEventType } from '../../types/supabase-db';
import { BUSINESS_CONFIG } from '../../config/business';
import { getEnrichment, Enrichment } from './enrich';
import { getVisitorId, getSessionInfo, resetSession } from './session';

const SHOP_ID = BUSINESS_CONFIG.name || 'default';

export const SESSION_KEY = 'analytics_session_id';

export { resetSession };

export function getSessionId(): string {
  return getSessionInfo().sessionId;
}

/**
 * Persistent per-visitor de-dup. Unlike the old in-memory Set (which was lost on
 * refresh and caused duplicate product_view/feed_view rows), this survives page
 * reloads so a single visitor's repeated interest is counted once for "unique"
 * metrics while interaction totals remain accurate.
 */
const DEDUPE_KEY = 'analytics_deduped_v1';

function loadDeduped(): Set<string> {
  try {
    const raw = localStorage.getItem(DEDUPE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

let deduped: Set<string> = loadDeduped();

function persistDeduped(): void {
  try {
    const arr = Array.from(deduped);
    if (arr.length > 500) arr.splice(0, arr.length - 500); // keep recent
    localStorage.setItem(DEDUPE_KEY, JSON.stringify(arr));
  } catch {
    /* ignore */
  }
}

export interface TrackOptions {
  productId?: string;
  feedId?: string;
  categoryId?: string;
  searchQuery?: string;
  metadata?: Record<string, unknown>;
  /** de-dupe by (eventType + key) for this visitor, persisted across reloads */
  uniquePerVisitor?: boolean;
}

interface QueuedEvent {
  eventType: AnalyticsEventType;
  options: TrackOptions;
}

let queue: QueuedEvent[] = [];
let flushing = false;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const BATCH_MAX_DELAY_MS = 1500;

/**
 * Non-blocking, batched event write. Never throws and never blocks the UI.
 * Multiple events are coalesced and sent to Supabase in batches to avoid one
 * request per interaction.
 */
export function track(
  eventType: AnalyticsEventType,
  options: TrackOptions = {}
): Promise<void> {
  const key = options.productId || options.feedId || options.categoryId || options.searchQuery || '';
  if (options.uniquePerVisitor) {
    const dedupeKey = `${eventType}:${key}`;
    if (deduped.has(dedupeKey)) return Promise.resolve();
    deduped.add(dedupeKey);
    persistDeduped();
  }

  queue.push({ eventType, options });
  scheduleFlush();
  return Promise.resolve();
}

function scheduleFlush(): void {
  if (flushTimer != null) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, 80);
}

function scheduleHardFlush(): void {
  if (flushTimer != null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  void flush();
}

async function flush(): Promise<void> {
  if (flushing) return;
  const batch = queue;
  queue = [];
  if (batch.length === 0) return;

  flushing = true;
  const enrichment = getEnrichment();
  try {
    const rows = batch.map(({ eventType, options }) => {
      const session = getSessionInfo();
      return {
        shop_id: SHOP_ID,
        visitor_id: getVisitorId(),
        session_id: session.sessionId,
        event_type: eventType,
        product_id: options.productId ?? null,
        feed_id: options.feedId ?? null,
        category_id: options.categoryId ?? null,
        search_query: options.searchQuery ?? null,
        page_path:
          typeof window !== 'undefined'
            ? window.location.pathname + window.location.search
            : null,
        metadata: {
          ...(options.metadata ?? {}),
          ...enrichMetadata(enrichment),
          session_start: session.sessionStart,
          session_visit: session.visitNumber,
        },
      };
    });

    await supabase.from('analytics_events').insert(rows);
  } catch {
    // Analytics must never break the storefront.
  } finally {
    flushing = false;
    if (queue.length > 0) {
      scheduleHardFlush();
    }
  }
}

function enrichMetadata(e: Enrichment): Record<string, unknown> {
  const meta: Record<string, unknown> = {
    device: e.device,
    screen: e.screen,
    language: e.language,
    browser: e.browser,
    os: e.os,
    dark_mode: e.darkMode,
  };
  if (e.source) meta.source = e.source;
  if (e.referrer) meta.referrer = e.referrer;
  return meta;
}

// Best-effort flush before the page is torn down (hidden/beforeunload).
if (typeof window !== 'undefined') {
  const teardown = () => {
    if (flushTimer != null) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    if (queue.length > 0) {
      // Fire-and-forget; navigator.sendBeacon is unavailable for PostgREST JSON,
      // so we just attempt a synchronous-ish fetch which may or may not complete.
      void flush();
    }
  };
  window.addEventListener('beforeunload', teardown);
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') teardown();
  };
  document.addEventListener('visibilitychange', onVisibility);
}
