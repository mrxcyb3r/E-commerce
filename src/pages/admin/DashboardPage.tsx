import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  AlertTriangle,
  Plus,
  ExternalLink,
  CheckCircle2,
  Truck,
  CreditCard,
  Boxes,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useI18n } from '../../i18n/I18nContext';
import { useBrand } from '../../hooks/useBrand';
import { supabase } from '../../lib/supabase/client';
import { fetchOrders, fetchOrderStats } from '../../lib/supabase/orders';
import type { Order } from '../../types/order';
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
} from '../../types/order';
import { formatPrice } from '../../lib/utils';
import { motion } from 'motion/react';

export const DashboardPage: React.FC = () => {
  const { products, categories, storeInfo } = useStore();
  const { t } = useI18n();
  const brand = useBrand();

  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
    pendingPayment: 0,
    deliveredOrders: 0,
    avgOrderValue: 0,
    ordersToday: 0,
    revenueToday: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const outOfStockCount = products.filter((p) => !p.inStock || (p.stockCount !== undefined && p.stockCount <= 0)).length;
  const lowStockCount = products.filter((p) => p.inStock && p.stockCount !== undefined && p.stockCount > 0 && p.stockCount <= 3).length;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [statsResult, ordersResult] = await Promise.all([
          fetchOrderStats(),
          fetchOrders({ limit: 5 }),
        ]);
        if (!active) return;
        setStats(statsResult);
        setRecentOrders(ordersResult.orders);
      } catch {
        // Orders may not exist yet
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const stockAlerts = outOfStockCount + lowStockCount;
  const hasOrders = stats.totalOrders > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Boshqaruv markazi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {brand.displayName} — {storeInfo.city || "O'zbekiston"}
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

      {/* Primary KPIs — Commerce First */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[
          {
            label: 'Savdo',
            value: hasOrders ? formatPrice(stats.revenue) : '—',
            sub: hasOrders ? `${stats.ordersToday > 0 ? `Bugun: ${formatPrice(stats.revenueToday)}` : 'Hali savdo yo\'q'}` : 'Buyurtmalar paydo bo\'lganda ko\'rinadi',
            icon: TrendingUp,
            color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          },
          {
            label: 'Buyurtmalar',
            value: stats.totalOrders.toString(),
            sub: stats.pendingOrders > 0 ? `${stats.pendingOrders} ta kutilmoqda` : 'Yangi buyurtmalar yo\'q',
            icon: ShoppingCart,
            color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
            href: '/admin/orders',
          },
          {
            label: 'O\'rtacha summa',
            value: stats.avgOrderValue > 0 ? formatPrice(stats.avgOrderValue) : '—',
            sub: stats.totalOrders > 0 ? `${stats.totalOrders} ta buyurtma asosida` : 'Buyurtmalar asosida',
            icon: CreditCard,
            color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
          },
          {
            label: 'Yetkazilgan',
            value: stats.deliveredOrders.toString(),
            sub: stats.deliveredOrders > 0 ? 'Muvaffaqiyatli' : 'Hali yetkazilmagan',
            icon: Truck,
            color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          const Wrapper = item.href ? Link : 'div';
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.25 }}
            >
              <Wrapper
                to={item.href || ''}
                className="block p-4 rounded-xl bg-card border border-border hover:border-muted-foreground/20 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {item.href && <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />}
                </div>
                <div className="text-xl font-bold text-foreground tabular-nums">{item.value}</div>
                <div className="text-[11px] text-muted-foreground font-medium mt-0.5">{item.label}</div>
                <div className="text-[10px] text-muted-foreground/60 mt-0.5">{item.sub}</div>
              </Wrapper>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Attention Required */}
      {(stockAlerts > 0 || stats.pendingPayment > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-4 rounded-xl bg-accent/5 border border-accent/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">Diqqat talab qiladi</p>
              <p className="text-[11px] text-muted-foreground">
                {stockAlerts > 0 && `${stockAlerts} ta mahsulotga e'tibor kerak`}
                {stockAlerts > 0 && stats.pendingPayment > 0 && ' · '}
                {stats.pendingPayment > 0 && `${stats.pendingPayment} ta to'lov kutilmoqda`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {stats.pendingPayment > 0 && (
                <Link
                  to="/admin/orders?payment=pending"
                  className="px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] font-semibold hover:bg-foreground/90 transition-colors"
                >
                  Buyurtmalar
                </Link>
              )}
              {stockAlerts > 0 && (
                <Link
                  to="/admin/categories"
                  className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-[11px] font-semibold hover:bg-muted/80 transition-colors"
                >
                  Zaxira
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders — 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="lg:col-span-2"
        >
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
            {recentOrders.length > 0 ? (
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
        </motion.div>

        {/* Quick Actions + Secondary — 1 col */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Tezkor amallar */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Tezkor amallar</h2>
            <div className="space-y-2">
              {[
                { label: 'Mahsulot qo\'shish', path: '/admin/products/new', icon: Package },
                { label: 'Buyurtmalarni ko\'rish', path: '/admin/orders', icon: ShoppingCart },
                { label: 'Kategoriyalar', path: '/admin/categories', icon: Boxes },
                { label: 'Do\'konni sozlash', path: '/admin/store', icon: ExternalLink },
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

          {/* Catalog Summary */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Katalog</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/admin/products" className="p-3 rounded-xl bg-card border border-border hover:border-muted-foreground/20 hover:shadow-sm transition-all">
                <div className="text-lg font-bold text-foreground tabular-nums">{products.length}</div>
                <div className="text-[11px] text-muted-foreground">Mahsulotlar</div>
              </Link>
              <Link to="/admin/categories" className="p-3 rounded-xl bg-card border border-border hover:border-muted-foreground/20 hover:shadow-sm transition-all">
                <div className="text-lg font-bold text-foreground tabular-nums">{categories.length}</div>
                <div className="text-[11px] text-muted-foreground">Kategoriyalar</div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
