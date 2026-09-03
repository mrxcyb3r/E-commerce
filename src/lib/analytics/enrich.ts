// Visitor/context enrichment. Only uses data that can actually be read from the
// browser at event time. Never guesses or fabricates measurements.

export interface Enrichment {
  userAgent: string | null;
  device: string;
  screen: string;
  referrer: string | null;
  source: string | null;
  language: string | null;
}

function detectDevice(ua: string | null): string {
  if (!ua) return 'unknown';
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'mobile';
  return 'desktop';
}

function detectSource(ref: string | null): string | null {
  if (!ref) return null;
  try {
    const host = new URL(ref).hostname;
    if (host === 't.me' || host.endsWith('.t.me')) return 'telegram';
    if (host === 't.me') return 'telegram';
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
  try {
    if (typeof navigator !== 'undefined') {
      ua = navigator.userAgent ?? null;
      language = navigator.language ?? null;
      referrer = document.referrer || null;
    }
    if (typeof window !== 'undefined' && window.screen) {
      screen = `${window.screen.width}x${window.screen.height}`;
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
  };
}
