import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  FolderTree,
  Film,
  Store,
  Settings,
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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useVideoFeed } from '../../context/VideoContext';
import { useBrand } from '../../hooks/useBrand';
import { supabase } from '../../lib/supabase/client';
import { formatPrice } from '../../lib/utils';
import { relativeTime } from '../../lib/admin/relativeTime';

interface TodayStats {
  orders: number;
  revenue: number;
  visitors: number;
  productViews: number;
  favorites: number;
  videoViews: number;
}

interface HealthCheck {
  key: string;
  label: string;
  ok: boolean;
  suggestion: string;
  href: string;
}

const QUICK_ACTIONS = [
  { label: "Mahsulot qo'shish", desc: 'Katalogga yangi mahsulot', path: '/admin/products/new', icon: Package, kbd: 'G P', accent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { label: 'Video yuklash', desc: 'Feed / lentaga video', path: '/admin/feed', icon: Film, kbd: 'G F', accent: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { label: 'Bosh sahifa', desc: 'Banner va bloklarni tahrirlash', path: '/admin/homepage', icon: Send, kbd: 'G H', accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { label: 'Kategoriyalar', desc: 'Bo‘limlar va tartib', path: '/admin/categories', icon: FolderTree, kbd: 'G C', accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { label: 'Buyurtmalar', desc: 'Yangi buyurtmalarni ko‘rish', path: '/admin/orders', icon: ShoppingCart, kbd: 'G O', accent: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { label: 'Analitika', desc: 'Tashrif, sotuv, feed', path: '/admin/analytics', icon: BarChart3, kbd: 'G A', accent: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
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

  const healthChecks: HealthCheck[] = useMemo(() => {
    const withImages = products.length > 0 ? products.filter((p) => p.images && p.images.length > 0).length : 0;
    const homepageOk =
      !!homepageCms.hero.title?.trim() &&
      !!homepageCms.hero.subtitle?.trim() &&
      !!homepageCms.hero.heroImage &&
      activeSlides.length > 0;
    const contactOk = !!(storeInfo.phoneNumbers?.[0] || storeInfo.phone) && !!storeInfo.telegramUsername;
    const locationOk = !!storeInfo.address && (!!storeInfo.googleMapsUrl || !!storeInfo.yandexMapsUrl || !!storeInfo.coordinates);
    return [
      { key: 'logo', label: 'Do‘kon logotipi', ok: !!storeInfo.logoUrl, suggestion: 'Do‘kon logotipini yuklang', href: '/admin/store' },
      { key: 'banner', label: 'Bosh sahifa banneri', ok: !!homepageCms.hero.heroImage && activeSlides.length > 0, suggestion: 'Hero rasmi va kamida 1 faol slayd qo‘shing', href: '/admin/homepage' },
      { key: 'categories', label: 'Kategoriyalar', ok: categories.length > 0, suggestion: 'Birinchi kategoriyangizni yarating', href: '/admin/categories' },
      { key: 'images', label: 'Mahsulot rasmlari', ok: products.length > 0 && withImages === products.length, suggestion: `${missingImages.length} ta mahsulotga rasm qo‘shing`, href: '/admin/products' },
      { key: 'stock', label: 'Zaxiradagi mahsulotlar', ok: publishedProducts.some((p) => p.inStock), suggestion: 'Kamida 1 ta mahsulotni zaxirada belgilang', href: '/admin/inventory' },
      { key: 'homepage', label: 'Bosh sahifa to‘liq', ok: homepageOk, suggestion: 'Sarlavha, matn, rasm va slaydlarni to‘ldiring', href: '/admin/homepage' },
      { key: 'contact', label: 'Aloqa ma’lumotlari', ok: contactOk, suggestion: 'Telefon va Telegram username kiriting', href: '/admin/store' },
      { key: 'location', label: 'Manzil / xarita', ok: locationOk, suggestion: 'Manzil va xarita havolasini kiriting', href: '/admin/store' },
      { key: 'feed', label: 'Feed videolari', ok: videos.length > 0, suggestion: 'Birinchi feed videongizni yuklang', href: '/admin/feed' },
    ];
  }, [storeInfo, homepageCms, activeSlides, categories, products, publishedProducts, missingImages, videos]);

  const healthOk = healthChecks.filter((h) => h.ok).length;
  const healthPct = Math.round((healthOk / healthChecks.length) * 100);
  const healthSuggestions = healthChecks.filter((h) => !h.ok).slice(0, 3);

  const [today, setToday] = useState<TodayStats>({ orders: 0, revenue: 0, visitors: 0, productViews: 0, favorites: 0, videoViews: 0 });
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
    if (missingImages.length > 0) list.push({ icon: ImageIcon, title: `${missingImages.length} ta mahsulot rasmsiz`, desc: 'Mijozlar rasmsiz mahsulotni kam ko‘radi', href: '/admin/products', tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' });
    if (outOfStock.length > 0) list.push({ icon: XCircle, title: `${outOfStock.length} ta mahsulot tugagan`, desc: 'Zaxirani yangilang yoki yashiring', href: '/admin/inventory', tone: 'bg-red-500/10 text-red-600 dark:text-red-400' });
    if (lowStock.length > 0) list.push({ icon: AlertTriangle, title: `${lowStock.length} ta mahsulot kam qoldi (≤3)`, desc: 'Qayta zaxira qilish kerak', href: '/admin/inventory', tone: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' });
    if (emptyCategories.length > 0) list.push({ icon: FolderTree, title: `${emptyCategories.length} ta bo‘sh kategoriya`, desc: emptyCategories.slice(0, 2).map((c) => c.name).join(', '), href: '/admin/categories', tone: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' });
    if (homepageSlides.length > 0 && activeSlides.length === 0) list.push({ icon: Send, title: 'Faol slayd yo‘q', desc: 'Bosh sahifa slayderi bo‘sh ko‘rinadi', href: '/admin/homepage', tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' });
    if (!storeInfo.logoUrl) list.push({ icon: Store, title: 'Logo yuklanmagan', desc: 'Brend ishonchliligini oshiring', href: '/admin/store', tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' });
    if (!storeInfo.phoneNumbers?.[0] && !storeInfo.phone) list.push({ icon: Phone, title: 'Telefon kiritilmagan', desc: 'Mijozlar bog‘lana olmaydi', href: '/admin/store', tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' });
    if (!storeInfo.address) list.push({ icon: MapPin, title: 'Manzil kiritilmagan', desc: 'Xarita va tashrif uchun muhim', href: '/admin/store', tone: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' });
    return list.slice(0, 6);
  }, [missingImages, outOfStock, lowStock, emptyCategories, homepageSlides, activeSlides, storeInfo]);

  const todayCards = [
    { label: 'Bugungi buyurtmalar', value: today.orders, sub: `${formatPrice(today.revenue)} daromad`, icon: ShoppingCart, tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', href: '/admin/orders' },
    { label: 'Bugungi daromad', value: formatPrice(today.revenue), sub: `${today.orders} buyurtmadan`, icon: TrendingUp, tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', href: '/admin/orders' },
    { label: 'Tashrifchilar', value: today.visitors, sub: 'Noyob sessiyalar', icon: Users, tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400', href: '/admin/analytics' },
    { label: 'Mahsulot ko‘rishlar', value: today.productViews, sub: 'product_view eventlari', icon: Eye, tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', href: '/admin/analytics' },
    { label: 'Sevimlilarga', value: today.favorites, sub: 'product_save + feed_favorite', icon: Heart, tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', href: '/admin/analytics' },
    { label: 'Video ko‘rishlar', value: today.videoViews, sub: 'feed_view eventlari', icon: Film, tone: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', href: '/admin/feed/analytics' },
  ];

  return (
    <div className="space-y-6">
      {isNewStore ? (
        <div className="rounded-3xl border-2 border-dashed border-border p-8 sm:p-12 text-center bg-muted/30">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Xush kelibsiz, {brand.displayName}!</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Do‘koningiz hozircha bo‘sh. Birinchi mahsulotni qo‘shing yoki do‘kon sozlamalarini to‘ldiring.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link to="/admin/products/new" className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm">
              <Package className="w-4 h-4" /> Birinchi mahsulot
            </Link>
            <Link to="/admin/store" className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 border border-border">
              <Settings className="w-4 h-4" /> Do‘kon sozlamalari
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Boshqaruv markazi</h1>
              <p className="text-sm text-muted-foreground mt-1">{brand.displayName} — bugungi holat bir qarashda</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/admin/products/new" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-sm">
                <Package className="w-3.5 h-3.5" /> Yangi mahsulot
              </Link>
              <Link to="/admin/feed" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 border border-border">
                <Film className="w-3.5 h-3.5" /> Video
              </Link>
            </div>
          </div>

          {/* Store health + notifications */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 rounded-2xl bg-card border border-border p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${healthPct >= 80 ? 'bg-emerald-500/10 text-emerald-600' : healthPct >= 50 ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'}`}>
                    {healthPct}%
                  </div>
                  <div>
                    <h2 className="text-sm font-bold flex items-center gap-1.5"><Target className="w-4 h-4 text-primary" /> Do‘kon sog‘ligi</h2>
                    <p className="text-xs text-muted-foreground">{healthOk}/{healthChecks.length} band bajarilgan</p>
                  </div>
                </div>
                <Link to="/admin/store" className="text-xs font-semibold text-primary hover:underline">Sozlash</Link>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={healthPct} aria-valuemin={0} aria-valuemax={100}>
                <div className={`h-full rounded-full transition-all ${healthPct >= 80 ? 'bg-emerald-500' : healthPct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${healthPct}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {healthChecks.map((h) => (
                  <Link
                    key={h.key}
                    to={h.href}
                    aria-label={`${h.label}: ${h.ok ? 'bajarilgan' : h.suggestion}`}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 hover:bg-muted/70 transition-all group"
                  >
                    {h.ok ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-amber-500 transition-colors" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold truncate">{h.label}</p>
                      {!h.ok && <span className="text-[10px] text-primary truncate block">{h.suggestion} →</span>}
                      {h.ok && <span className="text-[10px] text-muted-foreground truncate block">Tayyor ✓</span>}
                    </div>
                  </Link>
                ))}
              </div>
              {healthSuggestions.length > 0 && (
                <div className="mt-3 rounded-xl bg-amber-500/5 border border-amber-500/20 p-3">
                  <p className="text-xs font-bold mb-1.5">Keyingi qadamlar:</p>
                  <ul className="space-y-1">
                    {healthSuggestions.map((s) => (
                      <li key={s.key} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                        <Link to={s.href} className="hover:text-foreground hover:underline">{s.suggestion}</Link>
                      </li>
                    ))}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
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
                    <Link key={a.path + a.label} to={a.path} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border/60 hover:border-primary/30 hover:bg-muted/70 hover:shadow-sm hover:-translate-y-px active:translate-y-0 transition-all group">
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
        </>
      )}
    </div>
  );
};

export default DashboardPage;
