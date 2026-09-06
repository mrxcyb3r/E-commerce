import React from 'react';
import { X, Trash2, Eye, Copy, Tag, Download, Upload, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActionButton } from './PageHeader';

interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'destructive';
  disabled?: boolean;
  confirm?: {
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  };
}

interface BulkActionBarProps {
  selectedCount: number;
  actions: BulkAction[];
  onClearSelection: () => void;
  className?: string;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  actions,
  onClearSelection,
  className = '',
}) => {
  const [confirmAction, setConfirmAction] = React.useState<BulkAction | null>(null);

  const handleActionClick = (action: BulkAction) => {
    if (action.confirm) {
      setConfirmAction(action);
    } else {
      action.onClick();
    }
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction.confirm.onConfirm();
      setConfirmAction(null);
    }
  };

  const handleCancel = () => {
    setConfirmAction(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-2xl ${className}`}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-foreground">
                {selectedCount} selected
              </span>
              <button
                type="button"
                onClick={onClearSelection}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear selection"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {actions.map((action, index) => (
                <ActionButton
                  key={action.label}
                  onClick={() => handleActionClick(action)}
                  variant={action.variant || 'secondary'}
                  icon={action.icon}
                  disabled={action.disabled}
                  className="whitespace-nowrap"
                >
                  {action.label}
                </ActionButton>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground">{confirmAction.confirm.title}</h3>
                    <p className="text-sm text-muted-foreground">{confirmAction.confirm.description}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <ActionButton
                    variant="ghost"
                    onClick={handleCancel}
                  >
                    Cancel
                  </ActionButton>
                  <ActionButton
                    variant="destructive"
                    onClick={handleConfirm}
                  >
                    {confirmAction.confirm.confirmLabel}
                  </ActionButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BulkActionBar;