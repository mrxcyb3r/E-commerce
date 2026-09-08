import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  FolderTree,
  Film,
  Store,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Heart,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Users,
  Target,
  ShoppingCart,
  Eye,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Bell,
  Zap,
  Rocket,
  ScanLine,
  Sparkles,
  HandCoins,
  Boxes,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useVideoFeed } from '../../context/VideoContext';
import { useBrand } from '../../hooks/useBrand';
import { supabase } from '../../lib/supabase/client';
import { formatPrice } from '../../lib/utils';
import { relativeTime } from '../../lib/admin/relativeTime';
import { track } from '../../lib/analytics/client';
import {
  computeStoreReadiness,
  topReadinessTasks,
  READINESS_GROUP_LABELS,
  ReadinessGroup,
} from '../../lib/admin/readiness';
import { computeDailyTasks, DailyTask, TaskKind } from '../../lib/admin/tasks';
import { tashkentMidnight } from '../../lib/admin/ops';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';

const TASK_ICONS: Record<TaskKind, React.ComponentType<{ className?: string }>> = {
  readiness: Target,
  catalog: FolderTree,
  content: Film,
  inventory: Boxes,
  operations: Zap,
};

const TASK_TONES: Record<TaskKind, string> = {
  readiness: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  catalog: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  content: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  inventory: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  operations: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
};

const PRIORITY_META: Record<DailyTask['priority'], { label: string; cls: string }> = {
  high: { label: 'Muhim', cls: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  medium: { label: 'O‘rta', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  low: { label: 'Past', cls: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400' },
};

interface TodayStats {
  orders: number;
  revenue: number;
  visitors: number;
  productViews: number;
  favorites: number;
  videoViews: number;
  buySessions: number;
}

const QUICK_ACTIONS = [
  { label: "Mahsulot qo'shish", desc: 'Katalogga yangi mahsulot', path: '/admin/products/new', icon: Package, kbd: 'G P', accent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { label: 'Video yuklash', desc: 'Feed / lentaga video', path: '/admin/feed', icon: Film, kbd: 'G F', accent: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { label: 'Bosh sahifa', desc: 'Banner va bloklarni tahrirlash', path: '/admin/homepage', icon: Send, kbd: 'G H', accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { label: 'Kategoriyalar', desc: 'Bo‘limlar va tartib', path: '/admin/categories', icon: FolderTree, kbd: 'G C', accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { label: 'Buyurtmalar', desc: 'Yangi buyurtmalarni ko‘rish', path: '/admin/orders', icon: ShoppingCart, kbd: 'G O', accent: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { label: 'Analitika', desc: 'Tashrif, sotuv, feed', path: '/admin/analytics', icon: BarChart3, kbd: 'G A', accent: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
  { label: "Do'konda sotuv", desc: 'Passcode / QR orqali', path: '/admin/in-store-sale', icon: ScanLine, kbd: 'G I', accent: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
];

export const DashboardPage: React.FC = () => {
  const { products, categories, storeInfo, homepageCms, homepageSlides, activityLogs } = useStore();
  const { videos } = useVideoFeed();
  const brand = useBrand();

  const publishedProducts = useMemo(() => products.filter((p) => p.published !== false), [products]);
  const missingImages = useMemo(() => products.filter((p) => !p.images || p.images.length === 0), [products]);
  const outOfStock = useMemo(
    () => products.filter((p) => !p.inStock || (p.stockCount !== undefined && p.stockCount <= 0)),
    [products]
  );
  const lowStock = useMemo(
    () => products.filter((p) => p.inStock && (p.stockCount ?? 0) > 0 && (p.stockCount ?? 0) <= 3),
    [products]
  );
  const unpublishedProducts = useMemo(() => products.filter((p) => p.published === false), [products]);
  const activeSlides = useMemo(() => homepageSlides.filter((s) => s.active), [homepageSlides]);
  const emptyCategories = useMemo(() => {
    return categories.filter((c) => {
      const count = products.filter((p) => p.category === c.id || p.category === c.slug || p.categoryName === c.name).length;
      return count === 0;
    });
  }, [categories, products]);

  const isNewStore = products.length === 0 && categories.length === 0;

  const readiness = useMemo(
    () =>
      computeStoreReadiness({
        products,
        categories,
        storeInfo,
        homepageCms,
        homepageSlides,
        videos,
      }),
    [products, categories, storeInfo, homepageCms, homepageSlides, videos]
  );

  const keyTasks = useMemo(() => topReadinessTasks(readiness, 4), [readiness]);

  const analyticsEvents = useAnalyticsData();

  const dailyTasks = useMemo(() => {
    const viewedIds = new Set<string>();
    const preparedIds = new Set<string>();
    for (const e of analyticsEvents.events) {
      if (!e.product_id) continue;
      if (e.event_type === 'product_view') viewedIds.add(e.product_id);
      else if (e.event_type === 'buy_list_add') preparedIds.add(e.product_id);
    }
    const postedToday = videos.some((v) => new Date(v.createdAt).getTime() >= tashkentMidnight(Date.now()));
    return computeDailyTasks({
      products,
      videos,
      readiness,
      viewedIds,
      preparedIds,
      postedToday,
      emptyCategoryCount: emptyCategories.length,
    });
  }, [analyticsEvents.events, products, videos, readiness, emptyCategories.length]);
  const groupsDone = useMemo(() => {
    const counts: Record<string, { done: number; total: number }> = {};
    for (const item of readiness.items) {
      const g = counts[item.group] ?? { done: 0, total: 0 };
      g.total += 1;
      if (item.done) g.done += 1;
      counts[item.group] = g;
    }
    return counts;
  }, [readiness]);

  const hour = new Date().getHours();
  const greeting = hour < 6 ? 'Xayrli tun' : hour < 12 ? 'Xayrli tong' : hour < 18 ? 'Xayrli kun' : 'Xayrli oqshom';
  const todayLabel = new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', weekday: 'long' });

  const [today, setToday] = useState<TodayStats>({ orders: 0, revenue: 0, visitors: 0, productViews: 0, favorites: 0, videoViews: 0, buySessions: 0 });
  const [recentOrders, setRecentOrders] = useState<Array<{ id: string; customer_name: string; total: number; created_at: string }>>([]);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const [ordersRes, eventsRes] = await Promise.all([
          supabase.from('orders').select('total, created_at').gte('created_at', start.toISOString()).lte('created_at', end.toISOString()),
          supabase.from('analytics_events').select('session_id, event_type').gte('created_at', start.toISOString()).lte('created_at', end.toISOString()).limit(5000),
        ]);
        const orders = ordersRes.error ? [] : ordersRes.data ?? [];
        const events = eventsRes.error ? [] : (eventsRes.data ?? [] as Array<{ session_id: string | null; event_type: string }>);
        const visitors = new Set(events.map((e) => e.session_id).filter(Boolean)).size;
        const byType = (t: string) => events.filter((e) => e.event_type === t).length;
        setToday({
          orders: orders.length,
          revenue: orders.reduce((s, o: { total?: number }) => s + (o.total || 0), 0),
          visitors,
          productViews: byType('product_view'),
          favorites: byType('product_save') + byType('feed_favorite'),
          videoViews: byType('feed_view'),
          buySessions: byType('buy_session_created'),
        });
      } catch (err) {
        console.error('Dashboard today stats failed:', err);
      }
    };
    const fetchRecent = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, customer_name, total, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        if (!error && data) {
          setRecentOrders(
            data.map((o: { id: string; customer_name?: string; total?: number; created_at: string }) => ({
              id: o.id,
              customer_name: o.customer_name || 'Noma’lum',
              total: o.total || 0,
              created_at: o.created_at,
            }))
          );
        }
      } catch (err) {
        console.error('Dashboard recent orders failed:', err);
      }
    };
    void fetchToday();
    void fetchRecent();
  }, []);

  const activityTimeline = useMemo(() => {
    const logs = (activityLogs ?? []).slice(0, 6).map((l) => ({
      id: l.id,
      title: l.description,
      meta: `${l.entity} · ${l.action}`,
      time: l.timestamp,
      icon: l.action === 'create' ? Plus : l.action === 'delete' ? Trash2 : l.action === 'publish' ? Send : Edit,
    }));
    const orders = recentOrders.slice(0, 3).map((o) => ({
      id: `order-${o.id}`,
      title: `Buyurtma #${o.id.slice(-8).toUpperCase()} — ${formatPrice(o.total)}`,
      meta: o.customer_name,
      time: o.created_at,
      icon: ShoppingCart,
    }));
    return [...orders, ...logs]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8);
  }, [activityLogs, recentOrders]);

  const notifications = useMemo(() => {
    const list: Array<{ icon: React.ComponentType<{ className?: string }>; title: string; desc: string; href: string; tone: string }> = [];
    if (readiness.score < 100) list.push({ icon: Target, title: `${readiness.score}% — do‘kon sozlanmagan`, desc: 'Sozlash bo‘yicha ko‘rsatma ochiq', href: '/admin/onboarding', tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' });
    if (missingImages.length > 0) list.push({ icon: ImageIcon, title: `${missingImages.length} ta mahsulot rasmsiz`, desc: 'Mijozlar rasmsiz mahsulotni kam ko‘radi', href: '/admin/products', tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' });
    if (outOfStock.length > 0) list.push({ icon: XCircle, title: `${outOfStock.length} ta mahsulot tugagan`, desc: 'Zaxirani yangilang yoki yashiring', href: '/admin/inventory', tone: 'bg-red-500/10 text-red-600 dark:text-red-400' });
    if (lowStock.length > 0) list.push({ icon: AlertTriangle, title: `${lowStock.length} ta mahsulot kam qoldi (≤3)`, desc: 'Qayta zaxira qilish kerak', href: '/admin/inventory', tone: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' });
    if (emptyCategories.length > 0) list.push({ icon: FolderTree, title: `${emptyCategories.length} ta bo‘sh kategoriya`, desc: emptyCategories.slice(0, 2).map((c) => c.name).join(', '), href: '/admin/categories', tone: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' });
    if (homepageSlides.length > 0 && activeSlides.length === 0) list.push({ icon: Send, title: 'Faol slayd yo‘q', desc: 'Bosh sahifa slayderi bo‘sh ko‘rinadi', href: '/admin/homepage', tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' });
    if (!storeInfo.logoUrl) list.push({ icon: Store, title: 'Logo yuklanmagan', desc: 'Brend ishonchliligini oshiring', href: '/admin/store', tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' });
    if (!storeInfo.phoneNumbers?.[0] && !storeInfo.phone) list.push({ icon: Phone, title: 'Telefon kiritilmagan', desc: 'Mijozlar bog‘lana olmaydi', href: '/admin/store', tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' });
    if (!storeInfo.address) list.push({ icon: MapPin, title: 'Manzil kiritilmagan', desc: 'Xarita va tashrif uchun muhim', href: '/admin/store', tone: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' });
    return list.slice(0, 7);
  }, [readiness, missingImages, outOfStock, lowStock, emptyCategories, homepageSlides, activeSlides, storeInfo]);

  if (isNewStore) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">{greeting}, {brand.displayName}!</h1>
          <p className="text-sm text-muted-foreground mt-1">{todayLabel}</p>
        </div>

        <div className="rounded-3xl border-2 border-dashed border-border p-8 sm:p-12 text-center bg-muted/30">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
            <Rocket className="w-8 h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Do‘koningizni 10 daqiqada sozlang
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Birinchi mahsulotni qo‘shishdan oldin do‘kon nomi, kontaktlar va brend ma’lumotlarini to‘ldiring. Qo‘llanma sizni bosqichma-bosqich olib boradi.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link to="/admin/onboarding" className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-amber-500 text-background text-sm font-bold hover:bg-amber-400 transition-all shadow-sm">
              <Sparkles className="w-4 h-4" /> Sozlashni boshlash
            </Link>
            <Link to="/admin/products/new" className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 border border-border">
              <Package className="w-4 h-4" /> Birinchi mahsulot
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${readiness.score >= 80 ? 'bg-emerald-500/10 text-emerald-600' : readiness.score >= 50 ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'}`}>
              {readiness.score}%
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold flex items-center gap-1.5"><Target className="w-4 h-4 text-primary" /> Do‘kon tayyorligi</h2>
              <p className="text-xs text-muted-foreground">{readiness.done}/{readiness.total} band bajarilgan — {readiness.score >= 80 ? 'ajoyib!' : 'boshlash uchun yetarli'}</p>
            </div>
            <Link to="/admin/onboarding" className="text-xs font-semibold text-primary hover:underline">Davom ettirish</Link>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {(Object.keys(READINESS_GROUP_LABELS) as ReadinessGroup[])
              .map((g) => ({ g, ...groupsDone[g] }))
              .filter((x) => x.total > 0)
              .map(({ g, done, total }) => (
                <div key={g} className="rounded-xl bg-muted/40 border border-border/50 px-3 py-2">
                  <p className="text-[10px] font-semibold text-muted-foreground">{READINESS_GROUP_LABELS[g]}</p>
                  <p className="text-xs font-bold mt-0.5">{done}/{total}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 sm:p-5">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> Keyingi qadamlar</h2>
          {keyTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Barcha qadamlar bajarilgan — endi mahsulot va videolar qo‘shing!</p>
          ) : (
            <ul className="space-y-2">
              {keyTasks.map((task) => (
                <li key={task.key}>
                  <Link to={task.href} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/50 hover:border-primary/30 hover:bg-muted/70 transition-all group">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${task.done ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                      {task.done ? <CheckCircle2 className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold truncate">{task.label}</span>
                      <span className="block text-[11px] text-primary truncate">{task.suggestion} →</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  const todayCards = [
    { label: 'Bugungi buyurtmalar', value: today.orders, sub: `${formatPrice(today.revenue)} daromad`, icon: ShoppingCart, tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', href: '/admin/orders' },
    { label: 'Bugungi daromad', value: formatPrice(today.revenue), sub: `${today.orders} buyurtmadan`, icon: TrendingUp, tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', href: '/admin/orders' },
    { label: 'Tashrifchilar', value: today.visitors, sub: 'Noyob sessiyalar', icon: Users, tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400', href: '/admin/analytics' },
    { label: 'Mahsulot ko‘rishlar', value: today.productViews, sub: 'product_view eventlari', icon: Eye, tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', href: '/admin/analytics' },
    { label: 'Xarid sessiyalari', value: today.buySessions, sub: 'Passcode/QR yaratilgan', icon: HandCoins, tone: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', href: '/admin/in-store-sale' },
    { label: 'Sevimlilarga', value: today.favorites, sub: 'product_save + feed_favorite', icon: Heart, tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', href: '/admin/analytics' },
    { label: 'Video ko‘rishlar', value: today.videoViews, sub: 'feed_view eventlari', icon: Film, tone: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', href: '/admin/feed/analytics' },
  ];

  const attentionItems = useMemo(() => {
    const items: Array<{ icon: React.ComponentType<{ className?: string }>; label: string; count: number; href: string; tone: string }> = [];
    if (missingImages.length > 0) items.push({ icon: ImageIcon, label: 'Rasmsiz mahsulotlar', count: missingImages.length, href: '/admin/products', tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' });
    if (outOfStock.length > 0) items.push({ icon: XCircle, label: 'Tugagan mahsulotlar', count: outOfStock.length, href: '/admin/inventory', tone: 'bg-red-500/10 text-red-600 dark:text-red-400' });
    if (lowStock.length > 0) items.push({ icon: AlertTriangle, label: 'Kam qolgan (≤3)', count: lowStock.length, href: '/admin/inventory', tone: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' });
    if (unpublishedProducts.length > 0) items.push({ icon: Edit, label: 'Qoralama', count: unpublishedProducts.length, href: '/admin/products', tone: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' });
    return items;
  }, [missingImages, outOfStock, lowStock, unpublishedProducts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">{greeting}, {brand.displayName}!</h1>
            <span className="text-xs font-medium text-muted-foreground">{todayLabel}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Boshqaruv markazi — do‘kon holati bir qarashda</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/onboarding" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 text-background text-xs font-bold hover:bg-amber-400 shadow-sm">
            <Rocket className="w-3.5 h-3.5" /> Sozlash
          </Link>
          <Link to="/admin/products/new" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-sm">
            <Package className="w-3.5 h-3.5" /> Yangi mahsulot
          </Link>
          <Link to="/admin/feed" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 border border-border">
            <Film className="w-3.5 h-3.5" /> Video
          </Link>
        </div>
      </div>

      {/* Readiness + notifications */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl bg-card border border-border p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${readiness.score >= 80 ? 'bg-emerald-500/10 text-emerald-600' : readiness.score >= 50 ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'}`}>
                {readiness.score}%
              </div>
              <div>
                <h2 className="text-sm font-bold flex items-center gap-1.5"><Target className="w-4 h-4 text-primary" /> Do‘kon tayyorligi</h2>
                <p className="text-xs text-muted-foreground">{readiness.done}/{readiness.total} band bajarilgan</p>
              </div>
            </div>
            <Link to="/admin/onboarding" className="text-xs font-semibold text-primary hover:underline">Sozlash</Link>
          </div>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={readiness.score} aria-valuemin={0} aria-valuemax={100}>
            <div className={`h-full rounded-full transition-all ${readiness.score >= 80 ? 'bg-emerald-500' : readiness.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${readiness.score}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {readiness.items.map((h) => (
              <Link
                key={h.key}
                to={h.href}
                aria-label={`${h.label}: ${h.done ? 'bajarilgan' : h.suggestion}`}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 hover:bg-muted/70 transition-all group"
              >
                {h.done ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-amber-500 transition-colors" />}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold truncate">{h.label}</p>
                  {!h.done && <span className="text-[10px] text-primary truncate block">{h.suggestion} →</span>}
                  {h.done && <span className="text-[10px] text-muted-foreground truncate block">Tayyor ✓</span>}
                </div>
              </Link>
            ))}
          </div>
          {dailyTasks.length > 0 && (
            <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-xs font-bold mb-2">Bugungi topshiriqlar</p>
              <ul className="space-y-1.5">
                {dailyTasks.map((t) => {
                  const Icon = TASK_ICONS[t.kind];
                  const p = PRIORITY_META[t.priority];
                  return (
                    <li key={t.id}>
                      <Link
                        to={t.href}
                        onClick={() => track('dashboard_task_completed', { metadata: { taskId: t.id, title: t.title } })}
                        className="flex items-start gap-2 rounded-lg px-2 py-1.5 bg-background/60 border border-border/40 hover:border-amber-400/40 transition-colors group"
                      >
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${TASK_TONES[t.kind]}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-foreground">{t.title}</span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${p.cls}`}>{p.label}</span>
                          </span>
                          <span className="block text-[11px] text-muted-foreground">{t.description}</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground mt-1 shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 sm:p-5">
          <h2 className="text-sm font-bold flex items-center gap-1.5 mb-3"><Bell className="w-4 h-4 text-amber-500" /> Ogohlantirishlar <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-muted">{notifications.length}</span></h2>
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold">Hammasi joyida!</p>
              <p className="text-[11px] text-muted-foreground">E’tibor talab qiladigan holat yo‘q.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {notifications.map((n, i) => {
                const Icon = n.icon;
                return (
                  <Link key={i} to={n.href} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/50 hover:border-primary/30 hover:bg-muted/70 transition-all group">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${n.tone}`}><Icon className="w-3.5 h-3.5" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold truncate">{n.title}</span>
                      <span className="block text-[11px] text-muted-foreground truncate">{n.desc}</span>
                      <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                        Ko‘rish <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Today's summary */}
      <div>
        <h2 className="text-sm font-bold mb-2.5 flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> Bugungi ko‘rsatkichlar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
          {todayCards.map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.label} to={c.href} className="rounded-2xl bg-card border border-border p-3 hover:shadow-sm hover:border-primary/20 transition-all group">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${c.tone}`}><Icon className="w-4 h-4" /></div>
                <div className="text-lg font-black tabular-nums">{typeof c.value === 'number' ? c.value.toLocaleString('uz-UZ') : c.value}</div>
                <div className="text-[11px] font-semibold">{c.label}</div>
                <div className="text-[10px] text-muted-foreground truncate">{c.sub}</div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Products needing attention */}
      {attentionItems.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-4 sm:p-5">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-500" /> E’tibor talab qiladigan mahsulotlar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {attentionItems.map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.label} to={a.href} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/50 hover:border-primary/30 hover:bg-muted/70 transition-all group">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.tone}`}><Icon className="w-4 h-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black tabular-nums">{a.count}</span>
                    <span className="block text-[11px] text-muted-foreground truncate">{a.label}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity + quick actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl bg-card border border-border p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold">So‘nggi faollik</h2>
            <Link to="/admin/analytics" className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1">Analitika <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {activityTimeline.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Hali faollik yozuvlari yo‘q.</p>
          ) : (
            <ol className="relative space-y-3 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-border">
              {activityTimeline.map((a) => {
                const Icon = a.icon;
                return (
                  <li key={a.id} className="relative flex items-start gap-3 pl-1">
                    <span className="relative z-10 w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0"><Icon className="w-3.5 h-3.5 text-muted-foreground" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold leading-snug line-clamp-2">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground">{a.meta} · <span title={new Date(a.time).toLocaleString('uz-UZ')}>{relativeTime(a.time)}</span></p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
          {unpublishedProducts.length > 0 && (
            <p className="mt-3 text-[11px] text-muted-foreground">{unpublishedProducts.length} ta mahsulot qoralama holatda — <Link to="/admin/products" className="text-primary hover:underline font-semibold">ko‘rish</Link></p>
          )}
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 sm:p-5">
          <h2 className="text-sm font-bold mb-3">Tezkor amallar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.path + a.label}
                  to={a.path}
                  onClick={() => track('dashboard_quick_action', { metadata: { action: a.label } })}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border/60 hover:border-primary/30 hover:bg-muted/70 hover:shadow-sm hover:-translate-y-px active:translate-y-0 transition-all group"
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.accent}`}><Icon className="w-5 h-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="block text-xs font-bold truncate">{a.label}</span>
                      <kbd className="admin-kbd hidden xl:inline-flex shrink-0">{a.kbd}</kbd>
                    </span>
                    <span className="block text-[11px] text-muted-foreground truncate">{a.desc}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;