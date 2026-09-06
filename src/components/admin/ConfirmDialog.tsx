import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "O'chirish",
  cancelLabel = 'Bekor qilish',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 w-full max-w-md bg-card rounded-xl p-6 shadow-xl border border-border"
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isDestructive
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-accent/10 text-accent'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground leading-tight">
                {title}
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {message}
              </p>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98] ${
                isDestructive
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : 'bg-foreground text-background hover:bg-foreground/90'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
