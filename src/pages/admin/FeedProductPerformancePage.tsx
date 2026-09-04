import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  TrendingUp,
  RefreshCw,
  Search,
  ArrowUpRight,
  Eye,
  MousePointerClick,
  Send,
  Bookmark,
} from 'lucide-react';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { useStore } from '../../context/StoreContext';
import { KpiCard } from '../../components/admin/analytics/KpiCard';
import { SectionCard } from '../../components/admin/analytics/SectionCard';
import { percent } from '../../components/admin/analytics/util';

export const FeedProductPerformancePage: React.FC = () => {
  const data = useAnalyticsData();
  const { products } = useStore();
  const [query, setQuery] = useState('');

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const rows = useMemo(() => {
    const feedMetrics = new Map(data.feedProductPerformance.map((p) => [p.productId, p]));
    const productRows = products.map((p) => {
      const fm = feedMetrics.get(p.id);
      return {
        product: p,
        feedClicks: fm?.feedClicks ?? 0,
        favorites: fm?.favorites ?? 0,
        productViews: fm?.productViews ?? 0,
        conversionRate: fm?.conversionRate ?? 0,
        // likes/comments generated on videos linked to this product (from feed metric by resolved product id)
        feedLikes: 0,
        feedComments: 0,
      };
    });
    return productRows.filter((r) => r.feedClicks > 0 || r.favorites > 0 || r.productViews > 0);
  }, [products, data.feedProductPerformance]);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.feedClicks - a.feedClicks || b.productViews - a.productViews),
    [rows]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return sorted;
    const q = query.trim().toLowerCase();
    return sorted.filter((r) => r.product.name.toLowerCase().includes(q));
  }, [sorted, query]);

  const totalClicks = rows.reduce((s, r) => s + r.feedClicks, 0);
  const totalSaves = rows.reduce((s, r) => s + r.favorites, 0);
  const totalViews = rows.reduce((s, r) => s + r.productViews, 0);
  const top = sorted[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-3xl bg-neutral-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-neutral-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Mahsulot samaradorligi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Feed'dagi mahsulot ko'rsatkichlari
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300">
              Qaysi mahsulotlar Feed'da yaxshi ishlayotganini ko'ring — real ma'lumotlardan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => data.refresh()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-100 transition-all shadow-md active:scale-95 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${data.refreshing ? 'animate-spin' : ''}`} />
            <span>Yangilash</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        <KpiCard label="Feed'dan ochishlar" value={totalClicks} icon={MousePointerClick} accent="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
        <KpiCard label="Mahsulot ko'rishga o'tgan" value={totalViews} icon={Eye} accent="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
        <KpiCard label="Feed'dan saqlanganlar" value={totalSaves} icon={Bookmark} accent="bg-rose-500/10 text-rose-600 dark:text-rose-400" />
        <KpiCard label="Eng faol mahsulot" value={top ? top.feedClicks : 0} icon={TrendingUp} accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" sub={top?.product.name} />
      </div>

      {/* Search */}
      <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-400 max-w-sm">
        <Search className="w-4 h-4" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Mahsulot qidirish..."
          className="bg-transparent outline-none text-xs font-semibold text-neutral-900 dark:text-white flex-1"
        />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-neutral-200 dark:text-neutral-700 mx-auto" />
          <p className="text-sm text-neutral-500">Feed'dan mahsulot ochilishlari hali yo'q.</p>
        </div>
      ) : (
        <SectionCard title="Mahsulotlar bo'yicha Feed ko'rsatkichlari" icon={ShoppingBag} accent="text-amber-500" subtitle="Feed ochishlari, saqlashlar va konversiya">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-xs min-w-[560px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-2 py-2 font-bold">Mahsulot</th>
                  <th className="px-2 py-2 font-bold text-right">Narx</th>
                  <th className="px-2 py-2 font-bold text-right">Feed ochish</th>
                  <th className="px-2 py-2 font-bold text-right">Mahsulot ko'rish</th>
                  <th className="px-2 py-2 font-bold text-right">Saqlash</th>
                  <th className="px-2 py-2 font-bold text-right">Konversiya</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.product.id} className="border-b border-neutral-100 dark:border-neutral-800/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={r.product.images?.[0] || ''}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <Link to={`/admin/products/${r.product.id}`} className="text-xs font-black text-neutral-900 dark:text-white truncate max-w-[200px] hover:underline">
                          {r.product.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-right text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                      {typeof r.product.price === 'number' ? `${r.product.price.toLocaleString('uz-UZ')} so'm` : '—'}
                    </td>
                    <td className="px-2 py-2.5 text-right font-black text-amber-600 dark:text-amber-400">{r.feedClicks}</td>
                    <td className="px-2 py-2.5 text-right">{r.productViews}</td>
                    <td className="px-2 py-2.5 text-right text-rose-600 dark:text-rose-400">{r.favorites}</td>
                    <td className="px-2 py-2.5 text-right font-black text-emerald-600 dark:text-emerald-400">{r.feedClicks > 0 ? percent(r.conversionRate) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-xs text-neutral-400 text-center py-6">Mahsulot topilmadi</p>
          )}
        </SectionCard>
      )}

      <div className="text-center">
        <Link to="/products" target="_blank" className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 font-bold">
          <span>Katalog</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};