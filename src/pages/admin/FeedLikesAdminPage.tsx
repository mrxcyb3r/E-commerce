import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Users,
  Search,
  Film,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import type { FeedLike } from '../../types/supabase-db';
import { useVideoFeed } from '../../context/VideoContext';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { KpiCard } from '../../components/admin/analytics/KpiCard';
import { SectionCard } from '../../components/admin/analytics/SectionCard';

interface FeedLikeRow extends FeedLike {
  feed_title?: string;
}

export const FeedLikesAdminPage: React.FC = () => {
  const [likes, setLikes] = useState<FeedLikeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [feedFilter, setFeedFilter] = useState<string>('all');
  const { videos, loading: feedLoading } = useVideoFeed();
  const data = useAnalyticsData();

  const fetchLikes = useCallback(async () => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from('feed_likes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(2000);
    if (!error && rows) {
      const titleMap = new Map(videos.map((v) => [v.id, v.title]));
      setLikes(rows.map((c) => ({ ...c, feed_title: titleMap.get(c.feed_id) ?? c.feed_id })));
    }
    setLoading(false);
  }, [videos]);

  useEffect(() => {
    if (!feedLoading) fetchLikes();
  }, [fetchLikes, feedLoading]);

  const perVideo = useMemo(() => {
    const map = new Map<string, { feed_id: string; count: number; likers: Set<string> }>();
    for (const l of likes) {
      const m = map.get(l.feed_id) ?? { feed_id: l.feed_id, count: 0, likers: new Set() };
      m.count += 1;
      m.likers.add(l.visitor_id);
      map.set(l.feed_id, m);
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [likes]);

  const titleMap = useMemo(() => new Map(videos.map((v) => [v.id, v.title])), [videos]);

  const filteredLikes = useMemo(() => {
    let list = likes;
    if (feedFilter !== 'all') list = list.filter((l) => l.feed_id === feedFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (l) =>
          (l.visitor_id || '').toLowerCase().includes(q) ||
          (titleMap.get(l.feed_id) || l.feed_id).toLowerCase().includes(q)
      );
    }
    return list;
  }, [likes, feedFilter, query, titleMap]);

  const totalLikes = likes.filter((l) => feedFilter === 'all').length;
  const uniqueLikers = useMemo(
    () => new Set(likes.map((l) => l.visitor_id)).size,
    [likes]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-3xl bg-card text-foreground p-6 sm:p-8 overflow-hidden shadow-sm border border-border">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold">
              <Heart className="w-3.5 h-3.5" />
              <span>Feed yoqtirishlar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Yoqtirishlar
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Videolarga bo'lgan yoqtirishlar — real 'feed_likes' ma'lumotlaridan.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchLikes}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-foreground text-background font-bold text-xs hover:bg-foreground/90 transition-all shadow-md active:scale-95 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Yangilash</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        <KpiCard label="Jami yoqtirishlar" value={totalLikes} icon={Heart} accent="bg-rose-500/10 text-rose-600 dark:text-rose-400" />
        <KpiCard label="Noyob yoqtiruvchilar" value={uniqueLikers} icon={Users} accent="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
        <KpiCard label="Videolar (yoqtirish olgan)" value={perVideo.length} icon={Film} accent="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" />
        <KpiCard label="Trenddagi yoqtirishlar" value={data.feedLikeTrend.reduce((s, p) => s + p.likes, 0)} icon={TrendingUp} accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top liked videos */}
        <SectionCard title="Eng ko'p yoqtirilgan videolar" icon={Heart} accent="text-rose-500" subtitle="feed_likes bo'yicha">
          {perVideo.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Hozircha yoqtirishlar yo'q</p>
          ) : (
            <div className="space-y-2">
              {perVideo.slice(0, 8).map((v, i) => (
                <div key={v.feed_id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted border border-border">
                  <span className="w-5 h-5 rounded-md bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-[10px] font-black flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-foreground truncate">
                      {titleMap.get(v.feed_id) ?? v.feed_id}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{v.likers.size} noyob yoqtiruvchi</div>
                  </div>
                  <span className="text-base font-black text-rose-600 dark:text-rose-400 shrink-0">{v.count}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Like trend */}
        <SectionCard title="Yoqtirishlar dinamikasi" icon={TrendingUp} accent="text-blue-500" subtitle="Kunlik yoqtirishlar">
          <LikeTrendChart points={data.feedLikeTrend} />
        </SectionCard>
      </div>

      {/* All likes with search/filter */}
      <SectionCard
        title="Barcha yoqtirishlar"
        icon={Heart}
        accent="text-rose-500"
        subtitle={`${filteredLikes.length} ta yozuv`}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted text-muted-foreground">
              <Search className="w-3.5 h-3.5" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Qidirish..."
                className="bg-transparent outline-none text-xs font-semibold text-foreground w-32"
              />
            </div>
            <select
              value={feedFilter}
              onChange={(e) => setFeedFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-muted text-xs font-bold text-foreground outline-none"
            >
              <option value="all">Barcha videolar</option>
              {perVideo.map((v) => (
                <option key={v.feed_id} value={v.feed_id}>
                  {titleMap.get(v.feed_id) ?? v.feed_id}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {loading && likes.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-10">Yuklanmoqda...</p>
        ) : filteredLikes.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-10">Hech narsa topilmadi</p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-xs min-w-[480px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-2 py-2 font-bold">Video</th>
                  <th className="px-2 py-2 font-bold">Tashrifchi ID</th>
                  <th className="px-2 py-2 font-bold text-right">Sana</th>
                </tr>
              </thead>
              <tbody>
                {filteredLikes.map((l) => (
                  <tr key={l.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-2 py-2.5 font-bold text-foreground truncate max-w-[200px]">
                      {titleMap.get(l.feed_id) ?? l.feed_id}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-[10px] text-muted-foreground truncate max-w-[200px]">
                      {l.visitor_id}
                    </td>
                    <td className="px-2 py-2.5 text-right text-muted-foreground">
                      {new Date(l.created_at).toLocaleString('uz-UZ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <div className="text-center">
        <Link to="/feed" target="_blank" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground font-bold">
          <span>Feed ko'rish</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

const LikeTrendChart: React.FC<{ points: { date: string; likes: number }[] }> = ({ points }) => {
  const max = Math.max(1, ...points.map((p) => p.likes));
  if (points.every((p) => p.likes === 0)) {
    return <p className="text-xs text-muted-foreground text-center py-6">Yoqtirishlar ma'lumoti yo'q</p>;
  }
  return (
    <div className="flex items-end gap-1.5" style={{ height: 160 }}>
      {points.map((p) => (
        <div key={p.date} className="flex-1 flex flex-col items-center gap-1 group" title={`${p.date} — ${p.likes} yoqtirish`}>
          <span className="text-[9px] text-muted-foreground font-bold opacity-0 group-hover:opacity-100 transition-opacity">{p.likes}</span>
          <div
            className="w-full rounded-md bg-gradient-to-t from-rose-600 to-rose-400 dark:from-rose-700 dark:to-rose-500 group-hover:opacity-80 transition-opacity"
            style={{ height: `${Math.max(3, (p.likes / max) * (160 - 24))}px` }}
          />
          <span className="text-[8px] font-bold text-muted-foreground">{p.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
};