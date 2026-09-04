import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
  Film,
  Clock,
  User,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import type { FeedComment } from '../../types/supabase-db';
import { useVideoFeed } from '../../context/VideoContext';
import { track } from '../../lib/analytics/client';

type CommentWithFeed = FeedComment & { feed_title?: string };

export const CommentsAdminPage: React.FC = () => {
  const [comments, setComments] = useState<CommentWithFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden' | 'pending'>('all');
  const { videos, loading: feedLoading } = useVideoFeed();

  const fetchComments = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('feed_comments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (filter !== 'all') {
      query = query.eq('moderation_status', filter);
    }

    const { data, error } = await query;

    if (!error && data) {
      // Build title map from all videos (including unpublished, for admin context)
      const titleMap = new Map(videos.map((v) => [v.id, v.title]));
      const withTitles = data.map((c) => ({
        ...c,
        feed_title: titleMap.get(c.feed_id) ?? c.feed_id,
      }));
      setComments(withTitles);
    }
    setLoading(false);
  }, [filter, videos]);

  useEffect(() => {
    if (!feedLoading) fetchComments();
  }, [fetchComments, feedLoading]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const updateStatus = async (id: string, status: FeedComment['moderation_status']) => {
    const comment = comments.find((c) => c.id === id);
    const { error } = await supabase
      .from('feed_comments')
      .update({ moderation_status: status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, moderation_status: status } : c))
      );
      if (comment) {
        if (status === 'hidden') track('feed_comment_hide', { feedId: comment.feed_id });
        else if (status === 'deleted') track('feed_comment_delete', { feedId: comment.feed_id });
        else if (status === 'visible' && comment.moderation_status !== 'visible') {
          track('feed_comment_restore', { feedId: comment.feed_id });
        }
      }
    }
  };

  const deleteComment = async (id: string) => {
    await updateStatus(id, 'deleted');
  };

  const hideComment = async (id: string) => {
    await updateStatus(id, 'hidden');
  };

  const restoreComment = async (id: string) => {
    await updateStatus(id, 'visible');
  };

  const statusColor = (s: FeedComment['moderation_status']) => {
    switch (s) {
      case 'visible':
        return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400';
      case 'hidden':
        return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400';
      case 'pending':
        return 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400';
      case 'deleted':
        return 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500';
    }
  };

  const statusLabel = (s: FeedComment['moderation_status']) => {
    switch (s) {
      case 'visible': return 'Ko\'rinadi';
      case 'hidden': return 'Yashirilgan';
      case 'pending': return 'Kutilmoqda';
      case 'deleted': return 'O\'chirilgan';
      default: return s;
    }
  };

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Barchasi' },
    { key: 'visible', label: 'Ko\'rinadi' },
    { key: 'hidden', label: 'Yashirilgan' },
    { key: 'pending', label: 'Kutilmoqda' },
  ];

  const visibleCount = comments.filter((c) => c.moderation_status === 'visible').length;
  const hiddenCount = comments.filter((c) => c.moderation_status === 'hidden').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-3xl bg-neutral-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-neutral-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Video izohlari</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Mijozlar izohlari
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300">
              Video ostidagi mijozlar savollari va fikrlarini boshqaring
            </p>
          </div>
          <button
            type="button"
            onClick={fetchComments}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-100 transition-all shadow-md active:scale-95 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Yangilash</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80">
          <div className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">Jami</div>
          <div className="text-lg font-black text-neutral-900 dark:text-white">{comments.length}</div>
        </div>
        <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80">
          <div className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">Ko'rinadi</div>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{visibleCount}</div>
        </div>
        <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80">
          <div className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">Yashirilgan</div>
          <div className="text-lg font-black text-amber-600 dark:text-amber-400">{hiddenCount}</div>
        </div>
        <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80">
          <div className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">O'chirilgan</div>
          <div className="text-lg font-black text-red-600 dark:text-red-400">{comments.filter((c) => c.moderation_status === 'deleted').length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === f.key
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 p-14 text-center text-sm text-neutral-400">
          Yuklanmoqda...
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center space-y-3">
          <MessageCircle className="w-12 h-12 text-neutral-200 dark:text-neutral-700 mx-auto" />
          <p className="text-sm text-neutral-500">Hali izohlar yo'q</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-2xl border transition-all ${
                comment.moderation_status === 'deleted'
                  ? 'bg-red-50/50 dark:bg-red-950/10 border-red-200/40 dark:border-red-900/30 opacity-60'
                  : comment.moderation_status === 'hidden'
                  ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/40 dark:border-amber-900/30'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${statusColor(comment.moderation_status)}`}>
                      {statusLabel(comment.moderation_status)}
                    </span>
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(comment.created_at).toLocaleString('uz-UZ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      {comment.display_name}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-900 dark:text-white mt-1 leading-relaxed">
                    {comment.text}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-neutral-400">
                    <Film className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{comment.feed_title}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {comment.moderation_status === 'visible' && (
                    <button
                      type="button"
                      onClick={() => hideComment(comment.id)}
                      className="p-2 rounded-lg text-neutral-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                      title="Yashirish"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  )}
                  {comment.moderation_status === 'hidden' && (
                    <button
                      type="button"
                      onClick={() => restoreComment(comment.id)}
                      className="p-2 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                      title="Ko'rsatish"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {(comment.moderation_status === 'visible' || comment.moderation_status === 'hidden') && (
                    <button
                      type="button"
                      onClick={() => deleteComment(comment.id)}
                      className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {comment.moderation_status === 'deleted' && (
                    <button
                      type="button"
                      onClick={() => restoreComment(comment.id)}
                      className="p-2 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                      title="Tiklash"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
