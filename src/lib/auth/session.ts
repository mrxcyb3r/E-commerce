// Phase 15 — Session lifecycle: cross-tab logout, expiry warnings, auto-refresh.
//
// Supabase Auth owns the real token lifecycle (autoRefreshToken). This module
// adds the *product* guarantees around it:
//   - one tab logging out logs out every tab that shares storage
//   - the user gets a warning before the session would expire
//   - "logout everywhere" is explicit and immediate

const CHANNEL_NAME = 'dokon_admin_auth';
export type AuthChannelMessage = { type: 'logout' } | { type: 'login' };

export function openAuthChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  try {
    return new BroadcastChannel(CHANNEL_NAME);
  } catch {
    return null;
  }
}

export function postChannel(msg: AuthChannelMessage): void {
  const ch = openAuthChannel();
  ch?.postMessage(msg);
  ch?.close();
}

/** Subscribe to other-tab auth events. Returns an unsubscribe fn. */
export function listenAuthChannel(onMessage: (msg: AuthChannelMessage) => void): () => void {
  const ch = openAuthChannel();
  if (!ch) return () => {};
  const handler = (e: MessageEvent) => {
    const msg = e.data as AuthChannelMessage | undefined;
    if (msg?.type === 'logout' || msg?.type === 'login') onMessage(msg);
  };
  ch.addEventListener('message', handler);
  return () => ch.removeEventListener('message', handler);
}

/**
 * Seconds until the session expires (from a Supabase expires_at epoch).
 * Returns 0 when there is no session or it already lapsed.
 */
export function secondsToExpiry(expiresAtUnix: number | null | undefined, nowMs = Date.now()): number {
  if (!expiresAtUnix || !Number.isFinite(expiresAtUnix)) return 0;
  return Math.max(0, Math.round((expiresAtUnix * 1000 - nowMs) / 1000));
}