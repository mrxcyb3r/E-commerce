import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { X, Send, MessageCircle, Heart, Reply, Pin, MoreHorizontal, BadgeCheck, Shield, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFeedComments, type SortMode } from '../../hooks/useFeedSocial';
import { useI18n } from '../../i18n/I18nContext';
import type { FeedComment } from '../../types/supabase-db';
import { getVisitorId } from '../../lib/analytics/session';

interface CommentsModalProps {
  feedId: string;
  isOpen: boolean;
  onClose: () => void;
}

function timeAgo(dateStr: string, t: (section: string, key: string) => string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return t('comments', 'justNow');
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} ${t('comments', 'minutesAgo')}`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ${t('comments', 'hoursAgo')}`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} ${t('comments', 'daysAgo')}`;
}

const AVATAR_COLORS = [
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false
  );

  useLayoutEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isDesktop;
}

const SORT_OPTIONS: SortMode[] = ['newest', 'oldest', 'mostLiked'];

const CommentItem: React.FC<{
  comment: FeedComment;
  depth: number;
  visitorId: string;
  t: (section: string, key: string) => string;
  likedCommentIds: Set<string>;
  onLike: (id: string) => void;
  onReply: (parentId: string, parentName: string) => void;
  onDelete: (id: string) => void;
  onDeleteConfirm: (comment: FeedComment) => void;
}> = ({ comment, depth, visitorId, t, likedCommentIds, onLike, onReply, onDelete, onDeleteConfirm }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwn = comment.visitor_id === visitorId;
  const isLiked = likedCommentIds.has(comment.id);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div className={depth > 0 ? 'ml-8' : ''}>
      <div className={`flex gap-3 ${depth > 0 ? 'py-2' : 'py-0'}`}>
        {/* Avatar */}
        <div className={`${depth > 0 ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'} rounded-full flex items-center justify-center shrink-0 font-black ${getAvatarColor(comment.display_name)}`}>
          {comment.display_name.charAt(0).toUpperCase()}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] font-bold text-foreground">
              {comment.display_name}
            </span>
            {comment.is_verified && (
              <span title={t('comments', 'verified')}>
                <BadgeCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              </span>
            )}
            {comment.is_admin && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full px-1.5 py-px">
                <Shield className="w-2.5 h-2.5" />
                {t('comments', 'admin')}
              </span>
            )}
            {comment.is_pinned && (
              <span title={t('comments', 'pinned')}>
                <Pin className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
              </span>
            )}
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
              {timeAgo(comment.created_at, t)}
            </span>
          </div>
          <p className="text-[13px] text-zinc-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
            {comment.text}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1.5">
            <button
              type="button"
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${isLiked ? 'text-rose-500' : 'text-zinc-400 hover:text-rose-400 dark:hover:text-rose-400'}`}
              aria-label={t('feed', 'like')}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              {(comment.like_count ?? 0) > 0 && <span>{comment.like_count}</span>}
            </button>
            <button
              type="button"
              onClick={() => onReply(comment.id, comment.display_name)}
              className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              aria-label={t('comments', 'reply')}
            >
              <Reply className="w-3.5 h-3.5" />
              {t('comments', 'reply')}
            </button>

            {/* Overflow menu */}
            {(isOwn || true) && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-0.5 rounded"
                  aria-label={t('nav', 'openMenu')}
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-0 top-full mt-1 z-30 bg-card rounded-xl shadow-lg border border-border py-1 min-w-[140px]"
                    >
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); onDeleteConfirm(comment); }}
                        className="w-full text-left px-3 py-1.5 text-[12px] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                      >
                        {t('comments', 'report')}
                      </button>
                      {isOwn && (
                        <button
                          type="button"
                          onClick={() => { setMenuOpen(false); onDelete(comment.id); }}
                          className="w-full text-left px-3 py-1.5 text-[12px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          {t('comments', 'deleteOwn')}
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CommentsModal: React.FC<CommentsModalProps> = ({ feedId, isOpen, onClose }) => {
  const { t } = useI18n();
  const {
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
  } = useFeedComments(feedId);

  const [inputText, setInputText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<FeedComment | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();
  const visitorId = getVisitorId();

  useEffect(() => {
    if (isOpen) {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', onKey);
      setTimeout(() => inputRef.current?.focus(), 350);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!sortDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sortDropdownOpen]);

  // Confirm delete dialog (simple confirm)
  const confirmDelete = useCallback((comment: FeedComment) => {
    setDeleteConfirm(comment);
  }, []);

  const executeDelete = useCallback(() => {
    if (deleteConfirm) {
      deleteComment(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, deleteComment]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments.length]);

  const handleSubmit = async () => {
    if (!inputText.trim() || submitting) return;
    const inputWas = inputText;
    const parentId = replyTo?.id ?? null;
    const ok = await addComment(inputText, parentId);
    if (ok) {
      setInputText('');
      setReplyTo(null);
    } else if (ok === false && inputText === inputWas) {
      // Keep the user's text on failure
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReply = useCallback((parentId: string, parentName: string) => {
    setReplyTo({ id: parentId, name: parentName });
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleDelete = useCallback(async (commentId: string) => {
    await deleteComment(commentId);
  }, [deleteComment]);

  const sheetProps = isDesktop
    ? { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }
    : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } };

  // Group comments into top-level + replies
  const topLevel = comments.filter((c) => !c.parent_id);
  const replyMap = new Map<string, FeedComment[]>();
  for (const c of comments) {
    if (c.parent_id) {
      const arr = replyMap.get(c.parent_id) ?? [];
      arr.push(c);
      replyMap.set(c.parent_id, arr);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Delete confirmation overlay */}
          <AnimatePresence>
            {deleteConfirm && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 z-[60]"
                  onClick={() => setDeleteConfirm(null)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-[61] flex items-center justify-center p-6"
                >
                  <div className="bg-card rounded-2xl shadow-xl p-6 max-w-xs w-full space-y-4">
                    <p className="text-sm font-bold text-foreground text-center">
                      {t('comments', 'deleteOwn')}?
                    </p>
                    <p className="text-xs text-zinc-500 text-center">
                      {deleteConfirm.text.slice(0, 60)}{deleteConfirm.text.length > 60 ? '...' : ''}
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        {t('common', 'cancel')}
                      </button>
                      <button
                        type="button"
                        onClick={executeDelete}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        {t('common', 'delete')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Desktop: right drawer / Mobile: bottom sheet */}
          <motion.div
            {...sheetProps}
            transition={{ type: 'spring', damping: 32, stiffness: 340, mass: 0.8 }}
            role="dialog"
            aria-modal="true"
            aria-label={t('comments', 'title')}
            className={`fixed z-50 bg-white dark:bg-background border-border flex flex-col ${
              isDesktop
                ? 'inset-y-0 right-0 w-full sm:w-[400px] shadow-[-12px_0_40px_rgba(0,0,0,0.25)] border-l rounded-l-3xl'
                : 'bottom-0 left-0 right-0 rounded-t-[28px] shadow-[0_-12px_40px_rgba(0,0,0,0.25)] border-t max-h-[80vh]'
            }`}
          >
            {/* Drag handle (mobile only) */}
            {!isDesktop && (
              <div className="flex justify-center pt-3 pb-1 pointer-events-none">
                <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 pt-4 border-b border-zinc-100 dark:border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <MessageCircle className="w-4.5 h-4.5 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground leading-none">
                    {t('comments', 'title')}
                  </h3>
                  {commentCount > 0 && (
                    <span className="text-[11px] font-semibold text-zinc-400">
                      {commentCount} {t('comments', 'count')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort pill */}
                <div className="relative" ref={sortRef}>
                  <button
                    type="button"
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    aria-label={t('comments', sortMode)}
                  >
                    {t('comments', sortMode)}
                    <ChevronDown className={`w-3 h-3 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {sortDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-full mt-1 z-30 bg-card rounded-xl shadow-lg border border-border py-1 min-w-[130px]"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => { setSortMode(opt); setSortDropdownOpen(false); }}
                            className={`w-full text-left px-3 py-1.5 text-[12px] transition-colors ${
                              sortMode === opt
                                ? 'bg-zinc-100 dark:bg-zinc-700 font-bold text-foreground'
                                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                            }`}
                          >
                            {t('comments', opt)}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors active:scale-90"
                  aria-label={t('comments', 'close')}
                >
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {/* Loading state */}
              {loading && comments.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-7 h-7 border-[2.5px] border-border border-t-zinc-500 rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-zinc-400 mt-3 font-medium">{t('common', 'loading')}</p>
                </div>
              )}

              {/* Empty state */}
              {!loading && comments.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto">
                    <MessageCircle className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
                      {t('comments', 'empty')}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                      {t('comments', 'emptyDesc')}
                    </p>
                  </div>
                </div>
              )}

              {/* Comment items */}
              {!loading && comments.length > 0 && (
                <div className="space-y-4">
                  {topLevel.map((comment) => (
                    <React.Fragment key={comment.id}>
                      <AnimatePresence>
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                        >
                          {comment.is_pinned && (
                            <div className="flex items-center gap-1 mb-1">
                              <Pin className="w-2.5 h-2.5 text-amber-500" />
                              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">{t('comments', 'pinned')}</span>
                            </div>
                          )}
                          <CommentItem
                            comment={comment}
                            depth={0}
                            visitorId={visitorId}
                            t={t}
                            likedCommentIds={likedCommentIds}
                            onLike={toggleCommentLike}
                            onReply={handleReply}
                            onDelete={handleDelete}
                            onDeleteConfirm={confirmDelete}
                          />
                        </motion.div>
                      </AnimatePresence>

                      {/* Replies */}
                      {replyMap.get(comment.id)?.map((reply) => (
                        <AnimatePresence key={reply.id}>
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                          >
                            <CommentItem
                              comment={reply}
                              depth={1}
                              visitorId={visitorId}
                              t={t}
                              likedCommentIds={likedCommentIds}
                              onLike={toggleCommentLike}
                              onReply={handleReply}
                              onDelete={handleDelete}
                              onDeleteConfirm={confirmDelete}
                            />
                          </motion.div>
                        </AnimatePresence>
                      ))}
                    </React.Fragment>
                  ))}

                  {/* Typing indicator */}
                  {submitting && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 px-2 py-1"
                    >
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </motion.div>
                  )}

                  {/* Load more */}
                  {hasMore && !loading && (
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={loadMore}
                        className="text-[12px] font-semibold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      >
                        {t('comments', 'loadMore')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reply chip */}
            <AnimatePresence>
              {replyTo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 overflow-hidden"
                >
                  <div className="flex items-center justify-between bg-card rounded-xl px-3 py-2 mb-2 border border-zinc-100 dark:border-border">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Reply className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {t('comments', 'reply')}: {replyTo.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="shrink-0 ml-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-0.5"
                      aria-label={t('common', 'cancel')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input area */}
            <div className="px-4 py-3 border-t border-zinc-100 dark:border-border bg-white dark:bg-background safe-area-bottom">
              <div className="flex items-center gap-2.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('comments', 'placeholder')}
                  maxLength={500}
                  disabled={submitting}
                  aria-label={replyTo ? `${t('comments', 'reply')}: ${replyTo.name}` : t('comments', 'placeholder')}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-[13px] text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 transition-shadow"
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!inputText.trim() || submitting}
                  className="w-10 h-10 rounded-full bg-foreground text-background dark:bg-card dark:text-card-foreground flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 shrink-0"
                  aria-label={t('comments', 'send')}
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-zinc-900/30 dark:border-t-zinc-900 rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-end mt-2 px-1">
                <p className={`text-[10px] font-medium ${inputText.length > 450 ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-600'}`}>
                  {inputText.length}/500
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
