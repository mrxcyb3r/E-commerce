// Visitor/context enrichment. Only uses data that can actually be read from the
// browser at event time. Never guesses or fabricates measurements.

export interface Enrichment {
  userAgent: string | null;
  device: string;
  screen: string;
  referrer: string | null;
  source: string | null;
  language: string | null;
  browser: string;
  os: string;
  darkMode: boolean;
}

export type DarkModeState = 'dark' | 'light';

function detectDevice(ua: string | null): string {
  if (!ua) return 'unknown';
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'mobile';
  return 'desktop';
}

function detectBrowser(ua: string | null): string {
  if (!ua) return 'unknown';
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return 'Opera';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return 'Chrome';
  if (/Safari\//i.test(ua)) return 'Safari';
  if (/YaBrowser/i.test(ua)) return 'Yandex';
  return 'other';
}

function detectOS(ua: string | null): string {
  if (!ua) return 'unknown';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/iPhone|iPad|Mac/i.test(ua)) return 'Apple';
  if (/Android/i.test(ua)) return 'Android';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'other';
}

function detectSource(ref: string | null): string | null {
  if (!ref) return null;
  try {
    const host = new URL(ref).hostname;
    if (host === 't.me' || host.endsWith('.t.me')) return 'telegram';
    if (/instagram\.com$/i.test(host)) return 'instagram';
    if (/facebook\.com$/i.test(host)) return 'facebook';
    if (/google\./.test(host)) return 'google';
    if (/yandex\./.test(host)) return 'yandex';
    return 'external';
  } catch {
    return 'external';
  }
}

export function getEnrichment(): Enrichment {
  let ua: string | null = null;
  let referrer: string | null = null;
  let language: string | null = null;
  let screen = '';
  let darkMode = false;
  try {
    if (typeof navigator !== 'undefined') {
      ua = navigator.userAgent ?? null;
      language = navigator.language ?? null;
      referrer = document.referrer || null;
    }
    if (typeof window !== 'undefined' && window.screen) {
      screen = `${window.screen.width}x${window.screen.height}`;
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      darkMode = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    }
  } catch {
    /* analytics must never throw */
  }
  return {
    userAgent: ua,
    device: detectDevice(ua),
    screen,
    referrer,
    source: detectSource(referrer),
    language,
    browser: detectBrowser(ua),
    os: detectOS(ua),
    darkMode,
  };
}

