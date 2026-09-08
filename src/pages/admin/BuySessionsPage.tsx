import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  ShoppingBag,
  Search,
  Calendar,
  Package,
  Clock,
  XCircle,
  CheckCircle2,
  ScanLine,
  QrCode,
  KeyRound,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import {
  listBuySessions,
  setSessionStatus,
  markSessionViewed,
  sessionQrPayload,
  sessionEstimatedValue,
  formatDateTime,
  formatShortTime,
  BuySessionStatus,
  tashkentMidnight,
} from '../../lib/admin/ops';
import { formatPrice } from '../../lib/utils';
import { track } from '../../lib/analytics/client';

type FilterTab = 'all' | 'active' | 'expired' | 'completed' | 'cancelled';

const TABS: { key: FilterTab; label: string; statuses: BuySessionStatus[] | null }[] = [
  { key: 'all', label: 'Barchasi', statuses: null },
  { key: 'active', label: 'Faol', statuses: ['active', 'viewed'] },
  { key: 'expired', label: 'Muddati tugagan', statuses: ['expired'] },
  { key: 'completed', label: 'Yakunlangan', statuses: ['completed'] },
  { key: 'cancelled', label: 'Bekor qilingan', statuses: ['cancelled'] },
];

export const BuySessionsPage: React.FC = () => {
  const { products } = useStore();
  const [tab, setTab] = useState<FilterTab>('all');
  const [query, setQuery] = useState('');
  const [dayPreset, setDayPreset] = useState<'all' | 'today' | '3d' | '7d'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState<Set<string>>(new Set());

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const resolveName = useMemo(
    () => (id: string) => productMap.get(id)?.name ?? 'O‘chirilgan mahsulot',
    [productMap]
  );
  const resolvePrice = useMemo(
    () => (id: string) => (typeof productMap.get(id)?.price === 'number' ? productMap.get(id)!.price : 0),
    [productMap]
  );

  const sessions = useMemo(() => {
    const all = listBuySessions();
    const statuses = TABS.find((t) => t.key === tab)?.statuses ?? null;
    const q = query.trim().toLowerCase();
    const now = Date.now();
    const dayStart = tashkentMidnight(now);
    const presetFrom =
      dayPreset === 'today' ? dayStart : dayPreset === '3d' ? dayStart - 2 * 86400000 : dayPreset === '7d' ? dayStart - 6 * 86400000 : null;
    const from = fromDate ? new Date(fromDate + 'T00:00:00Z').getTime() - 5 * 3600 * 1000 : presetFrom ?? null;
    const to = toDate ? new Date(toDate + 'T23:59:59Z').getTime() - 5 * 3600 * 1000 : null;
    return all.filter((s) => {
      if (statuses && !statuses.includes(s.status)) return false;
      if (from != null && s.ts < from) return false;
      if (to != null && s.ts > to) return false;
      if (!q) return true;
      const visit = formatDateTime(s.ts).toLowerCase();
      if (s.code.toLowerCase().includes(q)) return true;
      if (visit.includes(q)) return true;
      return s.items.some((i) => {
        const name = resolveName(i.id).toLowerCase();
        return name.includes(q) || i.id.toLowerCase().includes(q);
      });
    });
  }, [tab, query, dayPreset, fromDate, toDate, resolveName]);

  const handleSearch = (next: string) => {
    setQuery(next);
    track('buy_session_searched', { metadata: { hasQuery: next.trim().length > 0 } });
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    setSessionStatus(cancelTarget, 'cancelled');
    setCancelTarget(null);
  };

  const toggleQr = (code: string) => {
    setQrOpen((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const isActive = (s: { status: BuySessionStatus }) => s.status === 'active' || s.status === 'viewed';
  const activeCount = sessions.filter(isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500 mb-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Savdo</span>
          </div>
          <h1 className="text-2xl font-black text-foreground font-display tracking-tighter">Xarid sessiyalari</h1>
          <p className="text-sm text-muted-foreground mt-1">Active, foydalanilgan va yakunlangan sessiyalarni kuzatib boring.</p>
        </div>
        <Link
          to="/admin/in-store-sale"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background dark:bg-primary dark:text-primary-foreground text-xs font-black transition-all hover:opacity-90 active:scale-95"
        >
          <ScanLine className="w-4 h-4" />
          Do‘konda sotuv
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const count =
              t.statuses === null
                ? sessions.length
                : sessions.filter((s) => t.statuses!.includes(s.status)).length;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  tab === t.key
                    ? 'bg-foreground text-background dark:bg-primary dark:text-primary-foreground'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
                <span className="ml-1.5 opacity-60 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
          <label className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Passcode, mahsulot nomi yoki tashrif vaqti bo‘yicha qidirish…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
            />
          </label>
          <label className="flex items-center gap-2 px-3 rounded-xl bg-background border border-border text-xs">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <select
              value={dayPreset}
              onChange={(e) => setDayPreset(e.target.value as typeof dayPreset)}
              className="w-full py-2.5 bg-transparent text-foreground focus:outline-none"
            >
              <option value="all">Istalgan vaqt</option>
              <option value="today">Bugun</option>
              <option value="3d">Oxirgi 3 kun</option>
              <option value="7d">Oxirgi 7 kun</option>
            </select>
          </label>
          <label className="flex items-center gap-2 px-3 rounded-xl bg-background border border-border text-xs">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full py-2.5 bg-transparent text-foreground focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 px-3 rounded-xl bg-background border border-border text-xs">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full py-2.5 bg-transparent text-foreground focus:outline-none"
            />
          </label>
        </div>
      </div>

      {/* Status banner */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-border bg-card px-4 py-3 text-xs">
        <span className="font-black text-foreground">Jami: {sessions.length}</span>
        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Faol: {activeCount}
        </span>
        <span className="text-muted-foreground">Yakunlangan: {sessions.filter((s) => s.status === 'completed').length}</span>
        <span className="text-muted-foreground">Bekor: {sessions.filter((s) => s.status === 'cancelled').length}</span>
      </div>

      {/* Session cards */}
      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-black text-foreground">Sessiyalar topilmadi</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Xaridor buy listdan «Do‘kon uchun tayyorlash» orqali QR + passcode yaratganda sessiya shu yerda paydo bo‘ladi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sessions.map((s) => {
            const value = sessionEstimatedValue(s.items, resolvePrice);
            const itemNames = s.items
              .map((i) => `${resolveName(i.id)} ×${i.qty}`)
              .join(' · ');
            const qr = qrOpen.has(s.code);
            return (
              <div key={`${s.code}-${s.ts}`} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
                <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-mono font-black tracking-[0.2em] text-lg text-foreground">{s.code}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {formatDateTime(s.ts)}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>

                <div className="px-4 py-2.5 border-t border-border/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Amal qilish muddati
                    </span>
                    <span className="font-mono text-foreground">{formatShortTime(s.exp)}</span>
                  </div>
                  <p className="line-clamp-3" title={itemNames}>
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Package className="w-3 h-3" />
                      {s.items.length} ta tur
                    </span>
                    <span className="text-muted-foreground"> · </span>
                    {itemNames || 'Bo‘sh sessiya'}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Taxminiy qiymat</span>
                    <span className="font-black text-foreground">{formatPrice(value)}</span>
                  </div>
                </div>

                <div className="mt-auto px-3 py-2.5 border-t border-border/60 flex items-center gap-1.5">
                  <Link
                    to={`/admin/in-store-sale?code=${s.code}`}
                    onClick={() => markSessionViewed(s.code)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-foreground text-background dark:bg-primary dark:text-primary-foreground text-[11px] font-black transition-all hover:opacity-90 active:scale-95"
                  >
                    <ScanLine className="w-3.5 h-3.5" />
                    Sotuv
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleQr(s.code)}
                    className={`p-2 rounded-lg border border-border text-[11px] ${qr ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
                    title="QR kod"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  {isActive(s) && (
                    <button
                      type="button"
                      onClick={() => setCancelTarget(s.code)}
                      className="p-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                      title="Bekor qilish"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {qr && (
                  <div className="px-4 pb-4">
                    <div className="rounded-xl bg-muted/40 p-3 flex items-center justify-between gap-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <QRCodeCanvas value={sessionQrPayload(s)} size={92} marginSize={1} level="M" />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Xaridor telefoni o‘qishi uchun QR kod. Passcode: <b className="font-mono text-foreground">{s.code}</b>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!cancelTarget}
        title="Sessiya bekor qilinsinmi?"
        message={`"${cancelTarget ?? ''}" passcode shu sessiya uchun bekor qilinadi va yaroqsiz bo‘ladi.`}
        confirmLabel="Ha, bekor qilish"
        onConfirm={confirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
};

function StatusBadge({ status }: { status: BuySessionStatus }) {
  const cfg: Record<BuySessionStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    active: {
      label: 'Faol',
      cls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      icon: <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />,
    },
    viewed: {
      label: 'Ko‘rildi',
      cls: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    expired: {
      label: 'Muddati tugagan',
      cls: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300',
      icon: <Clock className="w-3 h-3" />,
    },
    completed: {
      label: 'Yakunlangan',
      cls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    cancelled: {
      label: 'Bekor qilingan',
      cls: 'bg-red-500/10 text-red-700 dark:text-red-300',
      icon: <XCircle className="w-3 h-3" />,
    },
  };
  const c = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black ${c.cls}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

export default BuySessionsPage;