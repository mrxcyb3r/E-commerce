import React, { useEffect } from 'react';
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
} from 'lucide-react';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { useStore } from '../../context/StoreContext';

const MAX_BAR_HEIGHT = 160;

export const AnalyticsAdminPage: React.FC = () => {
  const data = useAnalyticsData(10000);
  const { products } = useStore();

  const hasData =
    data.totalPageViews > 0 ||
    Object.values(data.eventsByType).reduce((sum, n) => sum + n, 0) > 0;

  useEffect(() => {
    if (data.error) {
      // Surface load errors gracefully in the UI.
    }
  }, [data.error]);

  const productName = (id: string | undefined): string => {
    if (!id) return 'Noma\'lum';
    const p = products.find((pr) => pr.id === id || pr.slug === id);
    return p ? p.name : id;
  };

  const maxDay = Math.max(1, ...data.trafficByDay.map((d) => d.count));

  const overviewCards = [
    {
      label: 'Sahifa Tashriflari',
      value: data.totalPageViews,
      icon: Eye,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
    },
    {
      label: 'Noyob Tashrifchilar',
      value: data.uniqueVisitors,
      icon: Users,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
    },
    {
      label: 'Sessiyalar',
      value: data.totalSessions,
      icon: Radio,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50',
    },
    {
      label: 'Qidiruvlar',
      value: data.eventsByType.search ?? 0,
      icon: Search,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
    },
    {
      label: 'Saqlanganlar',
      value: (data.eventsByType.product_save ?? 0),
      icon: Heart,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
    },
    {
      label: 'Feed ko\'rishlar',
      value: data.feedActivity.views,
      icon: Film,
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900/50',
    },
  ];

  const intentCards = [
    { label: 'Telegram', value: data.intent.telegram, icon: Send, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Qo\'ng\'iroq', value: data.intent.phone, icon: Phone, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Xarita/Yo\'nalish', value: data.intent.directions, icon: MapPin, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Aloqa', value: data.intent.contact, icon: MessageCircle, color: 'text-purple-500 bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative rounded-3xl bg-neutral-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-neutral-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/20 text-blue-300 text-xs font-bold">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Premium Analytics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Tashrifchilar tahlili
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
              Do'konga tashrif buyuruvchilar, mahsulotlar, qidiruvlar va savdo niyatlari haqidagi real
              ma'lumotlar. Ma'lumotlar faqat haqiqiy foydalanuvchi harakatlaridan yig'iladi.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => data.refresh()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-100 transition-all shadow-md active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${data.loading ? 'animate-spin' : ''}`} />
              <span>Yangilash</span>
            </button>
            <Link
              to="/"
              target="_blank"
              className="text-[11px] text-neutral-400 hover:text-white inline-flex items-center gap-1 font-medium"
            >
              <span>Vitrinani ochish</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {data.error && (
        <div className="rounded-2xl border border-amber-300/50 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-4 text-sm font-medium">
          Analytics jadvali Supabase'da hali yaratilmagan yoki o'qish imkoni yo'q. Iltimos,
          <code className="mx-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-[11px]">
            supabase/migrations/20260903120000_analytics_events.sql
          </code>
          migratsiyasini ishga tushiring. ({data.error})
        </div>
      )}

      {!data.error && !hasData && (
        <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center">
            <MousePointerClick className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-neutral-900 dark:text-white">
              Hozircha ma'lumot yo'q
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
              Vitrinda foydalanuvchilar harakatlari qayd etilishi bilan bu yerda real analitika
              paydo bo'ladi. Vitrinaga o'tib bir nechta mahsulot va qidiruvlarni sinab ko'ring.
            </p>
          </div>
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-black"
          >
            <span>Vitrina</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {hasData && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {overviewCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs"
                >
                  <div className={`inline-flex p-2 rounded-xl border ${card.color} mb-3`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                    {card.value.toLocaleString('uz-UZ')}
                  </div>
                  <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {card.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Traffic Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-blue-500" />
                    <span>Oxirgi 14 kun</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Sahifa tashriflarining kunlik taqsimoti
                  </p>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-40">
                {data.trafficByDay.map((d) => (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center gap-1 group"
                    title={`${d.date} — ${d.count}`}
                  >
                    <span className="text-[9px] text-neutral-400 font-bold opacity-0 group-hover:opacity-100">
                      {d.count}
                    </span>
                    <div
                      className="w-full rounded-md bg-gradient-to-t from-blue-600 to-blue-400 dark:from-blue-700 dark:to-blue-500 group-hover:opacity-80 transition-opacity"
                      style={{
                        height: `${Math.max(3, (d.count / maxDay) * MAX_BAR_HEIGHT)}px`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-purple-500" />
                <span>Eng ko'p o'qilgan sahifalar</span>
              </h3>
              <div className="space-y-2">
                {data.topPages.map((p) => (
                  <div
                    key={p.page}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-xs"
                  >
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300 truncate">
                      {p.page}
                    </span>
                    <span className="font-black text-neutral-900 dark:text-white ml-2 shrink-0">
                      {p.count}
                    </span>
                  </div>
                ))}
                {data.topPages.length === 0 && (
                  <p className="text-xs text-neutral-400 text-center py-6">Ma'lumot yo'q</p>
                )}
              </div>
            </div>
          </div>

          {/* Products + Feed + Intent */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Products */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <span>Mashhur mahsulotlar</span>
              </h3>
              <div className="space-y-2">
                {data.topProducts.map((pr) => (
                  <div
                    key={pr.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-xs"
                  >
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300 truncate">
                      {productName(pr.id)}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-black">
                        <Eye className="w-2.5 h-2.5" /> {pr.views}
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black">
                        <Heart className="w-2.5 h-2.5" /> {pr.saves}
                      </span>
                    </div>
                  </div>
                ))}
                {data.topProducts.length === 0 && (
                  <p className="text-xs text-neutral-400 text-center py-6">Hali ko'rishlar yo'q</p>
                )}
              </div>
            </div>

            {/* Feed Activity */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
                <Film className="w-4 h-4 text-teal-500" />
                <span>Video / Feed faolligi</span>
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Feed ko\'rishlar', value: data.feedActivity.views, color: 'text-teal-500' },
                  { label: 'Ulashishlar', value: data.feedActivity.shares, color: 'text-blue-500' },
                  { label: 'Mahsulotga o\'tish', value: data.feedActivity.productClicks, color: 'text-amber-500' },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800"
                  >
                    <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                      {row.label}
                    </span>
                    <span className={`text-lg font-black ${row.color}`}>
                      {row.value.toLocaleString('uz-UZ')}
                    </span>
                  </div>
                ))}
                {(data.feedActivity.views + data.feedActivity.shares + data.feedActivity.productClicks) === 0 && (
                  <p className="text-xs text-neutral-400 text-center py-4">Feed faolligi yo'q</p>
                )}
              </div>
            </div>

            {/* Customer Intent */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
                <MousePointerClick className="w-4 h-4 text-purple-500" />
                <span>Sotib olish niyati</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {intentCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800"
                    >
                      <div className={`inline-flex p-2 rounded-lg ${card.color} mb-2`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xl font-black text-neutral-900 dark:text-white">
                        {card.value.toLocaleString('uz-UZ')}
                      </div>
                      <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                        {card.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              {(data.intent.telegram + data.intent.phone + data.intent.directions + data.intent.contact) === 0 && (
                <p className="text-xs text-neutral-400 text-center py-4 mt-2">
                  Hali xaridorlar bilan bog'lanish yo'q
                </p>
              )}
            </div>
          </div>

          {/* Search Insights + Generated Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search Insights */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
                <Search className="w-4 h-4 text-amber-500" />
                <span>Qidiruv tahlili</span>
              </h3>
              <div>
                <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">
                  Eng keng tarqalgan qidiruvlar
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {data.topSearches.map((s) => (
                    <span
                      key={s.query}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200"
                    >
                      "{s.query}"
                      <span className="text-amber-600 dark:text-amber-400 font-black">{s.count}</span>
                    </span>
                  ))}
                  {data.topSearches.length === 0 && (
                    <p className="text-xs text-neutral-400 py-2">Qidiruvlar yo'q</p>
                  )}
                </div>

                <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">
                  Natija bermagan qidiruvlar
                </p>
                <div className="space-y-2">
                  {data.noResultSearches.map((s) => (
                    <div
                      key={s.query}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs"
                    >
                      <span className="font-bold text-amber-800 dark:text-amber-300 truncate">
                        "{s.query}"
                      </span>
                      <span className="font-black text-amber-700 dark:text-amber-400 ml-2 shrink-0">
                        {s.count}
                      </span>
                    </div>
                  ))}
                  {data.noResultSearches.length === 0 && (
                    <p className="text-xs text-neutral-400 py-2">
                      Natija bermagan qidiruvlar yo'q — barcha qidiruvlar katalogdan topilgan.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Generated Insights */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Avtomatik tahlillar</span>
              </h3>
              <div className="space-y-2.5">
                {data.insightLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed"
                  >
                    {line}
                  </div>
                ))}
                {data.insightLines.length === 0 && (
                  <p className="text-xs text-neutral-400 text-center py-6">
                    Tahlil yaratish uchun yetarli ma'lumot to'planmagan.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
