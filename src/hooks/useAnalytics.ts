import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { track, resetSession } from '../lib/analytics/client';
import type { TrackOptions } from '../lib/analytics/client';
import type { AnalyticsEventType } from '../types/supabase-db';

/**
 * Mount near the router. Tracks a `page_view` whenever the route changes.
 * Also exposes the `track` helper so components can record fine-grained events.
 */
export function useAnalytics(): {
  track: (eventType: AnalyticsEventType, options?: TrackOptions) => Promise<void>;
} {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/admin') || location.pathname === '/login') {
      return;
    }
    track('page_view');
  }, [location.pathname, location.search]);

  return { track };
}

export { track, resetSession };
