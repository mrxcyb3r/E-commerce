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

  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('total, created_at')
          .gte('created_at', new Date().setHours(0, 0, 0, 0))
          .lte('created_at', new Date().setHours(23, 59, 59, 999));
        if (!error && data) {
          const ordersToday = data.length;
          const revenueToday = data.reduce((sum, o) => sum + (o.total || 0), 0);
          setTodayOrders(ordersToday);
          setTodayRevenue(revenueToday);
        }
      } catch (err) {
        console.error('Failed to fetch today stats:', err);
      }
    };
    fetchTodayStats();
  }, []);

  // Popular products by views/orders
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
    { label: 'Mahsulot qo\'shish', path: '/admin/products/new', icon: Package, badges: null },
    { label: 'Video qo\'shish', path: '/admin/feed', icon: Film, badges: null },
    { label: 'Kategoriyalar', path: '/admin/categories', icon: FolderTree, badges: null },
    { label: "Do'konni sozlash", path: '/admin/store', icon: Settings, badges: null },
    { label: 'Bosh sahifa banneri', path: '/admin/homepage', icon: Send, badges: null },
    { label: 'Do\'konni ko\'rish', path: '/', icon: Store, badges: null },
  ];

  return (
    <div className="space-y-6">
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
        <Link to="/admin/products" className="block p-3 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
            <ArrowRight className="w-2.5 h-2.5 text-primary/60 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-xl font-bold text-foreground tabular-nums">{products.length}</div>
          <div className="text-xs text-muted-foreground font-medium mt-1">Jami mahsulotlar</div>
          <div className="text-xs text-muted-foreground/60 mt-0.5">{publishedProducts.length} ta nashr etilgan</div>
        </Link>

        <Link to="/admin/categories" className="block p-3 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <FolderTree className="w-3.5 h-3.5" />
            </div>
            <ArrowRight className="w-2.5 h-2.5 text-primary/60 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-xl font-bold text-foreground tabular-nums">{categories.length}</div>
          <div className="text-xs text-muted-foreground font-medium mt-1">Jami kategoriyalar</div>
        </Link>

        <Link to="/admin/feed" className="block p-3 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Film className="w-3.5 h-3.5" />
            </div>
            <ArrowRight className="w-2.5 h-2.5 text-primary/60 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-xl font-bold text-foreground tabular-nums">{publishedProducts.filter(p => p.category === 'videos' || p.tags?.includes('video')).length}</div>
          <div className="text-xs text-muted-foreground font-medium mt-1">Jami videolar</div>
        </Link>

        <Link to="/admin/store" className="block p-3 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Store className="w-3.5 h-3.5" />
            </div>
            <ArrowRight className="w-2.5 h-2.5 text-primary/60 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-xl font-bold text-foreground tabular-nums">{storeCompletion}%</div>
          <div className="text-xs text-muted-foreground font-medium mt-1">Do'kon to‘liq chalovishoni</div>
          <div className="text-xs text-muted-foreground/60 mt-0.5">{storeHealth}/{storeTotal} tug'ilgan</div>
        </Link>

        <Link to="/admin/orders" className="block p-3 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <ArrowRight className="w-2.5 h-2.5 text-primary/60 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-xl font-bold text-foreground tabular-nums">{todayOrders}</div>
          <div className="text-xs text-muted-foreground font-medium mt-1">Bugun buyurtmalar</div>
          <div className="text-xs text-muted-foreground/60 mt-0.5">{formatPrice(todayRevenue)} so'm</div>
        </Link>
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
    </div>
  );
};

export default DashboardPage;