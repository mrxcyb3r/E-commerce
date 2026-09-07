import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Filter,
  ChevronRight,
  RefreshCw,
  Download,
} from 'lucide-react';
import {
  fetchOrders,
  fetchOrderStats,
  type OrderFilters,
} from '../../lib/supabase/orders';
import type { Order, OrderStatus, PaymentStatus } from '../../types/order';
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  DELIVERY_METHOD_LABELS,
} from '../../types/order';
import { EmptyState } from '../../components/admin/ui/EmptyState';
import { formatPrice } from '../../lib/utils';

const STATUS_FILTERS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Barchasi' },
  { key: 'new', label: 'Yangi' },
  { key: 'confirmed', label: 'Tasdiqlangan' },
  { key: 'preparing', label: 'Tayyorlanmoqda' },
  { key: 'shipped', label: 'Jo\'natilgan' },
  { key: 'delivered', label: 'Yetkazildi' },
  { key: 'cancelled', label: 'Bekor qilindi' },
];

const PAYMENT_FILTERS: { key: PaymentStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Barchasi' },
  { key: 'pending', label: 'Kutilmoqda' },
  { key: 'paid', label: 'To\'langan' },
  { key: 'verifying', label: 'Tekshirilmoqda' },
  { key: 'refunded', label: 'Qaytarilgan' },
];

const orderStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'new': return <Clock className="w-3.5 h-3.5" />;
    case 'confirmed': return <CheckCircle2 className="w-3.5 h-3.5" />;
    case 'preparing': return <Package className="w-3.5 h-3.5" />;
    case 'shipped': return <Truck className="w-3.5 h-3.5" />;
    case 'delivered': return <CheckCircle2 className="w-3.5 h-3.5" />;
    case 'cancelled': return <XCircle className="w-3.5 h-3.5" />;
  }
};

export const OrdersListPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0, pendingOrders: 0, pendingPayment: 0, deliveredOrders: 0, avgOrderValue: 0, ordersToday: 0, revenueToday: 0 });

  const loadOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const filters: OrderFilters = {
        status: statusFilter,
        paymentStatus: paymentFilter,
        search: search.trim() || undefined,
      };
      const [result, statsResult] = await Promise.all([
        fetchOrders(filters),
        fetchOrderStats(),
      ]);
      setOrders(result.orders);
      setTotal(result.total);
      setStats(statsResult);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, paymentFilter, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Buyurtmalar
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {total > 0 ? `${total} ta buyurtma` : 'Hali buyurtmalar mavjud emas'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (orders.length === 0) return;
              const header = 'id,customer,phone,total,status,payment,created_at';
              const body = orders.map((o) => [`#${o.id.slice(-8).toUpperCase()}`, `"${o.customer_name}"`, o.customer_phone, o.total, o.order_status, o.payment_status, o.created_at].join(',')).join('\n');
              const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }}
            disabled={orders.length === 0}
            title="Ko‘rinib turgan buyurtmalarni CSV ga eksport qilish"
            className="px-3 py-2 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eksport</span>
          </button>
          <button
            type="button"
            onClick={() => loadOrders(true)}
            disabled={refreshing}
            className="px-3 py-2 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Yangilash</span>
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Jami buyurtmalar', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
          { label: 'Kutilayotganlar', value: stats.pendingOrders, icon: Clock, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
          { label: 'To\'lov kutilmoqda', value: stats.pendingPayment, icon: Package, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
          { label: 'Yetkazilgan', value: stats.deliveredOrders, icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="p-3 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg font-bold text-foreground tabular-nums">{item.value}</div>
              <div className="text-[11px] text-muted-foreground font-medium">{item.label}</div>
            </div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="p-3 rounded-xl bg-card border border-border space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buyurtma raqami, mijoz nomi yoki telefon..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
          <Filter className="w-3 h-3 text-muted-foreground" />

          <div className="flex flex-wrap gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setStatusFilter(f.key)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  statusFilter === f.key
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-border mx-1" />

          <div className="flex flex-wrap gap-1">
            {PAYMENT_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setPaymentFilter(f.key)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  paymentFilter === f.key
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground mt-3">Yuklanmoqda...</p>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          illustration="box"
          title="Hali buyurtmalar mavjud emas"
          description="Mijozlar buyurtma berganda, ular shu yerda ko'rinadi."
        />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-left text-xs border-collapse admin-table-sticky">
              <thead>
                <tr className="border-b border-border text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30">
                  <th className="py-2.5 pl-4 pr-3">Buyurtma</th>
                  <th className="py-2.5 px-3">Mijoz</th>
                  <th className="py-2.5 px-3 hidden sm:table-cell">Summa</th>
                  <th className="py-2.5 px-3">Holat</th>
                  <th className="py-2.5 px-3 hidden md:table-cell">To'lov</th>
                  <th className="py-2.5 px-3 hidden lg:table-cell">Yetkazish</th>
                  <th className="py-2.5 px-3 hidden lg:table-cell">Sana</th>
                  <th className="py-2.5 pr-4 pl-3 text-right"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {orders.map((order) => (
                  <tr key={order.id} className="admin-table-row">
                    <td className="py-3 pl-4 pr-3">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="font-semibold text-foreground hover:text-foreground/80 transition-colors"
                      >
                        #{order.id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-medium text-foreground truncate max-w-[140px]">
                          {order.customer_name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                          {order.customer_phone}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-3 hidden sm:table-cell">
                      <span className="font-semibold text-foreground tabular-nums">
                        {formatPrice(order.total)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${ORDER_STATUS_COLORS[order.order_status]}`}>
                        {orderStatusIcon(order.order_status)}
                        {ORDER_STATUS_LABELS[order.order_status]}
                      </span>
                    </td>
                    <td className="py-3 px-3 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${PAYMENT_STATUS_COLORS[order.payment_status]}`}>
                        {PAYMENT_STATUS_LABELS[order.payment_status]}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground hidden lg:table-cell">
                      {DELIVERY_METHOD_LABELS[order.delivery_method]}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground hidden lg:table-cell">
                      {new Date(order.created_at).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3 pr-4 pl-3 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors inline-flex"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersListPage;
