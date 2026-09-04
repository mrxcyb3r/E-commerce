import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  Eye,
  Users,
  Clock,
  Heart,
  MessageCircle,
  ShoppingBag,
  Send,
  Activity,
  Gauge,
  Timer,
  RefreshCw,
  ArrowUpRight,
  Play,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { useVideoFeed } from '../../context/VideoContext';
import { useStore } from '../../context/StoreContext';
import { KpiCard } from '../../components/admin/analytics/KpiCard';
import { SectionCard } from '../../components/admin/analytics/SectionCard';
import { formatDuration, percent } from '../../components/admin/analytics/util';
import type { VideoItem } from '../../types/video';

export const FeedPerformanceAdminPage: React.FC = () => {
  const data = useAnalyticsData();
  const { videos } = useVideoFeed();
  const { products } = useStore();

  const videoOptions = useMemo(() => {
    const active = new Set(data.feed.map((f) => f.id));
    const base: VideoItem[] = [...videos];
    for (const f of data.feed) {
      if (f.id && !base.some((v) => v.id === f.id)) {
        base.push({
          id: f.id,
          title: f.id,
          description: '',
          posterUrl: '',
          category: 'all',
          order: base.length + 1,
          published: true,
          createdAt: new Date().toISOString(),
        });
      }
    }
    return base
      .filter((v) => v.id)
      .sort((a, b) => Number(active.has(b.id)) - Number(active.has(a.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos, data.feed]);

  const [selectedId, setSelectedId] = useState<string>('');

  const resolvedId = selectedId || videoOptions[0]?.id || '';
  const metric = useMemo(
    () => data.feed.find((f) => f.id === resolvedId),
    [data.feed, resolvedId]
  );
  const title = videoOptions.find((v) => v.id === resolvedId)?.title ?? resolvedId;
  const linkedProduct = useMemo(() => {
    const v = videoOptions.find((x) => x.id === resolvedId);
    const productId = v?.productId;
    return products.find((p) => p.id === productId);
  }, [videoOptions, resolvedId, products]);

  const retention = useMemo(() => {
    if (!metric) return [];
    const order = ['start', '3s', '5s', '10s', '25%', '50%', '75%', '100%'];
    const totals = new Map<string, number>();
    for (const r of metric.retentions) totals.set(r.bucket, r.count);
    return order.map((b) => ({
      bucket: b,
      value: totals.get(b) ?? 0,
      rate: metric.videoStarts > 0 ? (totals.get(b) ?? 0) / metric.videoStarts : 0,
    }));
  }, [metric]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-3xl bg-neutral-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-neutral-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-400/20 text-indigo-300 text-xs font-bold">
              <Film className="w-3.5 h-3.5" />
              <span>Feed samaradorlik</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Video samaradorligi
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300">
              Har bir video bo'yicha batafsil real ko'rsatkichlar.
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

      {/* Video selector */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <select
          value={resolvedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white outline-none max-w-md"
        >
          {videoOptions.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title ?? v.id}
            </option>
          ))}
        </select>
        <Link
          to={`/feed?v=${resolvedId}`}
          target="_blank"
          className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 font-bold"
        >
          <span>Feed'da ochish</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {!metric ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center">
          <p className="text-sm text-neutral-500">Ushbu video uchun hali feed ma'lumotlari yo'q.</p>
        </div>
      ) : (
        <>
          {/* Selected video title */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-black text-neutral-900 dark:text-white truncate">{title}</h3>
              {linkedProduct && (
                <p className="text-xs text-neutral-500 mt-1">
                  Bog'langan mahsulot: <span className="font-bold">{linkedProduct.name}</span>
                  {typeof linkedProduct.price === 'number' && ` — ${linkedProduct.price.toLocaleString('uz-UZ')} so'm`}
                </p>
              )}
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            <KpiCard label="Ko'rinishlar" value={metric.views} icon={Eye} accent="bg-teal-500/10 text-teal-600 dark:text-teal-400" />
            <KpiCard label="Noyob tomoshabin" value={metric.uniqueViewers} icon={Users} accent="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
            <KpiCard label="O'rt. tomosha vaqti" value={formatDuration(metric.avgWatchSec)} icon={Clock} accent="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
            <KpiCard label="Video boshlandi" value={metric.videoStarts} icon={Play} accent="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" />
            <KpiCard label="To'liq ko'rildi" value={metric.videoCompletes} icon={CheckCircle2} accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
            <KpiCard label="Faollik darajasi" value={percent(metric.engagementScore)} icon={Activity} accent="bg-rose-500/10 text-rose-600 dark:text-rose-400" />
          </div>

          {/* Engagement + conversion */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            <MiniStat label="Yoqtirishlar" value={metric.likes} icon={Heart} />
            <MiniStat label="Izohlar" value={metric.comments} icon={MessageCircle} />
            <MiniStat label="Mahsulot ochish" value={metric.productClicks} icon={ShoppingBag} />
            <MiniStat label="Telegram" value={metric.telegramClicks} icon={Send} />
            <MiniStat label="Saqlangan" value={metric.favorites} icon={Bookmark} />
            <MiniStat label="Tugallash" value={percent(metric.completionRate)} icon={Gauge} />
          </div>

          {/* Retention + watch */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Retention egri chizig'i" icon={Timer} accent="text-teal-500" subtitle="Boshlashdan to'liq ko'rishgacha">
              <RetentionChart points={retention} />
            </SectionCard>
            <SectionCard title="Umumiy tomosha vaqti" icon={Clock} accent="text-amber-500" subtitle="Jami va o'rtacha tomosha bo'yicha">
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                  <div className="text-3xl font-black text-neutral-900 dark:text-white">{formatDuration(metric.totalWatchSec)}</div>
                  <p className="text-[11px] font-bold text-neutral-400 mt-1">Jami tomosha vaqti</p>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                  <div className="text-3xl font-black text-neutral-900 dark:text-white">{formatDuration(metric.avgWatchSec)}</div>
                  <p className="text-[11px] font-bold text-neutral-400 mt-1">O'rtacha tomosha vaqti</p>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                  <div className="text-3xl font-black text-neutral-900 dark:text-white">{percent(metric.feedProductConversion)}</div>
                  <p className="text-[11px] font-bold text-neutral-400 mt-1">Feed → mahsulot konversiyasi</p>
                </div>
              </div>
            </SectionCard>
          </div>
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
    <div className="text-lg font-black text-neutral-900 dark:text-white">{typeof value === 'number' ? value.toLocaleString('uz-UZ') : value}</div>
  </div>
);

const RetentionChart: React.FC<{ points: { bucket: string; value: number; rate: number }[] }> = ({ points }) => {
  const max = Math.max(1, ...points.map((p) => p.value));
  if (points.every((p) => p.value === 0)) {
    return <p className="text-xs text-neutral-400 text-center py-6">Ushbu video uchun retention ma'lumoti hali yo'q</p>;
  }
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height: 140 }}>
        {points.map((p) => (
          <div key={p.bucket} className="flex-1 flex flex-col items-center gap-1 group">
            <span className="text-[9px] text-neutral-400 font-bold opacity-0 group-hover:opacity-100">{p.value}</span>
            <div
              className="w-full rounded-md bg-gradient-to-t from-indigo-600 to-indigo-400 dark:from-indigo-700 dark:to-indigo-500 group-hover:opacity-80 transition-opacity"
              style={{ height: `${Math.max(3, (p.value / max) * 116)}px` }}
              title={`${p.bucket} — ${p.value} (${Math.round(p.rate * 100)}%)`}
            />
            <span className="text-[9px] font-bold text-neutral-400">{p.bucket}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-neutral-400 mt-2 text-center">
        {percent(resolvedRetentionHighest(points))} mijoz boshlangandan 100% gacha yetib bordi
      </p>
    </div>
  );
};

function resolvedRetentionHighest(points: { bucket: string; value: number }[]): number {
  const full = points.find((p) => p.bucket === '100%');
  return full ? full.value / Math.max(1, (points[0]?.value ?? 1)) : 0;
}