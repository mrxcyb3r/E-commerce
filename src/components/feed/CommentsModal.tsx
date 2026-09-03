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

export const CommentsModal: React.FC<CommentsModalProps> = ({ feedId, isOpen, onClose }) => {
  const { comments, loading, submitting, addComment, commentCount } = useFeedComments(feedId);
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 rounded-t-3xl shadow-2xl border border-neutral-200 dark:border-neutral-700 max-h-[75vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-neutral-500" />
                <h3 className="text-base font-black text-neutral-900 dark:text-white">
                  Izohlar
                </h3>
                {commentCount > 0 && (
                  <span className="text-xs font-bold text-neutral-400">
                    ({commentCount})
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Comments List */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
              {loading && (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-neutral-200 dark:border-neutral-700 border-t-neutral-500 rounded-full animate-spin mx-auto" />
                </div>
              )}

              {!loading && comments.length === 0 && (
                <div className="text-center py-10 space-y-2">
                  <MessageCircle className="w-10 h-10 text-neutral-200 dark:text-neutral-700 mx-auto" />
                  <p className="text-sm text-neutral-400">
                    Bu videoga hali izohlar yo'q.
                  </p>
                  <p className="text-xs text-neutral-300 dark:text-neutral-600">
                    Fikringizni birinchi bo'lib yozing.
                  </p>
                </div>
              )}

              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-neutral-400">
                      {comment.display_name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-black text-neutral-900 dark:text-white">
                        {comment.display_name}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {timeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5 leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Komment yozing..."
                  maxLength={500}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600"
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!inputText.trim() || submitting}
                  className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-neutral-300 dark:text-neutral-600 mt-1.5 text-center">
                {inputText.length}/500
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
