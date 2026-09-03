import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Users,
  Radio,
  Search,
  Heart,
  Activity,
  Film,
  MessageCircle,
  MapPin,
  Phone,
  Send,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Lightbulb,
  MousePointerClick,
  CalendarDays,
  ShoppingBag,
  Gauge,
  Clock,
  MonitorSmartphone,
  Globe,
  AlertTriangle,
  Filter,
  Sparkles,
} from 'lucide-react';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { useStore } from '../../context/StoreContext';
import { useVideoFeed } from '../../context/VideoContext';
import { KpiCard } from '../../components/admin/analytics/KpiCard';
import { SectionCard } from '../../components/admin/analytics/SectionCard';
import { TrendBadge } from '../../components/admin/analytics/TrendBadge';
import { SimpleBarChart } from '../../components/admin/analytics/SimpleBarChart';
import { FunnelView } from '../../components/admin/analytics/FunnelView';
import { formatDuration, percent } from '../../components/admin/analytics/util';
import { RANGE_PRESETS } from '../../lib/analytics/aggregate';
import type { ProductMetric, CategoryMetric, FeedMetric, InterestLevel } from '../../lib/analytics/aggregate';

const LEVEL_LABEL: Record<InterestLevel, string> = {
  low: 'Past',
  medium: "O'rta",
  high: 'Yuqori',
};

const LEVEL_BADGE: Record<InterestLevel, string> = {
  low: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500',
  medium: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
  high: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400',
};

export const AnalyticsAdminPage: React.FC = () => {
  const data = useAnalyticsData();
  const { products, categories } = useStore();
  const { publishedVideos } = useVideoFeed();

  const productResolver = useMemo(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    return (id: string) => map.get(id);
  }, [products]);
  const categoryResolver = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c]));
    const bySlug = new Map(categories.map((c) => [c.slug, c]));
    return (id: string) => map.get(id) ?? bySlug.get(id);
  }, [categories]);
  const feedResolver = useMemo(() => {
    const map = new Map(publishedVideos.map((v) => [v.id, v]));
    return (id: string) => map.get(id);
  }, [publishedVideos]);

  const pName = (id: string) => productResolver(id)?.name ?? id;
  const cName = (id: string) => categoryResolver(id)?.name ?? id;
  const fName = (id: string) => feedResolver(id)?.title ?? id;

  const totalEvents = data.rows;
  const hasData = totalEvents > 0;

  const stats = data.stats;
  const intent = data.intent;
  const search = data.search;
  const insights = data.insights;

  const formatDateLabel = (iso: string) => {
    const [y, m, d] = iso.split('-');
    return `${d}.${m}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-3xl bg-neutral-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-neutral-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/20 text-blue-300 text-xs font-bold">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Premium Business Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Xaridor xatti-harakati tahlili
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
              Faqat haqiqiy foydalanuvchi harakatlaridan yig'ilgan ma'lumotlar asosida tayyorlangan
              tahlil. Har bir ko'rsatkich real 'analytics_events' ma'lumotlaridan hisoblanadi.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/10 border border-neutral-700/60">
              {RANGE_PRESETS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => data.setRange(r.key)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                    data.range === r.key
                      ? 'bg-white text-neutral-950 shadow'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {data.lastUpdated && (
                <span className="text-[10px] text-neutral-400">
                  Yangilandi: {new Date(data.lastUpdated).toLocaleTimeString('uz-UZ')}
                </span>
              )}
              <button
                type="button"
                onClick={() => data.refresh()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-100 transition-all shadow-md active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${data.refreshing ? 'animate-spin' : ''}`} />
                <span>Yangilash</span>
              </button>
              <Link
                to="/"
                target="_blank"
                className="text-[11px] text-neutral-400 hover:text-white inline-flex items-center gap-1 font-medium"
              >
                <span>Vitrina</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {data.error && (
        <div className="rounded-2xl border border-amber-300/50 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-4 text-sm font-medium">
          Analytics jadvalini o'qishda xatolik. ({data.error})
        </div>
      )}

      {data.loading && !hasData && (
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 p-14 text-center text-sm text-neutral-400">
          Ma'lumotlar yuklanmoqda...
        </div>
      )}

      {!data.loading && !hasData && (
        <EmptyState />
      )}

      {hasData && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-4">
            <KpiCard label="Noyob tashrifchilar" value={stats.uniqueVisitors} icon={Users} accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" sub={stats.returningVisitors > 0 ? `${stats.returningVisitors} qayta` : undefined} />
            <KpiCard label="Sessiyalar" value={stats.uniqueSessions} icon={Radio} accent="bg-purple-500/10 text-purple-600 dark:text-purple-400" />
            <KpiCard label="Mahsulot ko'rishlar" value={data.eventsByType.product_view ?? 0} icon={Eye} accent="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
            <KpiCard label="Saqlanganlar" value={data.eventsByType.product_save ?? 0} icon={Heart} accent="bg-rose-500/10 text-rose-600 dark:text-rose-400" />
            <KpiCard label="Qidiruvlar" value={search.totalSearches} icon={Search} accent="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
            <KpiCard label="Telegram" value={intent.telegram} icon={Send} accent="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
            <KpiCard label="Manzil ko'rish" value={intent.directions} icon={MapPin} accent="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Visitor insights strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniStat label="Sahifa/sessiya" value={stats.avgPagesPerSession.toFixed(1)} icon={Gauge} />
            <MiniStat label="O'rtacha sessiya" value={formatDuration(stats.avgSessionLengthSec)} icon={Clock} />
            <MiniStat label="Qaytish darajasi" value={percent(stats.returningRate)} icon={TrendingUp} />
            <MiniStat label="Voqealar" value={totalEvents} icon={Activity} />
          </div>

          {/* Traffic + funnel + hourly */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SectionCard title="Traffik" icon={CalendarDays} subtitle={`${RANGE_PRESETS.find((r) => r.key === data.range)?.label ?? ''} — kunlik sahifa ochilishlari`} action={data.traffic.length > 1 ? <TrendCompare traffic={data.traffic} /> : undefined}>
              <SimpleBarChart data={data.traffic} />
            </SectionCard>
            <SectionCard title="Xaridor yo'li (funnel)" icon={Filter} subtitle="Faoliyat chuqurligi bo'yicha noyob foydalanuvchilar">
              <FunnelView stages={data.funnel} />
            </SectionCard>
          </div>

          {/* Products */}
          <ProductsSection
            metrics={data.products}
            pName={pName}
            productResolver={productResolver}
          />

          {/* Categories + Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoriesSection metrics={data.categories} cName={cName} />
            <FeedSection metrics={data.feed} fName={fName} />
          </div>

          {/* Search + Intent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SearchSection summary={search} />
            <IntentSection intent={intent} />
          </div>

          {/* Audience breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Qurilmalar" icon={MonitorSmartphone}>
              <BreakdownList rows={data.devices} />
            </SectionCard>
            <SectionCard title="Trafik manbai" icon={Globe}>
              <BreakdownList rows={data.sources} />
            </SectionCard>
          </div>

          {/* Insights */}
          <SectionCard title="Avtomatik tahlillar" icon={Lightbulb} accent="text-amber-500" subtitle="Faqat real ma'lumotlar asosida avtomatik yaratilgan xulosalar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {insights.map((ins, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    ins.kind === 'good'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                      : ins.kind === 'warn'
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300'
                      : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-100 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200'
                  }`}
                >
                  {ins.kind === 'good' && <Sparkles className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
                  {ins.kind === 'warn' && <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
                  {ins.text}
                </div>
              ))}
              {insights.length === 0 && (
                <p className="text-xs text-neutral-400 text-center py-6 col-span-1 md:col-span-2">
                  Tahlil yaratish uchun yetarli ma'lumot to'planmagan.
                </p>
              )}
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
};

const MiniStat: React.FC<{ label: string; value: number | string; icon: React.ComponentType<{ className?: string }> }> = ({ label, value, icon: Icon }) => (
  <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
    <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
    </div>
    <div className="text-lg font-black text-neutral-900 dark:text-white">{value}</div>
  </div>
);

const TrendCompare: React.FC<{ traffic: { views: number }[] }> = ({ traffic }) => {
  if (traffic.length < 2) return null;
  const window1 = traffic.slice(0, Math.floor(traffic.length / 2));
  const window2 = traffic.slice(Math.floor(traffic.length / 2));
  const sum = (arr: { views: number }[]) => arr.reduce((s, x) => s + x.views, 0);
  const a = sum(window1);
  const b = sum(window2);
  if (a === 0) return null;
  const change = ((b - a) / a) * 100;
  return <TrendBadge value={change} />;
};

const EmptyState: React.FC = () => (
  <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center space-y-4">
    <div className="w-16 h-16 mx-auto rounded-3xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center">
      <MousePointerClick className="w-8 h-8" />
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-black text-neutral-900 dark:text-white">Hozircha ma'lumot yo'q</h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
        Vitrinda foydalanuvchi harakatlari qayd etilishi bilan bu yerda real tahlil paydo bo'ladi.
      </p>
    </div>
    <Link to="/" target="_blank" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-black">
      <span>Vitrina</span>
      <ArrowUpRight className="w-3.5 h-3.5" />
    </Link>
  </div>
);

const BreakdownList: React.FC<{ rows: { label: string; value: number }[] }> = ({ rows }) => {
  const total = rows.reduce((s, r) => s + r.value, 0);
  if (total === 0) return <p className="text-xs text-neutral-400 text-center py-6">Ma'lumot yo'q</p>;
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 capitalize">{r.label}</span>
            <span className="font-black text-neutral-900 dark:text-white">{r.value}</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(r.value / total) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Products section
// ---------------------------------------------------------------------------

const ProductsSection: React.FC<{
  metrics: ProductMetric[];
  pName: (id: string) => string;
  productResolver: (id: string) => { name: string; price?: number } | undefined;
}> = ({ metrics, pName, productResolver }) => {
  const ranked = useMemo(() => [...metrics].sort((a, b) => b.views - a.views), [metrics]);
  const least = useMemo(
    () => ranked.filter((p) => p.views > 0).sort((a, b) => a.engagementRate - b.engagementRate || a.views - b.views).slice(0, 5),
    [ranked]
  );
  const top = ranked.slice(0, 6);

  const fmtPrice = (id: string) => {
    const p = productResolver(id);
    return p && typeof p.price === 'number' ? `${p.price.toLocaleString('uz-UZ')} so'm` : '';
  };

  return (
    <SectionCard
      title="Mahsulot tahlili"
      icon={ShoppingBag}
      accent="text-amber-500"
      subtitle="Har bir mahsulot bo'yicha noyob foydalanuvchi va ishtirok ko'rsatkichlari"
    >
      {top.length === 0 ? (
        <p className="text-xs text-neutral-400 text-center py-6">Hali mahsulot ko'rishlari yo'q</p>
      ) : (
        <div className="space-y-3">
          {top.map((p, i) => (
            <ProductRow key={p.id} metric={p} name={pName(p.id)} price={fmtPrice(p.id)} rank={i + 1} />
          ))}
        </div>
      )}
      {least.length > 0 && (
        <>
          <p className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mt-5 mb-2">
            Kam ishtirok (e'tibor talab qiladi)
          </p>
          <div className="flex flex-wrap gap-2">
            {least.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                {pName(p.id)}
                <span className="text-blue-600 dark:text-blue-400">{p.views} ko'r</span>
                <span className="text-amber-600 dark:text-amber-400">{Math.round(p.engagementRate * 100)}%</span>
              </span>
            ))}
          </div>
        </>
      )}
    </SectionCard>
  );
};

const ProductRow: React.FC<{ metric: ProductMetric; name: string; price: string; rank: number }> = ({ metric: p, name, price, rank }) => (
  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-5 h-5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-[10px] font-black flex items-center justify-center shrink-0">
          {rank}
        </span>
        <div className="min-w-0">
          <div className="text-xs font-black text-neutral-900 dark:text-white truncate">{name}</div>
          {price && <div className="text-[10px] text-neutral-400">{price}</div>}
        </div>
      </div>
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${LEVEL_BADGE[p.interest]}`}>
        Qiziqish: {LEVEL_LABEL[p.interest]}
      </span>
    </div>
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3 text-center">
      <ProductStat label="Ko'rish" value={p.views} />
      <ProductStat label="Noyob" value={p.uniqueViewers} />
      <ProductStat label="Saqlash" value={p.saves} sub={`${p.uniqueSavers} kishi`} />
      <ProductStat label="Telegram" value={p.telegramClicks} />
      <ProductStat label="Manzil" value={p.mapClicks} />
      <ProductStat label="Feed→Mahsulot" value={p.feedProductClicks} />
    </div>
  </div>
);

const ProductStat: React.FC<{ label: string; value: number | string; sub?: string }> = ({ label, value, sub }) => (
  <div className="rounded-lg bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-1 py-1.5">
    <div className="text-sm font-black text-neutral-900 dark:text-white">{value.toLocaleString('uz-UZ')}</div>
    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">{label}</div>
    {sub && <div className="text-[9px] text-neutral-400">{sub}</div>}
  </div>
);

// ---------------------------------------------------------------------------
// Categories section
// ---------------------------------------------------------------------------

const CategoriesSection: React.FC<{ metrics: CategoryMetric[]; cName: (id: string) => string }> = ({ metrics, cName }) => {
  const sorted = useMemo(() => [...metrics].sort((a, b) => b.views - a.views), [metrics]);
  const max = Math.max(1, ...sorted.map((c) => c.views));
  if (sorted.length === 0) {
    return <SectionCard title="Kategoriyalar" icon={Activity}><p className="text-xs text-neutral-400 text-center py-6">Ma'lumot yo'q</p></SectionCard>;
  }
  return (
    <SectionCard title="Kategoriyalar" icon={Activity} accent="text-purple-500" subtitle="Toifa faolligi va aylanish">
      <div className="space-y-3">
        {sorted.map((c) => (
          <div key={c.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-700 dark:text-neutral-300 truncate">{cName(c.id)}</span>
              <span className="font-black text-neutral-900 dark:text-white shrink-0">{c.views} ko'rish</span>
            </div>
            <div className="h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500" style={{ width: `${(c.views / max) * 100}%` }} />
            </div>
            <div className="flex gap-3 text-[10px] text-neutral-400">
              <span>{c.productOpens} ochilish</span>
              <span>{c.favorites} saqlash</span>
              <span>{c.conversions} bog'lanish</span>
              <span className="ml-auto">{Math.round(c.engagementRate * 100)}% ishtirok</span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
};

// ---------------------------------------------------------------------------
// Feed section
// ---------------------------------------------------------------------------

const FeedSection: React.FC<{ metrics: FeedMetric[]; fName: (id: string) => string }> = ({ metrics, fName }) => {
  const sorted = useMemo(() => [...metrics].sort((a, b) => b.views - a.views), [metrics]);
  return (
    <SectionCard title="Video / Feed" icon={Film} accent="text-teal-500" subtitle="Post ko'rishlari va konversiya">
      {sorted.length === 0 ? (
        <p className="text-xs text-neutral-400 text-center py-6">Feed faolligi yo'q</p>
      ) : (
        <div className="space-y-3">
          {sorted.slice(0, 6).map((f) => (
            <div key={f.id} className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-neutral-900 dark:text-white truncate">{fName(f.id)}</span>
                <span className="text-xs font-black text-teal-600 dark:text-teal-400 shrink-0">{f.views} ko'rish</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2.5 text-center">
                <ProductStat label="Noyob" value={f.uniqueViewers} />
                <ProductStat label="Mahsulot" value={f.productClicks} />
                <ProductStat label="Telegram" value={f.telegramClicks} />
                <ProductStat label="Ulashish" value={f.shares} />
                <ProductStat label="Ko'rish vaqti" value={formatDuration(f.avgWatchSec)} />
              </div>
              {f.views > 0 && (
                <div className="mt-2 text-[10px] text-neutral-400">
                  Feed → mahsulot konversiyasi: <span className="font-black text-neutral-700 dark:text-neutral-200">{percent(f.feedProductConversion)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
};

// ---------------------------------------------------------------------------
// Search section
// ---------------------------------------------------------------------------

const SearchSection: React.FC<{ summary: ReturnType<typeof useAnalyticsData>['search'] }> = ({ summary }) => (
  <SectionCard title="Qidiruv tahlili" icon={Search} accent="text-amber-500" subtitle={`${summary.totalSearches} ta qidiruv, konversiya ${percent(summary.searchConversionRate)}`}>
    <p className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-2">Eng keng tarqalgan</p>
    <div className="flex flex-wrap gap-2 mb-5">
      {summary.topSearches.length === 0 && <p className="text-xs text-neutral-400 py-1">Qidiruvlar yo'q</p>}
      {summary.topSearches.map((s) => (
        <span key={s.query} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200">
          "{s.query}"
          {s.ledToProductView && <span title="Mahsulot ko'rishga olib bordi"><ShoppingBag className="w-3 h-3 text-emerald-500" /></span>}
          <span className="text-amber-600 dark:text-amber-400 font-black">{s.count}</span>
        </span>
      ))}
    </div>

    <p className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-2">Natija bermagan</p>
    <div className="space-y-2">
      {summary.noResultSearches.length === 0 ? (
        <p className="text-xs text-neutral-400 py-1">Natija bermagan qidiruvlar yo'q</p>
      ) : (
        summary.noResultSearches.slice(0, 5).map((s) => (
          <div key={s.query} className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs">
            <span className="font-bold text-amber-800 dark:text-amber-300 truncate">"{s.query}"</span>
            <span className="font-black text-amber-700 dark:text-amber-400 ml-2 shrink-0">{s.noResultCount} marta</span>
          </div>
        ))
      )}
    </div>
  </SectionCard>
);

// ---------------------------------------------------------------------------
// Intent section
// ---------------------------------------------------------------------------

const IntentSection: React.FC<{ intent: ReturnType<typeof useAnalyticsData>['intent'] }> = ({ intent }) => {
  const cards = [
    { label: 'Telegram', value: intent.telegram, icon: Send, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Qo\'ng\'iroq', value: intent.phone, icon: Phone, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Manzil', value: intent.directions, icon: MapPin, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Aloqa', value: intent.contact, icon: MessageCircle, color: 'text-purple-500 bg-purple-500/10' },
  ];
  return (
    <SectionCard title="Sotib olish niyati" icon={MousePointerClick} accent="text-purple-500" subtitle={`${intent.uniqueIntentVisitors} noyob foydalanuvchi yuqori niyat bildirgan`}>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
              <div className={`inline-flex p-2 rounded-lg ${card.color} mb-2`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="text-xl font-black text-neutral-900 dark:text-white">{card.value.toLocaleString('uz-UZ')}</div>
              <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">{card.label}</p>
            </div>
          );
        })}
      </div>
      <div className="rounded-xl p-3 bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800/50 dark:to-neutral-800/30 border border-neutral-100 dark:border-neutral-800 text-xs">
        <div className="font-black text-neutral-900 dark:text-white mb-1">Jami yuqori niyat harakatlari</div>
        <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{intent.total.toLocaleString('uz-UZ')}</div>
        <p className="text-[10px] text-neutral-400 mt-1">Telegram + Qo'ng'iroq + Manzil + Aloqa</p>
      </div>
    </SectionCard>
  );
};
