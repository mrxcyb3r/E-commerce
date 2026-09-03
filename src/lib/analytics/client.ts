import { supabase } from '../supabase/client';
import type { AnalyticsEventType } from '../../types/supabase-db';
import { BUSINESS_CONFIG } from '../../config/business';

const VISITOR_KEY = 'analytics_visitor_id';
const SESSION_KEY = 'analytics_session_id';
const SHOP_ID = BUSINESS_CONFIG.name || 'default';

function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  );
}

function getOrCreateStored(key: string): string {
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const fresh = key === VISITOR_KEY ? uid() : `${uid()}-${Date.now().toString(36)}`;
    localStorage.setItem(key, fresh);
    return fresh;
  } catch {
    return key === VISITOR_KEY ? uid() : `${uid()}-${Date.now().toString(36)}`;
  }
}

export const getVisitorId = (): string => getOrCreateStored(VISITOR_KEY);
export const getSessionId = (): string => getOrCreateStored(SESSION_KEY);

export function resetSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
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
  uniquePerVisitor?: boolean;
}

let inFlight = false;

/**
 * Non-blocking, buffered event write. Never throws and never blocks the UI.
 * A `uniquePerVisitor` flag lets callers avoid re-recording the same action for
 * the same visitor within the current page session (kept in a simple in-memory set).
 */
export async function track(
  eventType: AnalyticsEventType,
  options: TrackOptions = {}
): Promise<void> {
  const {
    productId,
    feedId,
    categoryId,
    searchQuery,
    metadata,
    uniquePerVisitor,
  } = options;

  if (uniquePerVisitor) {
    const key = `${eventType}:${productId || feedId || categoryId || searchQuery || ''}`;
    if (uniqueKeys.has(key)) return;
    uniqueKeys.add(key);
  }

  // Guard against overlapping network writes that could flood the connection.
  if (inFlight) {
    pending.push({
      eventType,
      options,
    });
    return;
  }
  inFlight = true;

  const payload: Record<string, unknown> = {
    shop_id: SHOP_ID,
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    event_type: eventType,
    product_id: productId ?? null,
    feed_id: feedId ?? null,
    category_id: categoryId ?? null,
    search_query: searchQuery ?? null,
    page_path:
      typeof window !== 'undefined' ? window.location.pathname + window.location.search : null,
    metadata: metadata ?? {},
  };

  try {
    await supabase.from('analytics_events').insert(payload);
  } catch {
    // Analytics must never break the storefront.
  } finally {
    await flushPending();
    inFlight = false;
  }
}

let pending: { eventType: AnalyticsEventType; options: TrackOptions }[] = [];
const uniqueKeys = new Set<string>();

async function flushPending(): Promise<void> {
  const batch = pending;
  pending = [];
  for (const item of batch) {
    try {
      await track(item.eventType, item.options);
    } catch {
      /* ignore */
    }
  }
}
