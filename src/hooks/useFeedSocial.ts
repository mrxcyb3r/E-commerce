import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase/client';
import { getVisitorId } from '../lib/analytics/session';
import { track } from '../lib/analytics/client';
import { useAuth } from '../context/AuthContext';
import { useBrand } from './useBrand';
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

export type SortMode = 'newest' | 'oldest' | 'mostLiked';

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

  const toggleLike = useCallback(async (): Promise<boolean> => {
    if (loading) return false;
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

        if (error) {
          console.error('[feed_likes delete error]', { code: error.code, message: error.message, details: error.details, hint: error.hint });
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('feed_likes')
          .insert({ feed_id: feedId, visitor_id: visitorId });

        if (error) {
          console.error('[feed_likes insert error]', { code: error.code, message: error.message, details: error.details, hint: error.hint });
          throw error;
        }
      }

      if (mountedRef.current) setLoading(false);
      return true;
    } catch {
      // Rollback optimistic update
      if (mountedRef.current) {
        setIsLiked(wasLiked);
        setLikeCount(prevCount);
      }
      return false;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [feedId, visitorId, isLiked, likeCount, loading]);

  return { likeCount, isLiked, toggleLike, loading };
}

function sortComments(comments: FeedComment[], sortMode: SortMode): FeedComment[] {
  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = comments.filter((c) => !!c.parent_id);

  const pinned = topLevel.filter((c) => c.is_pinned).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const unpinned = topLevel.filter((c) => !c.is_pinned);

  let sorted: FeedComment[];
  switch (sortMode) {
    case 'oldest':
      unpinned.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      break;
    case 'mostLiked':
      unpinned.sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case 'newest':
    default:
      unpinned.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
  }

  sorted = [...pinned, ...unpinned];

  // Attach replies under their parent
  const replyMap = new Map<string, FeedComment[]>();
  for (const r of replies) {
    const arr = replyMap.get(r.parent_id!) ?? [];
    arr.push(r);
    replyMap.set(r.parent_id!, arr);
  }
  // Sort replies by created_at asc
  for (const arr of replyMap.values()) {
    arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  const result: FeedComment[] = [];
  for (const c of sorted) {
    result.push(c);
    const childReplies = replyMap.get(c.id);
    if (childReplies) result.push(...childReplies);
  }

  return result;
}

const PAGE_SIZE = 20;

export function useFeedComments(feedId: string) {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [hasMore, setHasMore] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());
  const mountedRef = useRef(true);
  const rawCommentsRef = useRef<FeedComment[]>([]);

  const visitorId = getVisitorId();
  const { isAuthenticated, user } = useAuth();
  const { displayName: brandDisplayName } = useBrand();
  const adminDisplayName = user?.name || brandDisplayName;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const reSort = useCallback((raw: FeedComment[], mode: SortMode) => {
    const sorted = sortComments(raw, mode);
    if (mountedRef.current) setComments(sorted);
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
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      const { count } = await supabase
        .from('feed_comments')
        .select('id', { count: 'exact', head: true })
        .eq('feed_id', feedId)
        .eq('moderation_status', 'visible');

      if (mountedRef.current && !error) {
        const fetched = data ?? [];
        rawCommentsRef.current = fetched;
        setHasMore(fetched.length >= PAGE_SIZE);
        reSort(fetched, sortMode);
        setCommentCount(count ?? fetched.length);
      }
      if (mountedRef.current) setLoading(false);
    };

    fetchComments();

    // Fetch liked comment ids for this feed
    const fetchLiked = async () => {
      const { data: commentIds } = await supabase
        .from('feed_comments')
        .select('id')
        .eq('feed_id', feedId);

      if (commentIds && commentIds.length > 0) {
        const ids = commentIds.map((c: { id: string }) => c.id);
        const { data: likes } = await supabase
          .from('feed_comment_likes')
          .select('comment_id')
          .eq('visitor_id', visitorId)
          .in('comment_id', ids);

        if (mountedRef.current && likes) {
          setLikedCommentIds(new Set(likes.map((l) => l.comment_id)));
        }
      }
    };

    fetchLiked();
  }, [feedId, visitorId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-sort when sortMode changes
  useEffect(() => {
    if (rawCommentsRef.current.length > 0) {
      reSort(rawCommentsRef.current, sortMode);
    }
  }, [sortMode, reSort]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);

    const offset = rawCommentsRef.current.length;
    const { data, error } = await supabase
      .from('feed_comments')
      .select('*')
      .eq('feed_id', feedId)
      .eq('moderation_status', 'visible')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (mountedRef.current && !error && data) {
      const merged = [...rawCommentsRef.current, ...data];
      rawCommentsRef.current = merged;
      setHasMore(data.length >= PAGE_SIZE);
      reSort(merged, sortMode);
    }
    if (mountedRef.current) setLoading(false);
  }, [feedId, hasMore, loading, sortMode, reSort]);

  const addComment = useCallback(async (text: string, parentId?: string | null): Promise<boolean> => {
    if (!text.trim() || submitting) return false;
    setSubmitting(true);

    const displayName = isAuthenticated ? adminDisplayName : getVisitorDisplayName();

    try {
      const insertPayload: Record<string, unknown> = {
        feed_id: feedId,
        visitor_id: visitorId,
        display_name: displayName,
        text: text.trim(),
        moderation_status: 'visible',
        parent_id: parentId ?? null,
        is_pinned: false,
        is_admin: isAuthenticated,
        is_verified: false,
        like_count: 0,
      };

      const { data, error } = await supabase
        .from('feed_comments')
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        console.error('[feed_comments insert error]', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      if (mountedRef.current && data) {
        rawCommentsRef.current = [...rawCommentsRef.current, data];
        reSort(rawCommentsRef.current, sortMode);
        setCommentCount((c) => c + 1);
      }
      track('feed_comment_submit', { feedId });
      return true;
    } catch (err) {
      if (import.meta.env.DEV) console.error('[feed_comments] submit failed:', err);
      return false;
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }, [feedId, visitorId, isAuthenticated, adminDisplayName, submitting, sortMode, reSort]);

  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('feed_comments')
        .delete()
        .eq('id', commentId)
        .eq('visitor_id', visitorId);

      if (error) throw error;

      if (mountedRef.current) {
        rawCommentsRef.current = rawCommentsRef.current.filter((c) => c.id !== commentId && c.parent_id !== commentId);
        reSort(rawCommentsRef.current, sortMode);
        setCommentCount((c) => Math.max(0, c - 1));
      }
      track('feed_comment_delete', { feedId, metadata: { commentId } });
      return true;
    } catch (err) {
      if (import.meta.env.DEV) console.error('[feed_comments] delete failed:', err);
      return false;
    }
  }, [feedId, visitorId, sortMode, reSort]);

  const toggleCommentLike = useCallback(async (commentId: string): Promise<void> => {
    const wasLiked = likedCommentIds.has(commentId);
    const prevIds = new Set(likedCommentIds);
    const prevRaw = rawCommentsRef.current;

    // Optimistic update
    if (wasLiked) {
      setLikedCommentIds((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    } else {
      setLikedCommentIds((prev) => new Set(prev).add(commentId));
    }
    rawCommentsRef.current = rawCommentsRef.current.map((c) =>
      c.id === commentId ? { ...c, like_count: (c.like_count ?? 0) + (wasLiked ? -1 : 1) } : c
    );
    reSort(rawCommentsRef.current, sortMode);

    try {
      if (wasLiked) {
        const { error } = await supabase
          .from('feed_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('visitor_id', visitorId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('feed_comment_likes')
          .insert({ comment_id: commentId, visitor_id: visitorId });
        if (error) throw error;
      }
    } catch {
      // Rollback
      if (mountedRef.current) {
        setLikedCommentIds(prevIds);
        rawCommentsRef.current = prevRaw;
        reSort(rawCommentsRef.current, sortMode);
      }
    }
  }, [likedCommentIds, visitorId, sortMode, reSort]);

  return {
    comments,
    loading,
    submitting,
    addComment,
    commentCount,
    sortMode,
    setSortMode,
    hasMore,
    loadMore,
    likedCommentIds,
    toggleCommentLike,
    deleteComment,
  };
}
