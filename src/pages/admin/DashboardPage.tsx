import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  FolderTree,
  Film,
  Store,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Instagram,
  Send,
  Heart,
  ArrowRight,
  Mail,
  TrendingUp,
  BarChart3,
  Users,
  Target,
  ShoppingCart,
  DollarSign,
  Eye,
  Zap,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useBrand } from '../../hooks/useBrand';
import { supabase } from '../../lib/supabase/client';
import { formatPrice } from '../../lib/utils';

export const DashboardPage: React.FC = () => {
  const { products, categories, storeInfo, homepageCms } = useStore();
  const brand = useBrand();

  const publishedProducts = products.filter(p => p.published !== false);
  const featuredProducts = products.filter(p => p.isFeatured);
  const outOfStock = products.filter(p => !p.inStock || (p.stockCount !== undefined && p.stockCount <= 0));
  const missingImages = products.filter(p => !p.images || p.images.length === 0);
  const missingCategory = products.filter(p => !p.category);
  const draftProducts = products.filter(p => !p.isFeatured && !p.isNew && p.published === true);

  // Check if this is a new store (no products, no orders, no content)
  const isNewStore = products.length === 0 && categories.length === 0;

  // Store profile completion
  const storeFields = [
    { label: 'Do\'kon nomi', ok: !!storeInfo.businessName },
    { label: 'Telefon', ok: !!storeInfo.phone },
    { label: 'Manzil', ok: !!storeInfo.address },
    { label: 'Ish vaqti', ok: !!storeInfo.workingHours },
    { label: 'Logo', ok: !!storeInfo.logoUrl },
    { label: 'Hero rasmi', ok: !!homepageCms.hero.heroImage },
    { label: 'Telegram', ok: !!storeInfo.telegramUsername },
    { label: 'Instagram', ok: !!storeInfo.instagramUsername },
  ];
  const storeHealth = storeFields.filter(f => f.ok).length;
  const storeTotal = storeFields.length;
  const storeCompletion = Math.round((storeHealth / storeTotal) * 100);

  // Products needing attention
  const productsNeedingAttention = [
    ...missingImages.map(p => ({ product: p, label: 'Rasm qo\'shish', action: 'addImage' })),
    ...missingCategory.map(p => ({ product: p, label: 'Kategoriya tanlash', action: 'setCategory' })),
    ...outOfStock.map(p => ({ product: p, label: 'Zaxira yangilash', action: 'updateStock' })),
  ];

  // Today's activity from orders
  const [todayOrders, setTodayOrders] = useState<number>(0);
  const [todayRevenue, setTodayRevenue] = useState<number>(0);
  const [todayVisitors, setTodayVisitors] = useState<number>(0);

  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const [{ data: ordersData, error: ordersError }, { data: analyticsData, error: analyticsError }] = await Promise.all([
          supabase
            .from('orders')
            .select('total, created_at')
            .gte('created_at', todayStart.toISOString())
            .lte('created_at', todayEnd.toISOString()),
          supabase
            .from('analytics_events')
            .select('session_id')
            .gte('created_at', todayStart.toISOString())
            .lte('created_at', todayEnd.toISOString()),
        ]);

        if (!ordersError && ordersData) {
          const ordersToday = ordersData.length;
          const revenueToday = ordersData.reduce((sum, o) => sum + (o.total || 0), 0);
          setTodayOrders(ordersToday);
          setTodayRevenue(revenueToday);
        }

        if (!analyticsError && analyticsData) {
          const uniqueSessions = new Set(analyticsData.map((a: any) => a.session_id).filter(Boolean)).size;
          setTodayVisitors(uniqueSessions);
        }
      } catch (err) {
        console.error('Failed to fetch today stats:', err);
      }
    };
    fetchTodayStats();
  }, []);

  // Popular products by stock (as proxy for popularity)
  const popularProducts = products
    .filter(p => p.published !== false)
    .sort((a, b) => (b.stockCount ?? 0) - (a.stockCount ?? 0))
    .slice(0, 4);

  // Recent orders
  const [recentOrders, setRecentOrders] = useState<Array<{id: string; customer_name: string; total: number; created_at: string; status: string}>>([]);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, customer_name, total, created_at, order_status')
          .order('created_at', { ascending: false })
          .limit(5);
        if (!error && data) {
          setRecentOrders(data.map((o: any) => ({
            id: o.id,
            customer_name: o.customer_name || 'Noma\'lum',
            total: o.total || 0,
            created_at: o.created_at,
            status: o.order_status,
          })));
        }
      } catch (err) {
        console.error('Failed to fetch recent orders:', err);
      }
    };
    fetchRecentOrders();
  }, []);

  // Quick action paths
  const quickActions = [
    { label: 'Mahsulot qo\'shish', path: '/admin/products/new', icon: Package, badge: null },
    { label: 'Video qo\'shish', path: '/admin/feed', icon: Film, badge: null },
    { label: 'Kategoriyalar', path: '/admin/categories', icon: FolderTree, badge: categories.length > 0 ? null : 'Yangi' },
    { label: "Do'konni sozlash", path: '/admin/store', icon: Settings, badge: storeCompletion < 100 ? `${storeCompletion}%` : null },
    { label: 'Bosh sahifa banneri', path: '/admin/homepage', icon: Send, badge: null },
    { label: 'Do\'konni ko\'rish', path: '/', icon: Store, badge: null },
  ];

  // KPI Cards Data
  const kpiCards = [
    { label: 'Mahsulotlar', value: products.length, sub: `${publishedProducts.length} nashr etilgan`, icon: Package, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', href: '/admin/products' },
    { label: 'Kategoriyalar', value: categories.length, sub: categories.length > 0 ? `${categories.filter(c => c.published !== false).length} faol` : 'Yangi qo\'shing', icon: FolderTree, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', href: '/admin/categories' },
    { label: 'Bugun buyurtmalar', value: todayOrders, sub: `${formatPrice(todayRevenue)} so'm daromad`, icon: ShoppingCart, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', href: '/admin/orders' },
    { label: 'Bugun tashrifchilar', value: todayVisitors, sub: todayVisitors > 0 ? 'Real vaqtda' : 'Kutilmoqda', icon: Users, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', href: '/admin/analytics' },
    { label: 'Do\'kon to\'liqligi', value: `${storeCompletion}%`, sub: `${storeHealth}/${storeTotal} maydon to\'ldirilgan`, icon: Target, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', href: '/admin/store' },
  ];

  return (
    <div className="space-y-6">
      {/* Empty State for New Stores */}
      {isNewStore && (
        <div className="rounded-3xl border-2 border-dashed border-border p-8 sm:p-12 text-center bg-muted/30">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Xush kelibsiz, {brand.displayName}!</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Sizning yangi do'koningiz hozircha bo'sh. Quyidagi tezkor amallardan birini bajarib, birinchi mahsulotingizni qo'shing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all active:scale-[0.98] shadow-sm"
            >
              <Package className="w-4 h-4 stroke-[2.5]" />
              Birinchi mahsulotni qo'shish
            </Link>
            <Link
              to="/admin/store"
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 transition-colors border border-border"
            >
              <Settings className="w-4 h-4" />
              Do'kon ma'lumotlarini to'ldirish
            </Link>
          </div>
        </div>
      )}

      {!isNewStore && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                Boshqaruv markazi
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {brand.displayName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/admin/products/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all active:scale-[0.98] shadow-sm"
              >
                <Package className="w-3.5 h-3.5 stroke-[2.5]" />
                Yangi mahsulot
              </Link>
              <Link
                to="/admin/feed"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all active:scale-[0.98] shadow-sm"
              >
                <Film className="w-3.5 h-3.5" />
                Video qo'shish
              </Link>
              <Link
                to="/admin/store"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Do'kon sozlamalari
              </Link>
            </div>
          </div>

          {/* Primary KPI Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            {kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  to={card.href}
                  className="block p-3 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-6 h-6 rounded-2xl ${card.color} flex items-center justify-center`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <ArrowRight className="w-2.5 h-2.5 text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-xl font-bold text-foreground tabular-nums">{card.value}</div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">{card.label}</div>
                  <div className="text-xs text-muted-foreground/60 mt-0.5">{card.sub}</div>
                </Link>
              );
            })}
          </div>

          {/* Attention Panel */}
          {productsNeedingAttention.length > 0 || storeHealth < storeTotal && (
            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">E'tibor qaratilishi kerak</p>
                  <p className="text-[10px] text-muted-foreground">
                    {productsNeedingAttention.length} ta mahsulotga, {storeTotal - storeHealth} ta to‘liq to‘ldirish kerak
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {productsNeedingAttention.slice(0, 4).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-card border border-border/20 hover:border-primary/30 transition-all"
                  >
                    <XCircle className="w-2.5 h-2.5 text-destructive/60 shrink-0" />
                    <span className="text-[10px] font-medium text-foreground truncate">
                      {item.product.name}: {item.label}
                    </span>
                  </div>
                ))}
                {productsNeedingAttention.length > 4 && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-card border border-border/20 hover:border-primary/30 transition-all">
                    <ArrowRight className="w-2.5 h-2.5 text-primary/60 shrink-0" />
                    <span className="text-[9px] text-muted-foreground/60">
                      +{productsNeedingAttention.length - 4} ta lainnya
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {recentOrders.length > 0 && (
            <div className="rounded-2xl bg-card border border-border p-3 mb-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">Joriy aktivitet</h2>
              <div className="space-y-2">
                {recentOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/50 hover:bg-muted/80 transition-colors">
                    <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-medium text-foreground truncate">
                        Buyurtma #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {order.customer_name || 'Mijoz'} — {formatPrice(order.total)} so'm
                      </p>
                    </div>
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(order.created_at).toLocaleString('uz-UZ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="rounded-2xl bg-card border border-border p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-foreground">Tezkor amallar</h2>
              <Link
                to="/admin/products"
                className="text-[9px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Barchasi
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.path}
                    to={action.path}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/50 text-xs font-medium text-foreground hover:bg-muted/80 transition-all group"
                  >
                    <div className="w-5 h-5 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                      <Icon className="w-3 h-3 text-primary" />
                    </div>
                    <span>{action.label}</span>
                    {action.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-white ml-auto">
                        {action.badge}
                      </span>
                    )}
                    <ArrowRight className="w-2.5 h-2.5 text-primary/60 group-hover:text-primary ml-auto transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Store Status */}
          <div className="rounded-2xl bg-card border border-border p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-foreground">Do'kon holati</h2>
              <Link
                to="/admin/store"
                className="text-[9px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                To‘liq sozlash
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {storeFields.map((field) => (
                <div key={field.label} className="flex items-center justify-between px-2 py-1 rounded-lg bg-muted/50 text-xs font-medium">
                  <span className="text-muted-foreground">{field.label}</span>
                  {field.ok ? (
                    <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-2.5 h-2.5 text-destructive" />
                  )}
                </div>
              ))}
              <div className="col-span-2">
                <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-primary/5 text-xs font-medium text-primary">
                  To‘liqlik: {storeCompletion}%
                  <span className="text-primary/80">To‘liq</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;