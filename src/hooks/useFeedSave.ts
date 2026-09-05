import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase/client';
import { getVisitorId } from '../lib/analytics/session';
import { track } from '../lib/analytics/client';

export function useFeedSave(feedId: string) {
  const [saveCount, setSaveCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const visitorId = getVisitorId();

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!feedId) return;

    const fetchSaves = async () => {
      const { count } = await supabase
        .from('feed_saves')
        .select('*', { count: 'exact', head: true })
        .eq('feed_id', feedId);

      const { data: mySave } = await supabase
        .from('feed_saves')
        .select('id')
        .eq('feed_id', feedId)
        .eq('visitor_id', visitorId)
        .maybeSingle();

      if (mountedRef.current) {
        setSaveCount(count ?? 0);
        setIsSaved(!!mySave);
      }
    };

    fetchSaves();
  }, [feedId, visitorId]);

  const toggleSave = useCallback(async (): Promise<boolean> => {
    if (loading || !feedId) return false;
    setLoading(true);

    const wasSaved = isSaved;
    const prevCount = saveCount;

    // Optimistic update
    setIsSaved(!wasSaved);
    setSaveCount(wasSaved ? prevCount - 1 : prevCount + 1);

    try {
      if (wasSaved) {
        const { error } = await supabase
          .from('feed_saves')
          .delete()
          .eq('feed_id', feedId)
          .eq('visitor_id', visitorId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('feed_saves')
          .insert({ feed_id: feedId, visitor_id: visitorId });
        if (error) throw error;
      }
      track('feed_favorite', { feedId, metadata: { action: wasSaved ? 'unsave' : 'save' } });
      return true;
    } catch (err) {
      // Rollback optimistic update
      if (import.meta.env.DEV) console.error('[feed_saves] toggle error:', err);
      if (mountedRef.current) {
        setIsSaved(wasSaved);
        setSaveCount(prevCount);
      }
      return false;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [feedId, visitorId, isSaved, saveCount, loading]);

  return { saveCount, isSaved, toggleSave, loading };
}