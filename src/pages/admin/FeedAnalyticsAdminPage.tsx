import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  Eye,
  Users,
  Play,
  CheckCircle2,
  Clock,
  Gauge,
  Activity,
  Heart,
  MessageCircle,
  Share2,
  ShoppingBag,
  Send,
  Bookmark,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  Filter,
  ArrowUpRight,
  Timer,
} from 'lucide-react';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { useVideoFeed } from '../../context/VideoContext';
import { KpiCard } from '../../components/admin/analytics/KpiCard';
import { SectionCard } from '../../components/admin/analytics/SectionCard';
import { RANGE_PRESETS } from '../../lib/analytics/aggregate';
import { formatDuration, percent } from '../../components/admin/analytics/util';
import type { FeedMetric } from '../../lib/analytics/aggregate';

export const FeedAnalyticsAdminPage: React.FC = () => {
  const data = useAnalyticsData();
  const { videos } = useVideoFeed();

  const feedName = useMemo(() => {
    const map = new Map(videos.map((v) => [v.id, v.title]));
    return (id: string) => map.get(id) ?? id;
  }, [videos]);

  const o = data.feedOverview;
  const hasData = o.impressions > 0 || o.videoStarts > 0 || data.feed.length > 0;

  const topVideos = useMemo(
    () => [...data.feed].sort((a, b) => b.views - a.views).slice(0, 6),
    [data.feed]
  );
  const lowestVideos = useMemo(
    () =>
      [...data.feed]
        .filter((f) => f.views > 0)
        .sort((a, b) => a.engagementScore - b.engagementScore || a.views - b.views)
        .slice(0, 5),
    [data.feed]
  );

  const retentionPoints = useMemo(() => {
    const order = ['start', '3s', '5s', '10s', '25%', '50%', '75%', '100%'];
    const totals = new Map<string, number>();
    let starts = 0;
    for (const f of data.feed) {
      starts += f.videoStarts;
      for (const r of f.retentions) {
        totals.set(r.bucket, (totals.get(r.bucket) ?? 0) + r.count);
      }
    }
    return order.map((b) => ({
      bucket: b,
      value: totals.get(b) ?? 0,
      rate: starts > 0 ? (totals.get(b) ?? 0) / starts : 0,
    }));
  }, [data.feed]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-3xl bg-card text-foreground p-6 sm:p-8 overflow-hidden shadow-sm border border-border">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold">
              <Film className="w-3.5 h-3.5" />
              <span>Feed tahlili</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Videolar tahlili
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Feed ko'rinishlari, video boshqalari, tomosha vaqti, ushlab turish va konversiyalar —
              barchasi real 'analytics_events' ma'lumotlaridan hisoblanadi.
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
            </div>
          </div>
        </div>
      </div>

      {data.error && (
        <div className="rounded-2xl border border-warning/50 bg-warning/10 text-warning p-4 text-sm font-medium">
          Ma'lumotlarni yuklashda xatolik. ({data.error})
        </div>
      )}

      {!hasData ? (
        <FeedEmptyState />
      ) : (
        <>
          {/* Overview KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-4">
            <KpiCard label="Feed ko'rinishlari" value={o.impressions} icon={Eye} accent="bg-teal-500/10 text-teal-600 dark:text-teal-400" />
            <KpiCard label="Noyob tomoshabin" value={o.uniqueViewers} icon={Users} accent="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
            <KpiCard label="Video boshlandi" value={o.videoStarts} icon={Play} accent="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" />
            <KpiCard label="To'liq ko'rildi" value={o.videoCompletes} icon={CheckCircle2} accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
            <KpiCard label="O'rt. tomosha vaqti" value={formatDuration(o.averageWatchSec)} icon={Clock} accent="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
            <KpiCard label="Tugallash darajasi" value={percent(o.completionRate)} icon={Gauge} accent="bg-purple-500/10 text-purple-600 dark:text-purple-400" />
            <KpiCard label="Faollik darajasi" value={percent(o.engagementRate)} icon={Activity} accent="bg-rose-500/10 text-rose-600 dark:text-rose-400" />
          </div>

          {/* Engagement strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            <MiniStat label="Yoqtirishlar" value={o.likes} icon={Heart} />
            <MiniStat label="Izohlar" value={o.comments} icon={MessageCircle} />
            <MiniStat label="Ulashishlar" value={o.shares} icon={Share2} />
            <MiniStat label="Mahsulot ochish" value={o.productClicks} icon={ShoppingBag} />
            <MiniStat label="Telegram" value={o.telegramClicks} icon={Send} />
            <MiniStat label="Saqlangan" value={o.favorites} icon={Bookmark} />
          </div>

          {/* Funnel + Retention */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Feed konversiya voronkasi" icon={Filter} accent="text-blue-500" subtitle="Ko'rinishdan Telegramgacha bo'lgan yo'l">
              <FeedFunnel stages={data.feedFunnel} />
            </SectionCard>
            <SectionCard title="Uslublangan vaqt (retention)" icon={Timer} accent="text-teal-500" subtitle="Video boshqasiga nisbatan mijozlar qancha qismini ko'radi">
              <RetentionChart points={retentionPoints} />
            </SectionCard>
          </div>

          {/* Activity trend */}
          <SectionCard title="Faollik dinamikasi" icon={BarChart3} accent="text-teal-500" subtitle="Kunlik ko'rinish, video boshlash va faollik">
            <FeedTrendChart points={data.feedActivityTrend} />
          </SectionCard>

          {/* Top + Lowest videos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Eng yaxshi videolar" icon={TrendingUp} accent="text-emerald-500" subtitle="Eng ko'p ko'rilgan 6 ta video">
              <VideoRanking metrics={topVideos} name={feedName} best />
            </SectionCard>
            <SectionCard title="Eng past natijali videolar" icon={TrendingDown} accent="text-rose-500" subtitle="Faollik past, e'tibor talab qiladi">
              <VideoRanking metrics={lowestVideos} name={feedName} />
            </SectionCard>
          </div>

          {/* All videos detail table */}
          <SectionCard title="Barcha videolar bo'yicha ko'rsatkichlar" icon={Film} accent="text-indigo-500" subtitle="Har bir video uchun real ko'rsatkichlar">
            <AllVideosTable metrics={data.feed} name={feedName} />
          </SectionCard>
        </>
      )}
    </div>
  );
};

const FeedEmptyState: React.FC = () => (
  <div className="rounded-3xl border border-dashed border-border p-10 text-center space-y-4">
    <div className="w-16 h-16 mx-auto rounded-3xl bg-muted text-muted-foreground flex items-center justify-center">
      <Film className="w-8 h-8" />
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-black text-foreground">Hozircha feed ma'lumoti yo'q</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        Mijozlar videolarni ko'rishni boshlaganda bu yerda real tahlil paydo bo'ladi.
      </p>
    </div>
    <Link to="/feed" target="_blank" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-foreground text-background text-xs font-black">
      <span>Feed</span>
      <ArrowUpRight className="w-3.5 h-3.5" />
    </Link>
  </div>
);

const MiniStat: React.FC<{ label: string; value: number | string; icon: React.ComponentType<{ className?: string }> }> = ({ label, value, icon: Icon }) => (
  <div className="p-3 rounded-2xl bg-card border border-border shadow-xs">
    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
    </div>
    <div className="text-lg font-black text-foreground">{typeof value === 'number' ? value.toLocaleString('uz-UZ') : value}</div>
  </div>
);

const FeedFunnel: React.FC<{ stages: { label: string; value: number; rate: number }[] }> = ({ stages }) => {
  if (stages.every((s) => s.value === 0)) {
    return <p className="text-xs text-muted-foreground text-center py-6">Konversiya ma'lumoti yo'q</p>;
  }
  const first = stages[0].value || 1;
  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const width = Math.max(8, (stage.value / first) * 100);
        const overallDrop = i > 0 ? Math.round(((first - stage.value) / first) * 100) : 0;
        return (
          <div key={stage.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">{stage.label}</span>
              <div className="flex items-center gap-2">
                {i > 0 && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">
                    {stage.rate > 0 ? Math.round(stage.rate * 100) : 0}% o'tdi
                  </span>
                )}
                <span className="font-black text-foreground">{stage.value}</span>
                {overallDrop > 0 && (
                  <span className="text-[10px] text-muted-foreground">umumiy −{overallDrop}%</span>
                )}
              </div>
            </div>
            <div className="h-7 rounded-lg bg-muted overflow-hidden" style={{ width: `${width}%` }}>
              <div className="h-full w-full bg-gradient-to-r from-teal-600 to-indigo-500 dark:from-teal-700 dark:to-indigo-600 rounded-lg" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RetentionChart: React.FC<{ points: { bucket: string; value: number; rate: number }[] }> = ({ points }) => {
  const max = Math.max(1, ...points.map((p) => p.value));
  if (points.every((p) => p.value === 0)) {
    return <p className="text-xs text-muted-foreground text-center py-6">Retention ma'lumoti hali to'planmagan</p>;
  }
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height: 130 }}>
        {points.map((p) => (
          <div key={p.bucket} className="flex-1 flex flex-col items-center gap-1 group">
            <span className="text-[9px] text-muted-foreground font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {p.value}
            </span>
            <div
              className="w-full rounded-md bg-gradient-to-t from-teal-600 to-teal-400 dark:from-teal-700 dark:to-teal-500 group-hover:opacity-80 transition-opacity"
              style={{ height: `${Math.max(3, (p.value / max) * 106)}px` }}
              title={`${p.bucket} — ${p.value} marta (${Math.round(p.rate * 100)}%)`}
            />
            <span className="text-[9px] font-bold text-muted-foreground">{p.bucket}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 text-center">
        Video boshqasiga nisbatan har bir bosqichda nechta mijoz qolgan
      </p>
    </div>
  );
};

const FeedTrendChart: React.FC<{ points: { date: string; impressions: number; starts: number; likes: number }[] }> = ({ points }) => {
  const max = Math.max(1, ...points.map((p) => p.impressions));
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height: 160 }}>
        {points.map((p) => (
          <div key={p.date} className="flex-1 flex flex-col items-center gap-1 group" title={`${p.date} — ${p.impressions} ko'rinish, ${p.starts} boshlash, ${p.likes} yoqtirish`}>
            <span className="text-[9px] text-muted-foreground font-bold opacity-0 group-hover:opacity-100 transition-opacity">{p.impressions}</span>
            <div
              className="w-full rounded-md bg-gradient-to-t from-teal-600 to-blue-400 dark:from-teal-700 dark:to-blue-500 group-hover:opacity-80 transition-opacity"
              style={{ height: `${Math.max(3, (p.impressions / max) * (160 - 24))}px` }}
            />
            <span className="text-[8px] font-bold text-muted-foreground">{p.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const VideoRanking: React.FC<{ metrics: FeedMetric[]; name: (id: string) => string; best?: boolean }> = ({ metrics, name, best }) => {
  if (metrics.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-6">Ma'lumot yo'q</p>;
  }
  return (
    <div className="space-y-2">
      {metrics.map((f, i) => (
        <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted border border-border">
          <span className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 ${best ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'}`}>
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black text-foreground truncate">{name(f.id)}</div>
            <div className="text-[10px] text-muted-foreground">
              {f.views} ko'rinish · {f.videoStarts} boshlash · {f.likes} yoqtirish · {Math.round(f.engagementScore * 100)}% faollik
            </div>
          </div>
          <span className="text-xs font-black text-foreground shrink-0">{f.views}</span>
        </div>
      ))}
    </div>
  );
};

const AllVideosTable: React.FC<{ metrics: FeedMetric[]; name: (id: string) => string }> = ({ metrics, name }) => {
  const sorted = [...metrics].sort((a, b) => b.views - a.views);
  if (sorted.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-6">Feed ma'lumoti yo'q</p>;
  }
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-xs min-w-[640px]">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <th className="px-2 py-2 font-bold">Video</th>
            <th className="px-2 py-2 font-bold text-right">Ko'rinish</th>
            <th className="px-2 py-2 font-bold text-right">Noyob</th>
            <th className="px-2 py-2 font-bold text-right">Boshlash</th>
            <th className="px-2 py-2 font-bold text-right">To'liq</th>
            <th className="px-2 py-2 font-bold text-right">O'rt. vaqt</th>
            <th className="px-2 py-2 font-bold text-right">Yoqtirish</th>
            <th className="px-2 py-2 font-bold text-right">Izoh</th>
            <th className="px-2 py-2 font-bold text-right">Boglanish</th>
            <th className="px-2 py-2 font-bold text-right">Tel.</th>
            <th className="px-2 py-2 font-bold text-right">Saqlash</th>
            <th className="px-2 py-2 font-bold text-right">Faollik</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((f) => (
            <tr key={f.id} className="border-b border-border hover:bg-muted/30 transition-colors">
              <td className="px-2 py-2.5 font-black text-foreground truncate max-w-[180px]">{name(f.id)}</td>
              <td className="px-2 py-2.5 text-right font-black">{f.views}</td>
              <td className="px-2 py-2.5 text-right text-muted-foreground">{f.uniqueViewers}</td>
              <td className="px-2 py-2.5 text-right">{f.videoStarts}</td>
              <td className="px-2 py-2.5 text-right">{f.videoCompletes}</td>
              <td className="px-2 py-2.5 text-right text-muted-foreground">{formatDuration(f.avgWatchSec)}</td>
              <td className="px-2 py-2.5 text-right">{f.likes}</td>
              <td className="px-2 py-2.5 text-right">{f.comments}</td>
              <td className="px-2 py-2.5 text-right text-blue-600 dark:text-blue-400">{f.productClicks}</td>
              <td className="px-2 py-2.5 text-right text-sky-600 dark:text-sky-400">{f.telegramClicks}</td>
              <td className="px-2 py-2.5 text-right text-amber-600 dark:text-amber-400">{f.favorites}</td>
              <td className="px-2 py-2.5 text-right font-black text-teal-600 dark:text-teal-400">{Math.round(f.engagementScore * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};