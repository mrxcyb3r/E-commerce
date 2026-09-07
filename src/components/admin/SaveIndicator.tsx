import React from 'react';
import { Check, Loader2 } from 'lucide-react';

interface SaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt?: number | null;
  className?: string;
}

/** Autosave status indicator: "Saving... / Saved / Last saved Xs ago". */
export const SaveIndicator: React.FC<SaveIndicatorProps> = ({
  status,
  lastSavedAt,
  className = '',
}) => {
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    if (status !== 'saved' || !lastSavedAt) return;
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, [status, lastSavedAt]);

  if (status === 'idle') return null;

  const ago =
    status === 'saved' && lastSavedAt
      ? Math.max(0, Math.round((now - lastSavedAt) / 1000))
      : null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground ${className}`}
      role="status"
      aria-live="polite"
    >
      {status === 'saving' && (
        <>
          <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
          Saqlanmoqda…
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="w-3 h-3 text-emerald-500" aria-hidden="true" />
          Saqlandi{ago !== null && ago >= 5 ? ` · ${ago} soniya oldin` : ''}
        </>
      )}
      {status === 'error' && (
        <span className="text-destructive font-semibold">Saqlashda xatolik</span>
      )}
    </span>
  );
};

export default SaveIndicator;
