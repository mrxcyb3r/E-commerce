import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  ShoppingBag,
  Loader2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { formatPrice } from '../../lib/utils';
import { tashkentToday } from '../../lib/analytics/metrics';

type Trend = 'improving' | 'stable' | 'declining';
type SortKey = 'views' | 'unique' | 'prepared' | 'conversion' | 'saves';

interface PerfRow {
  productId: string;
  name: string;
  price: number;
  image?: string;
  views: number;
  uniqueViewers: number;
  saves: number;
  prepared: number;
  preparedUnique: number;
  shares: number;
  feedClicks: number;
  intentVisitors: number;
  conversion: number | null;
  trend: Trend;
}

const PERIODS = [
  { key: '7d' as const, label: '7 kun' },
  { key: '14d' as const, label: '14 kun' },
  { key: '30d' as const, label: '30 kun' },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'views', label: 'Ko‘rishlar' },
  { key: 'unique', label: 'No‘simlar' },
  { key: 'prepared', label: 'Xaridga tayyor' },
  { key: 'conversion', label: 'Konversiya' },
  { key: 'saves', label: 'Sevimlilar' },
];

export const ProductPerformancePage: React.FC = () => {
  const { products } = useStore();
  const resolvers = useMemo(
    () => ({
      resolveProduct: (id: string) => products.find((p) => p.id === id)?.name ?? 'O‘chirilgan mahsulot',
      resolveCategory: () => '—',
    }),
    [products]
  );
  const data = useAnalyticsData(resolvers);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('views');

  const rows = useMemo<PerfRow[]>(() => {
    const { from, to } = data.rangeDate;
    const midLow = new Date(from + 'T00:00:00Z').getTime();
    const midHigh = new Date(to + 'T23:59:59Z').getTime();
    const rangeMid = midLow + (midHigh - midLow) / 2;

    const preparedMap = new Map<string, { count: number; unique: Set<string> }>();
    const trendMap = new Map<string, { earlier: number; recent: number }>();
    for (const ev of data.events) {
      if (!ev.product_id) continue;
      const ts = ev.created_at ? new Date(ev.created_at).getTime() : NaN;
      if (ev.event_type === 'buy_list_add') {
        const cur = preparedMap.get(ev.product_id) ?? { count: 0, unique: new Set<string>() };
        cur.count += 1;
        cur.unique.add(ev.visitor_id);
        preparedMap.set(ev.product_id, cur);
      }
      if (ev.event_type === 'product_view' && Number.isFinite(ts) && ts >= midLow && ts <= midHigh) {
        const cur = trendMap.get(ev.product_id) ?? { earlier: 0, recent: 0 };
        if (ts < rangeMid) cur.earlier += 1;
        else cur.recent += 1;
        trendMap.set(ev.product_id, cur);
      }
    }

    const metricById = new Map(data.products.map((p) => [p.id, p]));
    return (products.length > 0 ? products : data.products.map((p) => ({ id: p.id, name: p.id })))
      .map((p): PerfRow | null => {
        const m = metricById.get(p.id);
        const prep = preparedMap.get(p.id);
        const trend = trendMap.get(p.id) ?? { earlier: 0, recent: 0 };
        const total = trend.earlier + trend.recent;
        let t: Trend = 'stable';
        if (total >= 2) {
          if (trend.recent >= Math.max(2, Math.ceil(trend.earlier * 1.25))) t = 'improving';
          else if (trend.recent < trend.earlier * 0.75) t = 'declining';
        }
        return {
          productId: p.id,
          name: resolvers.resolveProduct(p.id),
          price: 'price' in p ? (p.price as number) : 0,
          image: 'images' in p ? ((p as { images?: string[] }).images?.[0] ?? '') : '',
          views: m?.views ?? 0,
          uniqueViewers: m?.uniqueViewers ?? 0,
          saves: m?.saves ?? 0,
          prepared: prep?.count ?? 0,
          preparedUnique: prep?.unique.size ?? 0,
          shares: m?.shareClicks ?? 0,
          feedClicks: m?.feedProductClicks ?? 0,
          intentVisitors: m?.uniqueIntentVisitors ?? 0,
          conversion: m?.clickThroughRate ?? null,
          trend: t,
        };
      })
      .filter((r): r is PerfRow => r !== null);
  }, [data.events, data.products, data.rangeDate, products, resolvers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? rows.filter((r) => r.name.toLowerCase().includes(q)) : rows;
    const sorters: Record<SortKey, (a: PerfRow, b: PerfRow) => number> = {
      views: (a, b) => b.views - a.views,
      unique: (a, b) => b.uniqueViewers - a.uniqueViewers,
      prepared: (a, b) => b.prepared - a.prepared,
      conversion: (a, b) => (b.conversion ?? -1) - (a.conversion ?? -1),
      saves: (a, b) => b.saves - a.saves,
    };
    return [...list].sort(sorters[sortKey]);
  }, [rows, query, sortKey]);

  if (data.loading) {
    return (
      <div className="space-y-6">
        <Header />
        <div className="flex items-center justify-center py-20 gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Mahsulot tahlili yuklanmoqda…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
        <div className="flex gap-1.5 mr-auto">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => data.setRange(p.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                data.range === p.key
                  ? 'bg-foreground text-background dark:bg-primary dark:text-primary-foreground'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <label className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mahsulot nomi bo‘yicha…"
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
          />
        </label>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="px-3 py-2 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[860px]">
            <thead>
              <tr className="border-b border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Mahsulot</th>
                <th className="py-3 px-2 text-center">Ko‘rishlar</th>
                <th className="py-3 px-2 text-center">No‘simlar</th>
                <th className="py-3 px-2 text-center">Sevimlilar</th>
                <th className="py-3 px-2 text-center">Xaridga tayyor</th>
                <th className="py-3 px-2 text-center">Ulashish</th>
                <th className="py-3 px-2 text-center">Feed</th>
                <th className="py-3 px-2 text-center">Aloqa</th>
                <th className="py-3 px-2 text-center">Konversiya</th>
                <th className="py-3 px-2 text-center">Tendensiya</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((r) => (
                <tr key={r.productId} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {r.image ? (
                        <img src={r.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 bg-muted" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-muted shrink-0 flex items-center justify-center text-[10px] text-muted-foreground">
                          {r.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{r.name}</p>
                        <p className="text-[10px] text-muted-foreground">{formatPrice(r.price)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center text-xs font-black tabular-nums">{r.views}</td>
                  <td className="py-2.5 px-2 text-center text-xs tabular-nums text-muted-foreground">{r.uniqueViewers}</td>
                  <td className="py-2.5 px-2 text-center text-xs tabular-nums text-muted-foreground">{r.saves}</td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-black tabular-nums text-amber-600 dark:text-amber-400">
                      <ShoppingBag className="w-3 h-3" />
                      {r.prepared}
                    </span>
                    <span className="block text-[9px] text-muted-foreground">{r.preparedUnique} no‘sim</span>
                  </td>
                  <td className="py-2.5 px-2 text-center text-xs tabular-nums text-muted-foreground">{r.shares}</td>
                  <td className="py-2.5 px-2 text-center text-xs tabular-nums text-muted-foreground">{r.feedClicks}</td>
                  <td className="py-2.5 px-2 text-center text-xs tabular-nums text-muted-foreground">{r.intentVisitors}</td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="text-xs font-black tabular-nums">
                      {r.conversion === null ? '—' : `${Math.round(r.conversion * 100)}%`}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <TrendBadge trend={r.trend} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-xs text-muted-foreground">
                    {query ? 'Qidiruv natijasi yo‘q' : `Bu davrda mahsulot ko‘rilsmagan (${data.rangeDate.from} — ${data.rangeDate.to}).`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground px-1">
        Konversiya − mahsulotni ko‘rgan xaridorlardan aloqaga o‘tganlari ulushi. Davr: {tashkentToday()} gacha.
      </p>
    </div>
  );
};

function Header() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500 mb-1">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analitika</span>
        </div>
        <h1 className="text-2xl font-black text-foreground font-display tracking-tighter">Mahsulot tahlili</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Har bir mahsulotning ko‘rish, qiziqish va konversiya ko‘rsatkichlari.
        </p>
      </div>
    </div>
  );
}

function TrendBadge({ trend }: { trend: Trend }) {
  const cfg: Record<Trend, { label: string; icon: React.ReactNode; cls: string }> = {
    improving: {
      label: 'Yaxshilanmoqda',
      icon: <TrendingUp className="w-3 h-3" />,
      cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    stable: {
      label: 'Barqaror',
      icon: <Minus className="w-3 h-3" />,
      cls: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300',
    },
    declining: {
      label: 'Pasaymoqda',
      icon: <TrendingDown className="w-3 h-3" />,
      cls: 'bg-red-500/10 text-red-600 dark:text-red-400',
    },
  };
  const c = cfg[trend];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${c.cls}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

export default ProductPerformancePage;