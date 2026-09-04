import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFeedComments } from '../../hooks/useFeedSocial';

interface CommentsModalProps {
  feedId: string;
  isOpen: boolean;
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return 'hozir';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} daqiqa oldin`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} soat oldin`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} kun oldin`;
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

export const CommentsModal: React.FC<CommentsModalProps> = ({ feedId, isOpen, onClose }) => {
  const { comments, loading, submitting, addComment, commentCount } = useFeedComments(feedId);
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments.length]);

  const handleSubmit = async () => {
    if (!inputText.trim() || submitting) return;
    const ok = await addComment(inputText);
    if (ok) setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 340, mass: 0.8 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-950 rounded-t-[28px] shadow-[0_-12px_40px_rgba(0,0,0,0.25)] border-t border-neutral-200 dark:border-neutral-800 max-h-[80vh] flex flex-col"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 pointer-events-none">
              <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 pt-1 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <MessageCircle className="w-4.5 h-4.5 text-neutral-500 dark:text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-neutral-900 dark:text-white leading-none">
                    Izohlar
                  </h3>
                  {commentCount > 0 && (
                    <span className="text-[11px] font-semibold text-neutral-400">
                      {commentCount} ta izoh
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors active:scale-90"
              >
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Comments List */}
            <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {/* Loading state */}
              {loading && (
                <div className="text-center py-8">
                  <div className="w-7 h-7 border-[2.5px] border-neutral-200 dark:border-neutral-700 border-t-neutral-500 rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-neutral-400 mt-3 font-medium">Yuklanmoqda...</p>
                </div>
              )}

              {/* Empty state */}
              {!loading && comments.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto">
                    <MessageCircle className="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-600 dark:text-neutral-300">
                      Hali izohlar yo'q
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                      Birinchi bo'lib fikringizni yozing
                    </p>
                  </div>
                </div>
              )}

              {/* Comment items */}
              {!loading && comments.length > 0 && (
                <div className="space-y-5">
                  {comments.map((comment, idx) => (
                    <motion.div
                      key={comment.id}
                      initial={idx >= comments.length - 1 ? { opacity: 0, y: 8 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-3"
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs ${getAvatarColor(comment.display_name)}`}>
                        {comment.display_name.charAt(0).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[13px] font-bold text-neutral-900 dark:text-white">
                            {comment.display_name}
                          </span>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                            {timeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-[13px] text-neutral-700 dark:text-neutral-300 mt-0.5 leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="px-4 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 safe-area-bottom">
              <div className="flex items-center gap-2.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Fikringizni yozing..."
                  maxLength={500}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-[13px] text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600 transition-shadow"
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!inputText.trim() || submitting}
                  className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 shrink-0"
                  aria-label="Yuborish"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-neutral-900/30 dark:border-t-neutral-900 rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-end mt-2 px-1">
                <p className={`text-[10px] font-medium ${inputText.length > 450 ? 'text-amber-500' : 'text-neutral-300 dark:text-neutral-600'}`}>
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
