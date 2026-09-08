// Phase 15 — Auth configuration.
// The Platform Owner is a DATABASE concept (platform_config.owner_email /
// owner_uid) enforced by triggers + RLS. This module only mirrors the seed
// value for UX (prefill, "owner" badges); authorization never trusts it —
// rpc_my_profile() is the single source of truth for the logged-in identity.

export const AUTH_CONFIG = {
  /** Seed value mirrored from platform_config.owner_email. */
  ownerEmail: import.meta.env.VITE_PLATFORM_OWNER_EMAIL || 'mrxcyb3r@proton.me',

  /** Google provider must be configured in Supabase before the button shows. */
  googleEnabled: import.meta.env.VITE_AUTH_GOOGLE_ENABLED === 'true',

  /** Dev-only: if SMTP is not configured, OTP cannot deliver. When this flag
   *  is set and we are in a dev build, the login page offers password sign-in
   *  for the owner account instead of a dead OTP flow. Never true in prod. */
  devOtpPivot: import.meta.env.DEV && import.meta.env.VITE_AUTH_DEV_OTP === '1',

  /** Warn the user this many ms before the session would expire, so the
   *  auto-refresh has a visible heartbeat instead of a silent killer. */
  sessionWarnMs: 5 * 60 * 1000,
} as const;

/** Bucket naming shared between the client and rpc_auth_try_attempt. */
export function rateBucket(action: 'login_otp' | 'login_password' | 'reset' | 'resend_otp' | 'google_oauth', email: string): string {
  return `${action}:${email.toLowerCase().trim()}`;
}