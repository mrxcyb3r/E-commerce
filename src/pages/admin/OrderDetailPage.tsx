import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  Phone,
  MapPin,
  CreditCard,
  StickyNote,
  ChevronRight,
  User,
  Printer,
  History,
} from 'lucide-react';
import { fetchOrderById, updateOrderStatus, fetchOrderHistory, fetchOrders } from '../../lib/supabase/orders';
import type { Order, OrderStatusHistory } from '../../types/order';
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  DELIVERY_METHOD_LABELS,
  getNextOrderStatus,
} from '../../types/order';
import { formatPrice } from '../../lib/utils';

const statusTimelineIcon = (value: string) => {
  switch (value) {
    case 'new': return <Clock className="w-3.5 h-3.5" />;
    case 'confirmed': return <CheckCircle2 className="w-3.5 h-3.5" />;
    case 'preparing': return <Package className="w-3.5 h-3.5" />;
    case 'shipped': return <Truck className="w-3.5 h-3.5" />;
    case 'delivered': return <CheckCircle2 className="w-3.5 h-3.5" />;
    case 'cancelled': return <XCircle className="w-3.5 h-3.5" />;
    default: return <Clock className="w-3.5 h-3.5" />;
  }
};

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<OrderStatusHistory[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetchOrderById(id),
      fetchOrderHistory(id),
    ]).then(([orderData, historyData]) => {
      setOrder(orderData);
      setHistory(historyData);
      if (orderData?.customer_phone) {
        fetchOrders({ search: orderData.customer_phone }).then((res) => {
          setCustomerOrders(res.orders.filter((o) => o.id !== id).slice(0, 5));
        }).catch(() => undefined);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAdvanceStatus = async () => {
    if (!order) return;
    const next = getNextOrderStatus(order.order_status);
    if (!next) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, 'order', next, 'admin');
      const updated = await fetchOrderById(order.id);
      setOrder(updated);
      const updatedHistory = await fetchOrderHistory(order.id);
      setHistory(updatedHistory);
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!order || order.payment_status === 'paid') return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, 'payment', 'paid', 'admin');
      const updated = await fetchOrderById(order.id);
      setOrder(updated);
      const updatedHistory = await fetchOrderHistory(order.id);
      setHistory(updatedHistory);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm('Buyurtmani bekor qilishni xohlaysizmi?')) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, 'order', 'cancelled', 'admin', 'Bekor qilindi');
      const updated = await fetchOrderById(order.id);
      setOrder(updated);
      const updatedHistory = await fetchOrderHistory(order.id);
      setHistory(updatedHistory);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-muted-foreground">Buyurtma topilmadi</p>
        <Link to="/admin/orders" className="text-xs text-foreground underline mt-2 inline-block">
          Buyurtmalar ro'yxatiga qaytish
        </Link>
      </div>
    );
  }

  const nextStatus = getNextOrderStatus(order.order_status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(order.created_at).toLocaleString('uz-UZ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => window.print()}
            title="Buyurtmani chop etish"
            className="px-3.5 py-2 rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Chop etish
          </button>
          {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (
            <>
              {nextStatus && (
                <button
                  type="button"
                  onClick={handleAdvanceStatus}
                  disabled={updating}
                  className="px-3.5 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
                >
                  {ORDER_STATUS_LABELS[nextStatus]} ga o'tkazish
                </button>
              )}
              {order.payment_status === 'pending' && (
                <button
                  type="button"
                  onClick={handleMarkPaid}
                  disabled={updating}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
                >
                  To'langan deb belgilash
                </button>
              )}
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={updating}
                className="px-3.5 py-2 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-950/50 transition-all disabled:opacity-50"
              >
                Bekor qilish
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Buyurtma tarkibi</h2>
            </div>
            {order.items && order.items.length > 0 ? (
              <div className="divide-y divide-border/50">
                {order.items.map((item) => (
                  <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{item.product_name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                        {item.size && <span>O'lcham: {item.size}</span>}
                        {item.color && <span>Rang: {item.color}</span>}
                        {item.product_sku && <span className="font-mono">{item.product_sku}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-foreground tabular-nums">
                        {formatPrice(item.total_price)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.quantity} x {formatPrice(item.unit_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                Buyurtma tarkibi mavjud emas
              </div>
            )}

            {/* Totals */}
            <div className="px-4 py-3 border-t border-border bg-muted/30 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mahsulotlar</span>
                <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
              </div>
              {order.delivery_fee > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Yetkazish</span>
                  <span className="tabular-nums">{formatPrice(order.delivery_fee)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Chegirma</span>
                  <span className="tabular-nums text-red-500">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t border-border">
                <span>Jami</span>
                <span className="tabular-nums">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          {history.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Tarix</h2>
              </div>
              <div className="px-4 py-3 space-y-3">
                {history.map((h) => (
                  <div key={h.id} className="flex items-start gap-3">
                    <div className="mt-0.5 text-muted-foreground">
                      {statusTimelineIcon(h.new_value)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground">
                        <span className="font-medium">
                          {h.status_type === 'order'
                            ? ORDER_STATUS_LABELS[h.new_value as keyof typeof ORDER_STATUS_LABELS] ?? h.new_value
                            : PAYMENT_STATUS_LABELS[h.new_value as keyof typeof PAYMENT_STATUS_LABELS] ?? h.new_value}
                        </span>
                        {h.old_value && (
                          <span className="text-muted-foreground">
                            {' '}(avval: {h.status_type === 'order'
                              ? ORDER_STATUS_LABELS[h.old_value as keyof typeof ORDER_STATUS_LABELS] ?? h.old_value
                              : PAYMENT_STATUS_LABELS[h.old_value as keyof typeof PAYMENT_STATUS_LABELS] ?? h.old_value})
                          </span>
                        )}
                      </p>
                      {h.note && <p className="text-[10px] text-muted-foreground mt-0.5">{h.note}</p>}
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {new Date(h.created_at).toLocaleString('uz-UZ')}
                        {h.changed_by && ` — ${h.changed_by}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Badges */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Buyurtma holati</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${ORDER_STATUS_COLORS[order.order_status]}`}>
                {statusTimelineIcon(order.order_status)}
                {ORDER_STATUS_LABELS[order.order_status]}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">To'lov holati</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${PAYMENT_STATUS_COLORS[order.payment_status]}`}>
                {PAYMENT_STATUS_LABELS[order.payment_status]}
              </span>
            </div>
            {order.payment_method && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">To'lov usuli</p>
                <p className="text-xs text-foreground">{order.payment_method}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Yetkazish</p>
              <p className="text-xs text-foreground">{DELIVERY_METHOD_LABELS[order.delivery_method]}</p>
            </div>
            {order.tracking_number && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Tracking</p>
                <p className="text-xs text-foreground font-mono">{order.tracking_number}</p>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-foreground">Mijoz</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-foreground">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <a href={`tel:${order.customer_phone}`} className="text-xs text-foreground hover:underline">
                  {order.customer_phone}
                </a>
              </div>
              {order.customer_address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-xs text-foreground">{order.customer_address}</span>
                </div>
              )}
              {order.customer_notes && (
                <div className="flex items-start gap-2.5">
                  <StickyNote className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-xs text-muted-foreground">{order.customer_notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer history */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2.5">
              <History className="w-3.5 h-3.5 text-muted-foreground" /> Mijozning boshqa buyurtmalari
            </h3>
            {customerOrders.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">Bu telefon raqamidan boshqa buyurtma topilmadi.</p>
            ) : (
              <div className="space-y-1.5">
                {customerOrders.map((o) => (
                  <Link key={o.id} to={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-muted/40 hover:bg-muted/70 border border-border/50 text-xs">
                    <span className="font-bold">#{o.id.slice(-8).toUpperCase()}</span>
                    <span className="text-muted-foreground tabular-nums">{formatPrice(o.total)}</span>
                    <span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString('uz-UZ')}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
