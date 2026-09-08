import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Clock, X } from 'lucide-react';

// Polite session-expiry warning. Backed by AuthContext's real expiry heartbeat:
//   - sessionWarning flips true AUTH_CONFIG.sessionWarnMs (5 min) before expiry
//     and the banner explains what happens next;
//   - "Davom etish" forces a TRUE token refresh (supabase.auth.refreshSession),
//     resetting sessionExpiresAt — no fake timers, no client-only promises.
// At hard expiry AuthContext signs out; the UX already told the user why.
export const SessionWarningBanner: React.FC = () => {
  const { sessionWarning, sessionExpiresAt, refreshSession } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [sessionExpiresAt]);

  const remaining = useMemo(() => {
    if (!sessionExpiresAt) return null;
    const ms = sessionExpiresAt * 1000 - Date.now();
    if (ms <= 0) return null;
    const totalSec = Math.ceil(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, [sessionExpiresAt]);

  if (!sessionWarning || dismissed || remaining === null) return null;

  const handleContinue = async () => {
    setBusy(true);
    await refreshSession();
    setBusy(false);
  };

  return (
    <div className="sticky top-0 z-30 px-4 sm:px-6 py-2.5 border-b border-amber-600/30 bg-amber-500/10 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto flex items-center gap-3">
        <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
            Sessiya muddati tugayapti
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300">
              {remaining}
            </span>
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
            Davom etmasangiz, sessiya yopilib loginningizga qaytasiz.
          </p>
        </div>
        <button
          type="button"
          onClick={handleContinue}
          disabled={busy}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-white text-xs font-black hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          {busy ? 'Yangiilanmoqda…' : 'Davom etish'}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Yopish"
          className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};