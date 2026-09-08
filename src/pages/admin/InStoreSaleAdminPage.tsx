import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Store,
  QrCode,
  ScanLine,
  KeyRound,
  ArrowRight,
  Info,
  Minus,
  Plus,
  CheckCircle2,
  XCircle,
  StickyNote,
  Loader2,
  AlertTriangle,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import {
  getBuySessionByCode,
  setSessionStatus,
  markSessionViewed,
  recordSale,
  markSessionProcessed,
  sessionEstimatedValue,
  formatDateTime,
  formatShortTime,
} from '../../lib/admin/ops';
import { decodeScanPayload, passcodeScanner, cameraScanner, scannerUnavailableReason } from '../../lib/scanner';
import { verifyChecksum, formatTimeRemaining } from '../../types/buySession';
import { formatPrice } from '../../lib/utils';
import { track } from '../../lib/analytics/client';

type Stage = 'entry' | 'loaded' | 'notfound';

interface WorkingLine {
  id: string;
  qty: number;
  available: boolean;
}

const PASSCODE_RE = /^[A-HJ-KM-NP-Z2-9]{6,8}$/;

export const InStoreSaleAdminPage: React.FC = () => {
  const { storeInfo, products, logActivity } = useStore();
  const [params, setParams] = useSearchParams();
  const [passcode, setPasscode] = useState('');
  const [stage, setStage] = useState<Stage>('entry');
  const [notice, setNotice] = useState<string | null>(null);
  const [loadedCode, setLoadedCode] = useState<string | null>(null);
  const [lines, setLines] = useState<WorkingLine[]>([]);
  const [notes, setNotes] = useState('');
  const [confirm, setConfirm] = useState<'complete' | 'partial' | 'cancelled' | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const loadedSession = useMemo(() => (loadedCode ? getBuySessionByCode(loadedCode) : undefined), [loadedCode]);

  // Live countdown while a session is loaded.
  useEffect(() => {
    if (stage !== 'loaded') return;
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [stage]);

  // Support deep links from the Buy Sessions page + admin search.
  useEffect(() => {
    const code = params.get('code');
    if (code) {
      setPasscode(code.toUpperCase());
      void lookUp(code);
      setParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lookUp = useCallback(
    (raw: string) => {
      const result = decodeScanPayload(raw, passcodeScanner().kind);
      const value = result.code.toUpperCase();
      if (!value) {
        setNotice('Iltimos, passcode yoki QR kodni kiriting');
        return;
      }
      if (!PASSCODE_RE.test(value)) {
        setNotice('Passcode 6-8 belgidan iborat bo‘lishi kerak (O, 0, I, 1, L harflarsiz)');
        return;
      }
      setNotice(null);
      const session = getBuySessionByCode(value);
      if (!session || session.status === 'cancelled' || session.status === 'completed') {
        track('buy_session_searched', { metadata: { code: value, found: false } });
        setLoadedCode(null);
        setStage('notfound');
        return;
      }
      track('buy_session_searched', { metadata: { code: value, found: true, fromQr: result.fromQr } });
      track('buy_session_loaded', {
        metadata: { code: value, itemCount: session.items.length, validChecksum: verifyChecksum(session) },
      });
      markSessionViewed(value);
      setLoadedCode(value);
      setLines(
        session.items.map((i) => ({
          id: i.id,
          qty: i.qty,
          available: Boolean(productMap.get(i.id)),
        }))
      );
      setNotes(session.notes ?? '');
      setStage('loaded');
    },
    [productMap]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookUp(passcode);
  };

  const adjustQty = (id: string, delta: number) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, qty: Math.min(99, Math.max(1, l.qty + delta)) } : l))
    );
  };

  const toggleAvailable = (id: string) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, available: !l.available } : l)));
  };

  const reset = useCallback(() => {
    setStage('entry');
    setLoadedCode(null);
    setLines([]);
    setNotes('');
    setPasscode('');
    setNotice(null);
  }, []);

  const availableLines = lines.filter((l) => l.available);
  const unavailableCount = lines.length - availableLines.length;

  const resolvePrice = useCallback(
    (id: string) => (typeof productMap.get(id)?.price === 'number' ? productMap.get(id)!.price : 0),
    [productMap]
  );
  const lineValue = useCallback((id: string, qty: number) => resolvePrice(id) * qty, [resolvePrice]);
  const totalValue = useMemo(
    () => availableLines.reduce((s, l) => s + lineValue(l.id, l.qty), 0),
    [availableLines, lineValue]
  );
  const sessionValue = loadedSession ? sessionEstimatedValue(loadedSession.items, resolvePrice) : 0;

  const finalize = (kind: 'complete' | 'partial' | 'cancelled') => {
    if (!loadedSession) return;
    setBusy(true);
    const activeLines = currentLinesForSale(loadedSession.items, lines);
    const status = kind === 'complete' ? 'completed' : kind === 'partial' ? 'completed' : 'cancelled';
    const sale = recordSale({
      code: loadedSession.code,
      status: kind === 'complete' ? 'completed' : kind === 'partial' ? 'partial' : 'cancelled',
      items: activeLines,
      totalSum: kind === 'cancelled' ? 0 : totalValue,
      totalCount: activeLines.reduce((s, l) => s + l.qty, 0),
      notes: notes.trim() || undefined,
    });
    setSessionStatus(loadedSession.code, status);
    markSessionProcessed(loadedSession.code, sale.id);
    track(
      kind === 'complete' ? 'sale_completed' : kind === 'partial' ? 'sale_partial' : 'sale_cancelled',
      { metadata: { code: loadedSession.code, itemCount: activeLines.length, totalSum: sale.totalSum, partial: kind === 'partial' } }
    );
    logActivity(
      kind === 'cancelled' ? 'cancel' : 'complete',
      'sale',
      kind === 'cancelled'
        ? `Sotuv bekor qilindi — "${loadedSession.code}" sessiyasi`
        : `Sotuv yakunlandi — "${loadedSession.code}" sessiyasi (${formatPrice(sale.totalSum)})`
    );
    setBusy(false);
    setConfirm(null);
    reset();
  };

  if (stage === 'notfound') {
    return (
      <SaleShell>
        <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-5 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-black text-foreground">Sessiya topilmadi</h2>
            <p className="text-sm text-muted-foreground">
              «{passcode}» passcode sessiya ro‘yxatida yo‘q yoki allaqachon yakunlangan.
              Xaridor telefonda sessiya yaratishini tasdiqlang va passcode to‘g‘ri kiritilganiga ishonch hosil qiling.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-foreground text-background dark:bg-primary dark:text-primary-foreground text-xs font-black transition-all hover:opacity-90 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Qayta urinish
          </button>
        </div>
      </SaleShell>
    );
  }

  return (
    <SaleShell>
      {stage === 'entry' && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <ScanLine className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-lg font-black text-foreground">Xaridor sessiyasini qabul qiling</h2>
            <p className="text-sm text-muted-foreground">
              Xaridor buy listdan QR yoki passcode yaratadi. Sotuvchi bu yerda qabul qilib,
              mahsulotlarni tekshiradi va sotuvni yakunlaydi.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <label className="block text-xs font-bold text-foreground mb-1.5 text-left">
              Passcode yoki QR kiritish
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                  placeholder="Masalan: 7XKF92"
                  maxLength={64}
                  autoCapitalize="characters"
                  autoComplete="off"
                  className="w-full pl-9 pr-3 py-3 rounded-xl bg-background border border-border text-sm font-mono tracking-widest text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-3 rounded-xl bg-foreground text-background dark:bg-primary dark:text-primary-foreground text-xs font-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
            {notice && <p className="text-xs font-bold text-destructive mt-2 text-left">{notice}</p>}
          </form>

          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex-1 h-px bg-border" />
              yoki
              <span className="flex-1 h-px bg-border" />
            </div>
            <button
              type="button"
              onClick={() => setNotice(scannerUnavailableReason(cameraScanner().kind))}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border bg-muted/40 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <QrCode className="w-4 h-4" />
              QR skaner
            </button>
          </div>
        </div>
      )}

      {stage === 'loaded' && loadedSession && (
        <div className="space-y-4">
          {/* Loaded session header */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Sessiya yuklandi</p>
                <p className="font-mono font-black tracking-[0.2em] text-lg text-foreground">{loadedSession.code}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">
                Yaratilgan: {formatDateTime(loadedSession.ts)} · Amal qilish: {formatShortTime(loadedSession.exp)}
              </p>
              <Countdown exp={loadedSession.exp} now={now} />
            </div>
          </div>

          {/* Product lines */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider">Mahsulotlar</h3>
              <span className="text-xs text-muted-foreground">
                Taxminiy qiymat: <b className="text-foreground font-black">{formatPrice(sessionValue)}</b>
              </span>
            </div>

            {lines.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Sessiyada mahsulot yo‘q.</p>
            ) : (
              lines.map((l) => {
                const product = productMap.get(l.id);
                const name = product?.name ?? 'O‘chirilgan mahsulot';
                const mainPrice = resolvePrice(l.id) * l.qty;
                return (
                  <div
                    key={l.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
                      l.available ? 'border-border/70 bg-background' : 'border-red-200/60 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20 opacity-60'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {l.available ? `${formatPrice(resolvePrice(l.id))} × ${l.qty}` : 'Qo‘lda yo‘q — sotuvdan chiqarildi'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {l.available ? (
                        <>
                          <button
                            type="button"
                            onClick={() => adjustQty(l.id, -1)}
                            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors active:scale-90"
                            aria-label="Kamaytirish"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-black tabular-nums">{l.qty}</span>
                          <button
                            type="button"
                            onClick={() => adjustQty(l.id, 1)}
                            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors active:scale-90"
                            aria-label="Oshirish"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => toggleAvailable(l.id)}
                        title={l.available ? 'Qo‘lda yo‘q deb belgilash' : 'Qaytarish'}
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors active:scale-90 ${
                          l.available
                            ? 'border-border text-muted-foreground hover:text-red-600 hover:border-red-400/50'
                            : 'border-red-200 bg-red-500/10 text-red-600'
                        }`}
                      >
                        {l.available ? <XCircle className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Notes */}
            <div className="pt-2">
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                <StickyNote className="w-3.5 h-3.5" />
                Sotuvchi izohi
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Masalan: mijoz ularni kechga oladi, qo‘ng‘iroq qilish kutilmoqda…"
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all resize-none"
              />
            </div>

            {unavailableCount > 0 && (
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-3 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-900 dark:text-amber-200">
                  {unavailableCount} ta mahsulot «qo‘lda yo‘q» deb belgilandi — sotuv qisman («partial») deb yakunlanadi.
                </p>
              </div>
            )}
          </div>

          {/* Summary + actions */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {availableLines.length} ta mahsulot, jami {availableLines.reduce((s, l) => s + l.qty, 0)} dona
              </span>
              <span className="text-2xl font-black text-foreground">{formatPrice(totalValue)}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirm('complete')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-emerald-600 text-white text-sm font-black transition-all hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Sotuv yakunlandi
              </button>
              <button
                type="button"
                disabled={busy || unavailableCount === 0}
                onClick={() => setConfirm('partial')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-amber-500 text-amber-950 text-sm font-black transition-all hover:bg-amber-400 active:scale-[0.98] disabled:opacity-40"
              >
                Qisman yakunlash
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirm('cancelled')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-destructive/30 text-destructive text-sm font-black transition-all hover:bg-destructive/5 active:scale-[0.98] disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Bekor qilish
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex-1 h-px bg-border" />
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 font-bold hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Yangi sessiya qabul qilish
              </button>
              <span className="flex-1 h-px bg-border" />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirm}
        title={
          confirm === 'complete'
            ? 'Sotuv yakunlansinmi?'
            : confirm === 'partial'
              ? 'Sotuv qisman yakunlansinmi?'
              : 'Sotuv bekor qilinsinmi?'
        }
        message={
          confirm === 'cancelled'
            ? 'Bu amal sessiyani bekor qiladi va xaridor ro‘yxati yaroqsiz bo‘ladi.'
            : `${availableLines.length} ta mahsulot, umumiy ${formatPrice(totalValue)} qiymatda yoziladi.`
        }
        confirmLabel={confirm === 'cancelled' ? 'Ha, bekor qilish' : 'Ha, yakunlash'}
        onConfirm={confirm ? () => finalize(confirm) : undefined}
        onCancel={() => setConfirm(null)}
      />
    </SaleShell>
  );
};

function currentLinesForSale(
  originalItems: { id: string; qty: number }[],
  working: { id: string; qty: number; available: boolean }[]
): { id: string; qty: number }[] {
  return working.filter((l) => l.available && l.qty > 0).map((l) => ({ id: l.id, qty: l.qty }));
}

function Countdown({ exp, now }: { exp: number; now: number }) {
  const remaining = Math.max(0, exp - now);
  const expired = remaining <= 0;
  return (
    <span className={`text-[11px] font-black tabular-nums ${expired ? 'text-red-500' : 'text-muted-foreground'}`}>
      {expired ? 'Muddati tugagan' : `Qolgan: ${formatTimeRemaining(remaining)}`}
    </span>
  );
}

function SaleShell({ children }: { children: React.ReactNode }) {
  const { storeInfo } = useStore();
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500 mb-1">
            <Store className="w-3.5 h-3.5 fill-amber-500" />
            <span>{storeInfo.businessName || 'Do‘kon'}</span>
          </div>
          <h1 className="text-2xl font-black text-foreground font-display tracking-tighter">
            Do‘konda Sotuv
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Xaridor sessiyasini qabul qiling → mahsulotlarni tekshiring → sotuvni yakunlang.
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default InStoreSaleAdminPage;