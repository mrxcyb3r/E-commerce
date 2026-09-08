// Phase 15 — Security helpers: device tracking, rate limiting, audit wiring.
// Everything here funnels into the DB (rpc_auth_* security-definer functions);
// the client is never the source of truth, only the reporter.

import { supabase } from '../supabase/client';
import { AuditEventType } from '../../types/supabase-db';

const DEVICE_KEY = 'auth_device_signature';

/** Stable, non-PII device signature for "new device" detection and history. */
export function deviceSignature(): string {
  try {
    const stored = localStorage.getItem(DEVICE_KEY);
    if (stored) return stored;
  } catch {
    /* noop */
  }
  const raw = [navigator.userAgent, navigator.language, screen.width, screen.height, screen.colorDepth].join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  const sig = `d${Math.abs(hash).toString(16)}${Date.now().toString(36).slice(-4)}`;
  try {
    localStorage.setItem(DEVICE_KEY, sig);
  } catch {
    /* noop */
  }
  return sig;
}

/** The signature of the browser this tab is running in, vs the stored one. */
export function isNewDevice(): boolean {
  try {
    const stored = localStorage.getItem(DEVICE_KEY);
    if (!stored) return true;
    return stored !== deviceSignature();
  } catch {
    return false;
  }
}

/** Insert a login_history row via the DB (works pre-login for anon buckets). */
export async function logAuthEvent(
  eventType: AuditEventType,
  metadata: Record<string, unknown> = {},
  email?: string,
): Promise<void> {
  try {
    await supabase.rpc('rpc_auth_log', {
      p_event_type: eventType,
      p_metadata: metadata,
      p_user_agent: navigator.userAgent,
      p_email: email ?? null,
      p_device_signature: deviceSignature(),
    });
  } catch (e) {
    // Observability must never break the auth flow.
    console.warn('logAuthEvent failed:', e);
  }
}

/** Insert an immutable audit-log row (owner + admins; errors are non-fatal). */
export async function logBusinessAudit(
  action: string,
  entity: string,
  entityId?: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    await supabase.rpc('rpc_auth_audit', {
      p_action: action,
      p_entity: entity,
      p_entity_id: entityId ?? null,
      p_metadata: metadata,
      p_user_agent: navigator.userAgent,
    });
  } catch (e) {
    console.warn('logBusinessAudit failed:', e);
  }
}

export interface RateCheck {
  ok: boolean;
  retryAfter: number;
}

/** Ask the DB whether the caller may perform an auth action now. */
export async function authTryAttempt(
  bucket: string,
  windowSeconds = 300,
  max = 5,
): Promise<RateCheck> {
  try {
    const { data, error } = await supabase.rpc('rpc_auth_try_attempt', {
      p_bucket: bucket,
      p_window_seconds: windowSeconds,
      p_max: max,
    });
    if (error || !data) return { ok: true, retryAfter: 0 };
    const r = data as unknown as { ok?: boolean; retry_after?: number };
    return { ok: r.ok !== false, retryAfter: r.retry_after ?? 0 };
  } catch {
    // If the limiter is unreachable, fail open for the user (DB is the guard).
    return { ok: true, retryAfter: 0 };
  }
}

/** Tell the DB an attempt happened (after authTryAttempt returned ok). */
export async function authRecordAttempt(bucket: string): Promise<void> {
  try {
    await supabase.rpc('rpc_auth_record_attempt', { p_bucket: bucket });
  } catch (e) {
    console.warn('authRecordAttempt failed:', e);
  }
}

/** Local, per-bucket cooldown for resend-code (belt and suspenders to the DB). */
export function localCooldownMs(bucket: string, ttlMs: number): number {
  const KEY = 'auth_cooldowns';
  try {
    const now = Date.now();
    const all: Record<string, number> = JSON.parse(localStorage.getItem(KEY) || '{}');
    const at = all[bucket] ?? 0;
    const left = at + ttlMs - now;
    if (left > 0) return left;
    all[bucket] = now;
    localStorage.setItem(KEY, JSON.stringify(all));
    return 0;
  } catch {
    return 0;
  }
}