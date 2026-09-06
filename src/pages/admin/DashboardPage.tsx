import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  FolderTree,
  AlertTriangle,
  Plus,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  Film,
  Store,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useBrand } from '../../hooks/useBrand';
import { supabase } from '../../lib/supabase/client';
import { fetchOrders, fetchOrderStats } from '../../lib/supabase/orders';
import type { Order } from '../../types/order';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../types/order';
import { formatPrice } from '../../lib/utils';

export const DashboardPage: React.FC = () => {
  const { products, categories, storeInfo } = useStore();
  const brand = useBrand();

  const [orderCount, setOrderCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [statsResult, ordersResult] = await Promise.all([
          fetchOrderStats(),
          fetchOrders({ limit: 3 }),
        ]);
        if (!active) return;
        setOrderCount(statsResult.totalOrders);
        setRecentOrders(ordersResult.orders);
      } catch {
        // Orders may not exist yet
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const publishedProducts = products.filter(p => p.published !== false);
  const unpublishedProducts = products.filter(p => p.published === false);
  const featuredProducts = products.filter(p => p.isFeatured);
  const outOfStock = products.filter(p => !p.inStock || (p.stockCount !== undefined && p.stockCount <= 0));
  const missingImages = products.filter(p => !p.images || p.images.length === 0);
  const missingCategory = products.filter(p => !p.category);
  const missingPrice = products.filter(p => !p.price || p.price <= 0);

  const issues = [
    ...missingImages.map(p => ({ product: p, issue: 'Rasm yo\'q', path: `/admin/products/${p.id}` })),
    ...missingCategory.map(p => ({ product: p, issue: 'Kategoriya tanlanmagan', path: `/admin/products/${p.id}` })),
    ...missingPrice.map(p => ({ product: p, issue: 'Narx kiritilmagan', path: `/admin/products/${p.id}` })),
    ...outOfStock.map(p => ({ product: p, issue: 'Zaxirada yo\'q', path: `/admin/products/${p.id}` })),
  ];

  const storeFields = [
    { label: 'Do\'kon nomi', ok: !!storeInfo.businessName },
    { label: 'Telefon', ok: !!storeInfo.phone },
    { label: 'Manzil', ok: !!storeInfo.address },
    { label: 'Ish vaqti', ok: !!storeInfo.workingHours },
    { label: 'Logo', ok: !!storeInfo.logoUrl },
  ];
  const storeHealth = storeFields.filter(f => f.ok).length;
  const storeTotal = storeFields.length;

  return (
    <div className="space-y-6">
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all active:scale-[0.98] shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Yangi mahsulot
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Do'kon
          </a>
        </div>
      </div>

      {/* Katalog — Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/admin/products" className="block p-4 rounded-xl bg-card border border-border hover:border-muted-foreground/20 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
          </div>
          <div className="text-xl font-bold text-foreground tabular-nums">{products.length}</div>
          <div className="text-[11px] text-muted-foreground font-medium mt-0.5">Mahsulotlar</div>
          <div className="text-[10px] text-muted-foreground/60 mt-0.5">{publishedProducts.length} ta nashr etilgan</div>
        </Link>

        <Link to="/admin/categories" className="block p-4 rounded-xl bg-card border border-border hover:border-muted-foreground/20 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
          </div>
          <div className="text-xl font-bold text-foreground tabular-nums">{categories.length}</div>
          <div className="text-[11px] text-muted-foreground font-medium mt-0.5">Kategoriyalar</div>
        </Link>

        <Link to="/admin/feed" className="block p-4 rounded-xl bg-card border border-border hover:border-muted-foreground/20 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
          </div>
          <div className="text-xl font-bold text-foreground tabular-nums">{featuredProducts.length}</div>
          <div className="text-[11px] text-muted-foreground font-medium mt-0.5">Mashhur mahsulotlar</div>
        </Link>

        <Link to="/admin/orders" className="block p-4 rounded-xl bg-card border border-border hover:border-muted-foreground/20 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
          </div>
          <div className="text-xl font-bold text-foreground tabular-nums">{orderCount}</div>
          <div className="text-[11px] text-muted-foreground font-medium mt-0.5">Buyurtmalar</div>
          <div className="text-[10px] text-muted-foreground/60 mt-0.5">Telegram/telefon orqali</div>
        </Link>
      </div>

      {/* Attention Required */}
      {issues.length > 0 && (
        <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">Diqqat talab qiladi</p>
              <p className="text-[11px] text-muted-foreground">
                {issues.length} ta mahsulotga e'tibor kerak
              </p>
            </div>
            <Link
              to={`/admin/products?issue=true`}
              className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-[11px] font-semibold hover:bg-muted/80 transition-colors shrink-0"
            >
              Ko'rish
            </Link>
          </div>
          <div className="mt-3 space-y-1.5">
            {issues.slice(0, 3).map((item, i) => (
              <Link
                key={i}
                to={item.path}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-muted-foreground/20 text-[11px] text-muted-foreground hover:text-foreground transition-all"
              >
                <XCircle className="w-3 h-3 text-destructive shrink-0" />
                <span className="truncate">{item.product.name}</span>
                <span className="text-destructive shrink-0">→ {item.issue}</span>
              </Link>
            ))}
            {issues.length > 3 && (
              <p className="text-[10px] text-muted-foreground/60 px-3">+{issues.length - 3} ta boshqa</p>
            )}
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">So'nggi buyurtmalar</h2>
            <Link
              to="/admin/orders"
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Barchasini ko'rish
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {!loading && recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-2.5 text-left">Buyurtma</th>
                      <th className="px-4 py-2.5">Mijoz</th>
                      <th className="px-4 py-2.5 text-right">Summa</th>
                      <th className="px-4 py-2.5">Holat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="admin-table-row">
                        <td className="px-4 py-2.5">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="font-semibold text-foreground hover:text-foreground/80 transition-colors"
                          >
                            #{order.id.slice(-8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5">
                          <p className="text-foreground truncate max-w-[120px]">{order.customer_name}</p>
                          <p className="text-[10px] text-muted-foreground">{order.customer_phone}</p>
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-foreground tabular-nums">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${ORDER_STATUS_COLORS[order.order_status]}`}>
                            {ORDER_STATUS_LABELS[order.order_status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 px-4 text-center">
                <ShoppingCart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground">Hali buyurtmalar yo'q</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mijozlar buyurtma berganda, ular shu yerda ko'rinadi
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Store Health + Quick Actions */}
        <div className="space-y-6">
          {/* Store Health */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Do'kon holati</h2>
              <Link
                to="/admin/store"
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Sozlash
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              {storeFields.map((field) => (
                <div key={field.label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{field.label}</span>
                  {field.ok ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-destructive" />
                  )}
                </div>
              ))}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-foreground">Umumiy holat</span>
                  <span className="font-semibold text-foreground">{storeHealth}/{storeTotal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Tezkor amallar</h2>
            <div className="space-y-2">
              {[
                { label: 'Mahsulot qo\'shish', path: '/admin/products/new', icon: Package },
                { label: 'Kategoriyalar', path: '/admin/categories', icon: FolderTree },
                { label: "Do'konni sozlash", path: '/admin/store', icon: Store },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.path}
                    to={action.path}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-muted-foreground/20 hover:shadow-sm transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{action.label}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors ml-auto" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
