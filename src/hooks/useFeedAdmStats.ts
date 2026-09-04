import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import type { AnalyticsEvent } from '../types/supabase-db';

interface FeedAdmStat {
  views: number;
  uniqueViewers: number;
  likes: number;
  comments: number;
  watchSec: number;
}

type StatsMap = Record<string, FeedAdmStat>;

export function useFeedAdmStats() {
  const [stats, setStats] = useState<StatsMap>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [likesRes, commentsRes, eventsRes] = await Promise.all([
        supabase.from('feed_likes').select('feed_id').limit(2000),
        supabase
          .from('feed_comments')
          .select('feed_id')
          .eq('moderation_status', 'visible')
          .limit(2000),
        supabase
          .from('analytics_events')
          .select('feed_id, visitor_id, event_type, metadata, created_at')
          .not('feed_id', 'is', null)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .limit(20000),
      ]);

      const likes = new Map<string, number>();
      for (const r of likesRes.data ?? []) {
        likes.set(r.feed_id, (likes.get(r.feed_id) ?? 0) + 1);
      }
      const comments = new Map<string, number>();
      for (const r of commentsRes.data ?? []) {
        comments.set(r.feed_id, (comments.get(r.feed_id) ?? 0) + 1);
      }

      const views = new Map<string, number>();
      const viewers = new Map<string, Set<string>>();
      const watch = new Map<string, number>();
      for (const ev of (eventsRes.data ?? []) as AnalyticsEvent[]) {
        if (!ev.feed_id) continue;
        views.set(ev.feed_id, (views.get(ev.feed_id) ?? 0) + 1);
        if (ev.event_type === 'feed_view') {
          let set = viewers.get(ev.feed_id);
          if (!set) {
            set = new Set<string>();
            viewers.set(ev.feed_id, set);
          }
          set.add(ev.visitor_id);
        }
        if (ev.event_type === 'feed_watch') {
          const s = Number(ev.metadata?.durationSec);
          if (Number.isFinite(s)) watch.set(ev.feed_id, (watch.get(ev.feed_id) ?? 0) + s);
        }
      }

      const allIds = new Set<string>([
        ...likes.keys(),
        ...comments.keys(),
        ...views.keys(),
      ]);
      const next: StatsMap = {};
      for (const id of allIds) {
        next[id] = {
          views: views.get(id) ?? 0,
          uniqueViewers: viewers.get(id)?.size ?? 0,
          likes: likes.get(id) ?? 0,
          comments: comments.get(id) ?? 0,
          watchSec: watch.get(id) ?? 0,
        };
      }
      setStats(next);
    } catch {
      // ignore — stats are non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return useMemo(() => ({ stats, loading, refresh: load }), [stats, loading, load]);
}