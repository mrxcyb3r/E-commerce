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
  Bell,
  Download,
  Timer,
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
import { DonutChart } from '../../components/admin/analytics/DonutChart';
import { Heatmap } from '../../components/admin/analytics/Heatmap';
import { RANGE_PRESETS } from '../../lib/analytics/aggregate';
import {
  formatRate,
  resolveName,
  SOURCE_LABELS,
  DEVICE_LABELS,
  REMOVED_ENTITY_LABEL,
  REMOVED_CATEGORY_LABEL,
  REMOVED_VIDEO_LABEL,
} from '../../lib/analytics/metrics';
import type { ProductMetric, CategoryMetric, FeedMetric, InterestLevel } from '../../lib/analytics/aggregate';

const LEVEL_LABEL: Record<InterestLevel, string> = {
  low: 'Past',
  medium: "O'rta",
  high: 'Yuqori',
};

const LEVEL_BADGE: Record<InterestLevel, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
  high: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400',
};

export const AnalyticsAdminPage: React.FC = () => {
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
  // Owner-facing names — raw prod-/feed- IDs must never reach the UI.
  const pName = useMemo(() => {
    const map = new Map(products.map((p) => [p.id, p.name]));
    return (id: string) => resolveName(id, (key) => map.get(key), REMOVED_ENTITY_LABEL);
  }, [products]);
  const cName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    const bySlug = new Map(categories.map((c) => [c.slug, c.name]));
    return (id: string) => resolveName(id, (key) => map.get(key) ?? bySlug.get(key), REMOVED_CATEGORY_LABEL);
  }, [categories]);
  const fName = useMemo(() => {
    const map = new Map(publishedVideos.map((v) => [v.id, v.title]));
    return (id: string) => resolveName(id, (key) => map.get(key), REMOVED_VIDEO_LABEL);
  }, [publishedVideos]);

  const data = useAnalyticsData(
    useMemo(
      () => ({ resolveProduct: pName, resolveCategory: cName }),
      [pName, cName]
    )
  );

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
      <div className="relative rounded-3xl bg-card text-foreground p-6 sm:p-8 overflow-hidden shadow-sm border border-border">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Do'kon tahlili</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Mijozlar harakati tahlili
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Haqiqiy mijozlar harakatlaridan yig'ilgan ma'lumotlar asosida tayyorlangan
              tahlil. Sanoqlar — hodisalar soni, foizlar — noyob tashrifchilar ulushi;
              ma'lumot yetarli bo'lmasa “—” ko'rsatiladi. Vaqtlar Toshkent vaqti bilan.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted border border-border">
              {RANGE_PRESETS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => data.setRange(r.key)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                    !data.isCustomRange && data.range === r.key
                      ? 'bg-foreground text-background shadow'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r.label}
                </button>
              ))}
              <div className="flex items-center gap-1 pl-1">
                <input
                  type="date"
                  value={data.isCustomRange ? data.rangeDate.from : ''}
                  onChange={(e) => {
                    const to = data.isCustomRange ? data.rangeDate.to : e.target.value;
                    if (e.target.value && to) data.setCustomRange(e.target.value, to);
                  }}
                  className={`px-2 py-1.5 rounded-xl bg-transparent text-[11px] font-black outline-none ${data.isCustomRange ? 'bg-foreground text-background' : 'text-muted-foreground'} [color-scheme:dark]`}
                />
                <span className="text-muted-foreground">→</span>
                <input
                  type="date"
                  value={data.isCustomRange ? data.rangeDate.to : ''}
                  onChange={(e) => {
                    const from = data.isCustomRange ? data.rangeDate.from : e.target.value;
                    if (from && e.target.value) data.setCustomRange(from, e.target.value);
                  }}
                  className={`px-2 py-1.5 rounded-xl bg-transparent text-[11px] font-black outline-none ${data.isCustomRange ? 'bg-foreground text-background' : 'text-muted-foreground'} [color-scheme:dark]`}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {data.lastUpdated && (
                <span className="text-[10px] text-muted-foreground">
                  Yangilandi: {new Date(data.lastUpdated).toLocaleTimeString('uz-UZ')}
                </span>
              )}
              <button
                type="button"
                onClick={() => data.refresh()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-foreground text-background font-bold text-xs hover:bg-foreground/90 transition-all shadow-md active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${data.refreshing ? 'animate-spin' : ''}`} />
                <span>Yangilash</span>
              </button>
              <Link
                to="/"
                target="_blank"
                className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium"
              >
                <span>Do'kon</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {data.error && (
        <div className="rounded-2xl border border-warning/50 bg-warning/10 text-warning p-4 text-sm font-medium">
          Analytics jadvalini o'qishda xatolik. ({data.error})
        </div>
      )}

      {data.loading && !hasData && (
        <div className="rounded-3xl border border-border p-14 text-center text-sm text-muted-foreground">
          Ma'lumotlar yuklanmoqda...
        </div>
      )}

      {!data.loading && !hasData && (
        <EmptyState />
      )}

      {hasData && (
        <>
          {/* KPI Cards — counts are in-range EVENT totals; visitor cards are people */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-4">
            <KpiCard label="Noyob tashrifchilar" value={stats.uniqueVisitors} icon={Users} accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" sub={stats.returningVisitors > 0 ? `${stats.returningVisitors} qayta` : undefined} />
            <KpiCard label="Sessiyalar" value={stats.uniqueSessions} icon={Radio} accent="bg-purple-500/10 text-purple-600 dark:text-purple-400" />
            <KpiCard label="Mahsulot ko'rishlar" value={data.eventsByType.product_view ?? 0} icon={Eye} accent="bg-blue-500/10 text-blue-600 dark:text-blue-400" sub="hodisalar" />
            <KpiCard label="Saqlanganlar" value={data.eventsByType.product_save ?? 0} icon={Heart} accent="bg-rose-500/10 text-rose-600 dark:text-rose-400" sub="hodisalar" />
            <KpiCard label="Qidiruvlar" value={search.totalSearches} icon={Search} accent="bg-amber-500/10 text-amber-600 dark:text-amber-400" sub={`${search.uniqueSearchers} kishi`} />
            <KpiCard label="Telegram bosishlari" value={intent.telegram} icon={Send} accent="bg-blue-500/10 text-blue-600 dark:text-blue-400" sub="hodisalar" />
            <KpiCard label="Jami voqealar" value={data.eventsInRange} icon={BarChart3} accent="bg-amber-500/10 text-amber-600 dark:text-amber-400" sub="tanlangan davrda" />
          </div>

          {/* Live visitors strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniStat label="Hozir onlayn" value={data.visitorWindows.liveNow} icon={Activity} live />
            <MiniStat label="Bugun" value={data.visitorWindows.today} icon={Users} />
            <MiniStat label="Shu hafta" value={data.visitorWindows.thisWeek} icon={CalendarDays} />
            <MiniStat label="Shu oy" value={data.visitorWindows.thisMonth} icon={Gauge} />
          </div>

          {/* Visitor insights strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniStat label="Sahifa/sessiya" value={stats.avgPagesPerSession.toFixed(1)} icon={Gauge} hint="Sahifa ochgan sessiyalardagi o'rtacha sahifa soni" />
            <MiniStat label="O'rtacha sessiya" value={formatDuration(stats.avgSessionLengthSec)} icon={Clock} hint="Birinchi va oxirgi harakat orasidagi vaqt" />
            <MiniStat label="Qayta tashriflar" value={percent(stats.returningRate)} icon={TrendingUp} hint="Qayta kelgan tashrifchilar / barcha tashrifchilar" />
            <MiniStat label="Sakrash darajasi" value={percent(data.audience.bounceRate)} icon={Activity} hint="Faqat 1 sahifa ochgan sessiyalar / sahifa ochgan sessiyalar" />
          </div>

          {/* Traffic + funnel + hourly */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SectionCard title="Traffik" icon={CalendarDays} subtitle={`${RANGE_PRESETS.find((r) => r.key === data.range)?.label ?? ''} — kunlik sahifa ochilishlari (hodisalar)`}>
              <SimpleBarChart data={data.traffic} />
            </SectionCard>
            <SectionCard title="Xaridor yo'li" icon={Filter} subtitle="Har bosqichdagi noyob tashrifchilar (mustaqil guruhlar — ketma-ket voronka emas)">
              <FunnelView stages={data.advancedFunnel} />
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

          {/* Audience breakdown — visitor basis, Uzbek labels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Qurilmalar" icon={MonitorSmartphone} subtitle="Noyob tashrifchilar (bitta kishi ikki qurilmada bo'lsa, ikkalasida ham sanaladi)">
              <BreakdownList rows={data.devices} labelMap={DEVICE_LABELS} />
            </SectionCard>
            <SectionCard title="Trafik manbai" icon={Globe} subtitle="Noyob tashrifchilar (manba topilmasa — to‘g‘ridan-to‘g‘ri tashrif)">
              <BreakdownList rows={data.sources} labelMap={SOURCE_LABELS} />
            </SectionCard>
          </div>

          {/* Audience + Time analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AudienceSection data={data} />
            <TimeSection data={data} />
          </div>

          {/* Growth comparison + Business KPIs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GrowthSection data={data} />
            <KpiSection data={data} />
          </div>

          {/* Journeys + Wishlist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <JourneySection data={data} />
            <WishlistSection data={data} pName={pName} />
          </div>

          {/* Alerts + Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AlertsSection data={data} />
            <ReportsSection data={data} />
          </div>

          {/* Insights */}
          <SectionCard title="Avtomatik tahlillar" icon={Lightbulb} accent="text-amber-500" subtitle="Haqiqiy ma'lumotlar asosida yaratilgan xulosalar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {insights.map((ins, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    ins.kind === 'good'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                      : ins.kind === 'warn'
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300'
                      : 'bg-muted dark:bg-muted/50 border-border text-foreground'
                  }`}
                >
                  {ins.kind === 'good' && <Sparkles className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
                  {ins.kind === 'warn' && <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
                  {ins.text}
                </div>
              ))}
              {insights.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6 col-span-1 md:col-span-2">
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

const MiniStat: React.FC<{ label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; live?: boolean; hint?: string }> = ({ label, value, icon: Icon, live, hint }) => (
  <div className="p-3 rounded-2xl bg-card border border-border shadow-xs" title={hint}>
    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
      {live && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      )}
      {!live && <Icon className="w-3.5 h-3.5" />}
      <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
    </div>
    <div className="text-lg font-black text-foreground">{typeof value === 'number' ? value.toLocaleString('uz-UZ') : value}</div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="rounded-3xl border border-dashed border-border p-10 text-center space-y-4">
    <div className="w-16 h-16 mx-auto rounded-3xl bg-muted text-muted-foreground flex items-center justify-center">
      <MousePointerClick className="w-8 h-8" />
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-black text-foreground">Hozircha ma'lumot yo'q</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        Mijozlar do'konga kirganda, bu yerda real tahlil paydo bo'ladi.
      </p>
    </div>
    <Link to="/" target="_blank" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-foreground text-background text-xs font-black">
      <span>Do'kon</span>
      <ArrowUpRight className="w-3.5 h-3.5" />
    </Link>
  </div>
);

const BreakdownList: React.FC<{ rows: { label: string; value: number }[]; labelMap?: Record<string, string> }> = ({ rows, labelMap }) => {
  const total = rows.reduce((s, r) => s + r.value, 0);
  if (total === 0) return <p className="text-xs text-muted-foreground text-center py-6">Ma'lumot yo'q</p>;
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground capitalize">{labelMap?.[r.label] ?? r.label}</span>
            <span className="font-black text-foreground">{r.value} kishi</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
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
  const trending = useMemo(() => ranked.filter((p) => p.isTrending).slice(0, 5), [ranked]);
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
      subtitle="Ko'rish/saqlash/bosish — hodisalar soni; Noyob — kishi soni"
    >
      {top.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">Hali mahsulot ko'rishlari yo'q</p>
      ) : (
        <div className="space-y-3">
          {top.map((p, i) => (
            <ProductRow key={p.id} metric={p} name={pName(p.id)} price={fmtPrice(p.id)} rank={i + 1} />
          ))}
        </div>
      )}
      {trending.length > 0 && (
        <>
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mt-5 mb-2">
            Trenddagi mahsulotlar
          </p>
          <div className="flex flex-wrap gap-2">
            {trending.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                <TrendingUp className="w-3 h-3" />
                {pName(p.id)}
                <span className="text-muted-foreground">{p.views} ko'r</span>
              </span>
            ))}
          </div>
        </>
      )}
      {least.length > 0 && (
        <>
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mt-5 mb-2">
            Kam faollik (e'tibor talab qiladi)
          </p>
          <div className="flex flex-wrap gap-2">
            {least.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted text-[11px] font-bold text-foreground">
                {pName(p.id)}
                <span className="text-blue-600 dark:text-blue-400">{p.views} ko'r</span>
                <span className="text-amber-600 dark:text-amber-400">{formatRate(p.engagementRate)}</span>
              </span>
            ))}
          </div>
        </>
      )}
    </SectionCard>
  );
};

const ProductRow: React.FC<{ metric: ProductMetric; name: string; price: string; rank: number }> = ({ metric: p, name, price, rank }) => (
  <div className="p-3 rounded-2xl bg-muted/50 border border-border">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-5 h-5 rounded-md bg-muted bg-muted text-foreground text-[10px] font-black flex items-center justify-center shrink-0">
          {rank}
        </span>
        <div className="min-w-0">
          <div className="text-xs font-black text-foreground truncate">{name}</div>
          {price && <div className="text-[10px] text-muted-foreground">{price}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {p.isTrending && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black">
            <TrendingUp className="w-3 h-3" />
            Trend
          </span>
        )}
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black ${LEVEL_BADGE[p.interest]}`}>
          Qiziqish: {LEVEL_LABEL[p.interest]}
        </span>
      </div>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2 mt-3 text-center">
      <ProductStat label="Ko'rish" value={p.views} />
      <ProductStat label="Noyob" value={p.uniqueViewers} />
      <ProductStat label="Saqlash" value={p.saves} sub={`${p.uniqueSavers} kishi`} />
      <ProductStat label="O'rt. vaqt" value={formatDuration(p.avgDwellSec)} />
      <ProductStat label="Telegram" value={p.telegramClicks} />
      <ProductStat label="Manzil" value={p.mapClicks} />
      <ProductStat label="Ulashish" value={p.shareClicks} />
      <ProductStat label="Feed→Mah" value={p.feedProductClicks} />
    </div>
    {(p.wishlistRate !== null || p.clickThroughRate !== null) && (
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        {p.wishlistRate !== null && <span>Saqlash ulushi: <span className="font-black text-foreground">{formatRate(p.wishlistRate)}</span> <span className="opacity-70">(saqlaganlar / ko‘rganlar)</span></span>}
        {p.clickThroughRate !== null && <span>Aloqa ulushi: <span className="font-black text-foreground">{formatRate(p.clickThroughRate)}</span> <span className="opacity-70">(bog‘langanlar / ko‘rganlar)</span></span>}
      </div>
    )}
  </div>
);

const ProductStat: React.FC<{ label: string; value: number | string; sub?: string }> = ({ label, value, sub }) => (
  <div className="rounded-lg bg-card border border-border px-1 py-1.5">
    <div className="text-sm font-black text-foreground">{value.toLocaleString('uz-UZ')}</div>
    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{label}</div>
    {sub && <div className="text-[9px] text-muted-foreground">{sub}</div>}
  </div>
);

// ---------------------------------------------------------------------------
// Categories section
// ---------------------------------------------------------------------------

const CategoriesSection: React.FC<{ metrics: CategoryMetric[]; cName: (id: string) => string }> = ({ metrics, cName }) => {
  const sorted = useMemo(() => [...metrics].sort((a, b) => b.views - a.views), [metrics]);
  const max = Math.max(1, ...sorted.map((c) => c.views));
  if (sorted.length === 0) {
    return <SectionCard title="Kategoriyalar" icon={Activity}><p className="text-xs text-muted-foreground text-center py-6">Ma'lumot yo'q</p></SectionCard>;
  }
  return (
    <SectionCard title="Kategoriyalar" icon={Activity} accent="text-purple-500" subtitle="Ko'rish — toifa sahifasi ochilishlari (hodisalar); ochilish — shu toifadagi mahsulot ko'rishlari">
      <div className="space-y-3">
        {sorted.map((c) => (
          <div key={c.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground truncate">{cName(c.id)}</span>
              <span className="font-black text-foreground shrink-0">{c.views} ko'rish · {c.uniqueVisitors} kishi</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500" style={{ width: `${(c.views / max) * 100}%` }} />
            </div>
            <div className="flex gap-3 text-[10px] text-muted-foreground">
              <span>{c.productOpens} ochilish</span>
              <span>{c.favorites} saqlash ({c.uniqueSavers} kishi)</span>
              <span>{c.conversions} bog'lanish</span>
              <span className="ml-auto">Faollik: {formatRate(c.engagementRate)}</span>
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
    <SectionCard title="Videolar" icon={Film} accent="text-teal-500" subtitle="Ko'rishlar — hodisalar; Noyob — videoni ko'rgan kishilar; vaqt — o'lchangan tomosha soniyalari">
      {sorted.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">Feed faolligi yo'q</p>
      ) : (
        <div className="space-y-3">
          {sorted.slice(0, 6).map((f) => (
            <div key={f.id} className="p-3 rounded-2xl bg-muted/50 border border-border">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-foreground truncate">{fName(f.id)}</span>
                <span className="text-xs font-black text-teal-600 dark:text-teal-400 shrink-0">{f.views} ko'rish</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2.5 text-center">
                <ProductStat label="Noyob" value={f.uniqueViewers} />
                <ProductStat label="Mahsulot" value={f.productClicks} />
                <ProductStat label="Telegram" value={f.telegramClicks} />
                <ProductStat label="Ulashish" value={f.shares} />
                <ProductStat label="Ko'rish vaqti" value={formatDuration(f.avgWatchSec)} />
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground">
                Feed → mahsulot o'tishi: <span className="font-black text-foreground">{formatRate(f.feedProductConversion)}</span>
                <span className="opacity-70"> (o‘tganlar / ko‘rganlar)</span>
                {f.comments > 0 && (
                  <> · Izohlar: <span className="font-black text-foreground">{f.comments}</span> <span className="opacity-70">({f.uniqueCommenters} kishi)</span></>
                )}
              </div>
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
  <SectionCard title="Qidiruv tahlili" icon={Search} accent="text-amber-500" subtitle={`${summary.totalSearches} ta qidiruv (${summary.uniqueSearchers} kishi) · natijalilar: ${summary.withResults} · mahsulotga o'tish ${formatRate(summary.searchConversionRate)}`}>
    <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-2">Eng keng tarqalgan</p>
    <div className="flex flex-wrap gap-2 mb-5">
      {summary.topSearches.length === 0 && <p className="text-xs text-muted-foreground py-1">Qidiruvlar yo'q</p>}
      {summary.topSearches.map((s) => (
        <span key={s.query} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted text-xs font-bold text-foreground">
          "{s.query}"
          <span className="inline-flex items-center gap-0.5">
            {s.ledToProductView && <span title="Mahsulot ko'rishga olib bordi"><ShoppingBag className="w-3 h-3 text-emerald-500" /></span>}
            {s.ledToFavorite && <span title="Sevimlilarga olib bordi"><Heart className="w-3 h-3 text-rose-500" /></span>}
            {s.ledToTelegram && <span title="Telegramga olib bordi"><Send className="w-3 h-3 text-blue-500" /></span>}
          </span>
          <span className="text-amber-600 dark:text-amber-400 font-black">{s.count}</span>
        </span>
      ))}
    </div>

    <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-2">Natija bermagan</p>
    <div className="space-y-2">
      {summary.noResultSearches.length === 0 ? (
        <p className="text-xs text-muted-foreground py-1">Natija bermagan qidiruvlar yo'q</p>
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
    <SectionCard title="Aloqa harakatlari" icon={MousePointerClick} accent="text-purple-500" subtitle={`${intent.uniqueIntentVisitors} noyob tashrifchi · kartochkalardagi sonlar — bosishlar (hodisalar)`}>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="p-3 rounded-xl bg-muted dark:bg-muted/50 border border-border">
              <div className={`inline-flex p-2 rounded-lg ${card.color} mb-2`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="text-xl font-black text-foreground">{card.value.toLocaleString('uz-UZ')}</div>
              <p className="text-[11px] font-bold text-muted-foreground">{card.label}</p>
            </div>
          );
        })}
      </div>
      <div className="rounded-xl p-3 bg-gradient-to-r from-muted to-muted dark:from-muted/50 dark:to-muted/30 border border-border text-xs">
        <div className="font-black text-foreground mb-1">Jami aloqa bosishlari</div>
        <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{intent.total.toLocaleString('uz-UZ')}</div>
        <p className="text-[10px] text-muted-foreground mt-1">Telegram + Qo'ng'iroq + Manzil + Aloqa formasi</p>
      </div>
    </SectionCard>
  );
};

// ---------------------------------------------------------------------------
// Advanced sections
// ---------------------------------------------------------------------------

type AnalyticsData = ReturnType<typeof useAnalyticsData>;

const downloadFile = (filename: string, content: string, mime = 'text/csv;charset=utf-8') => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const AudienceSection: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const { audience } = data;
  const rows: { label: string; value: number }[] = [
    ...data.devices.filter((d) => d.label !== 'unknown'),
  ];
  return (
    <SectionCard title="Auditoriya tarkibi" icon={Users} accent="text-indigo-500" subtitle="Noyob tashrifchilar bo'yicha: qurilma, brauzer, tizim, til va rejim">

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">Qurilma</p>
          <DonutChart data={rows} />
        </div>
        <div className="col-span-2 sm:col-span-1 space-y-3">
          <MiniList title="Brauzer" rows={audience.browsers} />
          <MiniList title="Operatsion tizim" rows={audience.oses} />
        </div>
        <div className="col-span-2 grid grid-cols-3 gap-2">
          <MiniBox label="Rejim" rows={audience.darkMode} />
          <MiniBox label="Til (asosiy)" rows={audience.languages.slice(0, 3)} />
          <MiniBox label="Ekran (asosiy)" rows={audience.screens.slice(0, 3)} />
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-3">
          <MiniList title="Kirish sahifasi" rows={audience.entryPages.slice(0, 4)} />
          <MiniList title="Chiqish sahifasi" rows={audience.exitPages.slice(0, 4)} />
        </div>
      </div>
    </SectionCard>
  );
};

const MiniList: React.FC<{ title: string; rows: { label: string; value: number }[] }> = ({ title, rows }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">{title}</p>
    {rows.length === 0 ? (
      <p className="text-xs text-muted-foreground">Ma'lumot yo'q</p>
    ) : (
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-[11px]">
            <span className="text-foreground truncate">{r.label}</span>
            <span className="font-black text-foreground shrink-0">{r.value}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const MiniBox: React.FC<{ label: string; rows: { label: string; value: number }[] }> = ({ label, rows }) => (
  <div className="rounded-xl bg-muted/50 border border-border p-2.5">
    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">{label}</p>
    <div className="space-y-1">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between text-[11px]">
          <span className="text-foreground capitalize truncate">{r.label}</span>
          <span className="font-black text-foreground shrink-0">{r.value}</span>
        </div>
      ))}
      {rows.length === 0 && <p className="text-[11px] text-muted-foreground">—</p>}
    </div>
  </div>
);

const TimeSection: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const { timeAnalytics: ta } = data;
  const activeDayName = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'][ta.activeDay];
  return (
  <SectionCard title="Vaqt tahlili" icon={Timer} accent="text-emerald-500" subtitle="Mijozlar qachon faol (Toshkent vaqti bilan)">

      <div className="grid grid-cols-2 gap-2 mb-3">
        <MiniStat label="Eng faol soat" value={`${ta.activeHour}:00`} icon={Clock} />
        <MiniStat label="Eng faol kun" value={activeDayName} icon={CalendarDays} />
        <MiniStat label="Dam olish (shb/yak)" value={formatRate(ta.totalEvents > 0 ? ta.weekendShare : null)} icon={Gauge} />
        <MiniStat label="Kechki faollik" value={ta.totalEvents > 0 ? formatRate(ta.eveningCount / ta.totalEvents) : '—'} icon={TrendingUp} hint="18:00 dan keyingi hodisalar / barcha hodisalar" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">Hafta va soat xaritasi (Toshkent)</p>
      <Heatmap data={ta.weekdayHourly} />
    </SectionCard>
  );
};

const GrowthSection: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const comps = Object.values(data.comparison);
  return (
    <SectionCard title="O'sish (oldingi davr bilan)" icon={TrendingUp} accent="text-emerald-500" subtitle={`Hozir: ${data.rangeDate.from} → ${data.rangeDate.to} · qiyos: undan oldingi teng davr`}>
      {comps.every((c) => c.current === 0 && c.previous === 0) ? (
        <p className="text-xs text-muted-foreground text-center py-6">Ma'lumot yo'q</p>
      ) : (
        <div className="space-y-2">
          {comps.map((c) => (
            <div key={c.label} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 border border-border text-xs">
              <span className="font-bold text-foreground">{c.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-foreground">{c.current.toLocaleString('uz-UZ')}</span>
                {c.hasPrevious && <span className="text-[10px] text-muted-foreground">avval {c.previous.toLocaleString('uz-UZ')}</span>}
                {c.hasPrevious && c.changePct !== null && <TrendBadge value={c.changePct} />}
                {!c.hasPrevious && c.current > 0 && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">yangi</span>
                )}
                {!c.hasPrevious && c.current === 0 && (
                  <span className="text-[10px] font-black text-muted-foreground">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
};

const KpiSection: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const k = data.kpis;
  const cards = [
    { label: 'Aloqa niyati', hint: 'Bog‘langan noyob tashrifchilar / barcha tashrifchilar', value: formatRate(k.conversionRate) },
    { label: 'Jami voqealar', hint: 'Tanlangan davrdagi barcha hodisalar', value: data.eventsInRange.toLocaleString('uz-UZ') },
    { label: 'Saqlash ulushi', hint: 'Saqlaganlar / mahsulot ko‘rganlar (kishilar)', value: formatRate(k.favoriteRate) },
    { label: 'Mahsulot aloqa ulushi', hint: 'Mahsulot ko‘rib bog‘langanlar / mahsulot ko‘rganlar', value: formatRate(k.productCtr) },
    { label: 'Video o‘tish ulushi', hint: 'Videodan mahsulotga o‘tganlar / video ko‘rganlar', value: formatRate(k.feedCtr) },
    { label: 'Qayta tashriflar', hint: 'Qayta kelganlar / barcha tashrifchilar', value: percent(k.returningRate) },
  ];
  return (
    <SectionCard title="Asosiy ko'rsatkichlar" icon={BarChart3} accent="text-blue-500" subtitle="Foizlar — tashrifchilar ulushi; “—” = ma'lumot yetarli emas">
      <div className="grid grid-cols-2 gap-2 mb-3">
        {cards.map((c) => (
          <div key={c.label} className="p-3 rounded-xl bg-muted dark:bg-muted/50 border border-border" title={c.hint}>
            <div className="text-lg font-black text-blue-600 dark:text-blue-400">{c.value}</div>
            <p className="text-[10px] font-bold text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-2">O'rtacha qiziqish</p>
      <div className="flex items-end gap-2">
        <div className="text-3xl font-black text-foreground">{k.avgInterest.toFixed(1)}</div>
        <span className="text-[10px] text-muted-foreground mb-1">(0 = past, 2 = yuqori)</span>
      </div>
    </SectionCard>
  );
};

const JourneySection: React.FC<{ data: AnalyticsData }> = ({ data }) => (
    <SectionCard title="Mijozlar yo'nalishlari" icon={Filter} accent="text-purple-500" subtitle="Sessiya ichidagi sahifalar ketma-ketligi (takroriy qadamlar birlashtirilgan)">
    {data.journeys.length === 0 ? (
      <p className="text-xs text-muted-foreground text-center py-6">Yo'nalishlar yo'q</p>
    ) : (
      <div className="space-y-2">
        {data.journeys.map((j, i) => (
          <div key={i} className="flex items-center flex-wrap gap-1 p-2.5 rounded-xl bg-muted/50 border border-border text-[11px]">
            {j.path.map((p, pi) => (
              <React.Fragment key={pi}>
                {pi > 0 && <span className="text-muted-foreground">→</span>}
                <span className="px-1.5 py-0.5 rounded-md bg-muted text-foreground font-bold">{pathLabel(p) || '/'}</span>
              </React.Fragment>
            ))}
            <span className="ml-auto text-muted-foreground font-black shrink-0">{j.count} marta</span>
          </div>
        ))}
      </div>
    )}
  </SectionCard>
);

const pathLabel = (p: string): string => {
  if (!p) return '/';
  const path = p.split('?')[0];
  if (path === '/' || path === '') return 'Bosh sahifa';
  const segs = path.split('/').filter(Boolean);
  if (segs[0] === 'products' && segs[1]) return 'Mahsulot';
  if (segs[0] === 'products') return 'Katalog';
  if (segs[0] === 'feed') return 'Feed';
  if (segs[0] === 'about') return 'Biz haqimizda';
  if (segs[0] === 'contact') return 'Aloqa';
  if (segs[0] === 'favorites') return 'Sevimlilar';
  return segs[0] ?? path;
};

const WishlistSection: React.FC<{ data: AnalyticsData; pName: (id: string) => string }> = ({ data, pName }) => {
  const w = data.wishlist;
  return (
    <SectionCard title="Sevimlilar" icon={Heart} accent="text-rose-500" subtitle="Saqlash hodisalari (bosishlar) — hozirgi sevimlilar ro‘yxati emas">
      <div className="grid grid-cols-2 gap-2 mb-3">
        <MiniStat label="Noyob mijozlar" value={w.uniqueSavers} icon={Users} />
        <MiniStat label="Jami saqlashlar" value={w.totalSaves} icon={Heart} />
        <MiniStat label="Takroriy saqlashlar" value={w.repeatedSaves} icon={TrendingUp} hint="Bir kishi bir mahsulotni qayta saqlagan hodisalar" />
        <MiniStat label="O'chirilgan" value={w.removedCount} icon={AlertTriangle} />
      </div>
      <div className="rounded-xl p-3 bg-gradient-to-r from-rose-50 to-muted dark:from-rose-950/20 dark:to-muted/30 border border-rose-100 dark:border-rose-900/40 text-xs mb-3">
        <span className="font-black text-foreground">Saqlash balansi:</span>{' '}
        <span className={w.saveGrowth >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-rose-500 font-black'}>{w.saveGrowth >= 0 ? '+' : ''}{w.saveGrowth}</span>
        <span className="text-muted-foreground"> (saqlashlar − o‘chirishlar)</span>
      </div>
      <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">Eng ko'p saqlangan</p>
      <div className="space-y-1.5">
        {w.mostSaved.length === 0 ? (
          <p className="text-xs text-muted-foreground">Ma'lumot yo'q</p>
        ) : (
          w.mostSaved.slice(0, 5).map((r) => (
            <div key={r.label} className="flex items-center justify-between text-[11px]">
              <span className="text-foreground truncate">{pName(r.label)}</span>
              <span className="font-black text-foreground shrink-0">{r.value}</span>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
};

const AlertsSection: React.FC<{ data: AnalyticsData }> = ({ data }) => (
  <SectionCard title="Ogohlantirishlar" icon={Bell} accent="text-amber-500" subtitle="Ma'lumotlardan aniqlangan holatlar">
    {data.alerts.length === 0 ? (
      <p className="text-xs text-muted-foreground text-center py-6">Hozircha ogohlantirish yo'q</p>
    ) : (
      <div className="space-y-2">
        {data.alerts.map((a, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl border text-xs ${
              a.level === 'alert'
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-900/40 text-rose-800 dark:text-rose-300'
                : a.level === 'warn'
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300'
                : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-900/40 text-blue-800 dark:text-blue-300'
            }`}
          >
            <div className="font-black mb-0.5">{a.title}</div>
            <div className="leading-relaxed opacity-90">{a.detail}</div>
          </div>
        ))}
      </div>
    )}
  </SectionCard>
);

const ReportsSection: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const download = (period: 'daily' | 'weekly' | 'monthly', label: string) => {
    const csv = data.buildReportCsv(period);
    downloadFile(`analytics-${period}-report.csv`, csv);
    void label;
  };
  return (
    <SectionCard title="Hisobotlar" icon={BarChart3} accent="text-emerald-500" subtitle="Har bir tugma o'z davrini yuklaydi (kunlik = oxirgi 1 kun, haftalik = 7 kun, oylik = 30 kun)">
      <div className="grid grid-cols-1 gap-2 mb-3">
        <button type="button" onClick={() => download('daily', "Kunlik")} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted border border-border text-xs font-bold hover:bg-muted/80 transition-colors">
          <span>Kunlik hisobot</span>
          <Download className="w-4 h-4 text-emerald-500" />
        </button>
        <button type="button" onClick={() => download('weekly', 'Haftalik')} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted border border-border text-xs font-bold hover:bg-muted/80 transition-colors">
          <span>Haftalik hisobot</span>
          <Download className="w-4 h-4 text-emerald-500" />
        </button>
        <button type="button" onClick={() => download('monthly', 'Oylik')} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted border border-border text-xs font-bold hover:bg-muted/80 transition-colors">
          <span>Oylik hisobot</span>
          <Download className="w-4 h-4 text-emerald-500" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => downloadFile('analytics-products.csv', data.buildProductCsv())}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-foreground text-background text-xs font-black hover:opacity-90 transition-opacity"
      >
        <Download className="w-4 h-4" />
        Mahsulotlar CSV
      </button>
      <p className="text-[10px] text-muted-foreground mt-2">Mahsulotlar CSV — hozirgi tanlangan davr bo'yicha.</p>
    </SectionCard>
  );
};
