import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase/client';
import { getVisitorId } from '../lib/analytics/session';
import { track } from '../lib/analytics/client';
import type { FeedLike, FeedComment } from '../types/supabase-db';

const VISITOR_DISPLAY_KEY = 'feed_visitor_display_name';

function generateDisplayName(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  const prefixes = ['Mehmon', 'Xaridor'];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${num}`;
}

function getVisitorDisplayName(): string {
  try {
    const existing = localStorage.getItem(VISITOR_DISPLAY_KEY);
    if (existing) return existing;
    const name = generateDisplayName();
    localStorage.setItem(VISITOR_DISPLAY_KEY, name);
    return name;
  } catch {
    return generateDisplayName();
  }
}

export function useFeedLikes(feedId: string) {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const visitorId = getVisitorId();

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!feedId) return;

    const fetchLikes = async () => {
      const { count } = await supabase
        .from('feed_likes')
        .select('*', { count: 'exact', head: true })
        .eq('feed_id', feedId);

      const { data: myLike } = await supabase
        .from('feed_likes')
        .select('id')
        .eq('feed_id', feedId)
        .eq('visitor_id', visitorId)
        .maybeSingle();

      if (mountedRef.current) {
        setLikeCount(count ?? 0);
        setIsLiked(!!myLike);
      }
    };

    fetchLikes();
  }, [feedId, visitorId]);

  const toggleLike = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    const wasLiked = isLiked;
    const prevCount = likeCount;

    // Optimistic update
    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? prevCount - 1 : prevCount + 1);

    try {
      if (wasLiked) {
        const { error } = await supabase
          .from('feed_likes')
          .delete()
          .eq('feed_id', feedId)
          .eq('visitor_id', visitorId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('feed_likes')
          .insert({ feed_id: feedId, visitor_id: visitorId });

        if (error) throw error;
      }
    } catch {
      // Rollback optimistic update
      if (mountedRef.current) {
        setIsLiked(wasLiked);
        setLikeCount(prevCount);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [feedId, visitorId, isLiked, likeCount, loading]);

  return { likeCount, isLiked, toggleLike, loading };
}

export function useFeedComments(feedId: string) {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const mountedRef = useRef(true);

  const visitorId = getVisitorId();
  const displayName = getVisitorDisplayName();

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!feedId) return;

    const fetchComments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('feed_comments')
        .select('*')
        .eq('feed_id', feedId)
        .eq('moderation_status', 'visible')
        .order('created_at', { ascending: true })
        .limit(100);

      if (mountedRef.current && !error) {
        setComments(data ?? []);
      }
      if (mountedRef.current) setLoading(false);
    };

    fetchComments();
  }, [feedId]);

  const addComment = useCallback(async (text: string): Promise<boolean> => {
    if (!text.trim() || submitting) return false;
    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('feed_comments')
        .insert({
          feed_id: feedId,
          visitor_id: visitorId,
          display_name: displayName,
          text: text.trim(),
          moderation_status: 'visible',
        })
        .select()
        .single();

      if (error) throw error;

      if (mountedRef.current && data) {
        setComments((prev) => [...prev, data]);
      }
      track('feed_comment_submit', { feedId });
      return true;
    } catch {
      return false;
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }, [feedId, visitorId, displayName, submitting]);

  return { comments, loading, submitting, addComment, commentCount: comments.length };
}
