import { supabase } from './client';
import type { Order, OrderItem, OrderStatusHistory, OrderStatus, PaymentStatus } from '../../types/order';

export interface OrderFilters {
  status?: OrderStatus | 'all';
  paymentStatus?: PaymentStatus | 'all';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface OrderStats {
  totalOrders: number;
  revenue: number;
  pendingOrders: number;
  pendingPayment: number;
  deliveredOrders: number;
  avgOrderValue: number;
  ordersToday: number;
  revenueToday: number;
}

function mapDbOrder(row: any, items?: any[]): Order {
  return {
    id: row.id,
    shop_id: row.shop_id,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    customer_email: row.customer_email,
    customer_address: row.customer_address,
    customer_notes: row.customer_notes,
    order_status: row.order_status,
    payment_status: row.payment_status,
    payment_method: row.payment_method,
    delivery_method: row.delivery_method,
    tracking_number: row.tracking_number,
    subtotal: row.subtotal,
    delivery_fee: row.delivery_fee,
    discount: row.discount,
    total: row.total,
    currency: row.currency,
    source: row.source,
    tags: row.tags ?? [],
    created_at: row.created_at,
    updated_at: row.updated_at,
    items: items ? items.map(mapDbOrderItem) : undefined,
  };
}

function mapDbOrderItem(row: any): OrderItem {
  return {
    id: row.id,
    order_id: row.order_id,
    product_id: row.product_id,
    product_name: row.product_name,
    product_image: row.product_image,
    product_sku: row.product_sku,
    quantity: row.quantity,
    unit_price: row.unit_price,
    total_price: row.total_price,
    size: row.size,
    color: row.color,
    created_at: row.created_at,
  };
}

export async function fetchOrders(filters: OrderFilters = {}): Promise<{ orders: Order[]; total: number }> {
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('order_status', filters.status);
  }
  if (filters.paymentStatus && filters.paymentStatus !== 'all') {
    query = query.eq('payment_status', filters.paymentStatus);
  }
  if (filters.search) {
    query = query.or(`id.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`);
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo + 'T23:59:59');
  }

  query = query.order('created_at', { ascending: false });

  if (filters.limit) {
    query = query.range(filters.offset ?? 0, (filters.offset ?? 0) + filters.limit - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    orders: (data ?? []).map((row: any) => mapDbOrder(row)),
    total: count ?? 0,
  };
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !order) return null;

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  const { data: history } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  return {
    ...mapDbOrder(order),
    items: (items ?? []).map(mapDbOrderItem),
  };
}

export async function updateOrderStatus(
  orderId: string,
  statusType: 'order' | 'payment',
  newValue: string,
  changedBy: string = 'admin',
  note?: string
): Promise<void> {
  const col = statusType === 'order' ? 'order_status' : 'payment_status';

  const { data: current } = await supabase
    .from('orders')
    .select(col)
    .eq('id', orderId)
    .single();

  const oldValue = current?.[col] ?? null;

  await supabase
    .from('orders')
    .update({ [col]: newValue })
    .eq('id', orderId);

  await supabase
    .from('order_status_history')
    .insert({
      order_id: orderId,
      status_type: statusType,
      old_value: oldValue,
      new_value: newValue,
      changed_by: changedBy,
      note: note ?? null,
    });
}

export async function fetchOrderHistory(orderId: string): Promise<OrderStatusHistory[]> {
  const { data, error } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as OrderStatusHistory[];
}

export async function fetchOrderStats(): Promise<OrderStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const [ordersResult, todayResult] = await Promise.all([
    supabase.from('orders').select('order_status, payment_status, total', { count: 'exact' }),
    supabase.from('orders').select('total').gte('created_at', todayStart),
  ]);

  const orders = ordersResult.data ?? [];
  const todayOrders = todayResult.data ?? [];
  const totalOrders = ordersResult.count ?? 0;

  const revenue = orders
    .filter(o => o.payment_status === 'paid' || o.payment_status === 'verifying')
    .reduce((sum, o) => sum + (o.total ?? 0), 0);

  const pendingOrders = orders.filter(o => o.order_status === 'new' || o.order_status === 'confirmed').length;
  const pendingPayment = orders.filter(o => o.payment_status === 'pending').length;
  const deliveredOrders = orders.filter(o => o.order_status === 'delivered').length;
  const paidOrders = orders.filter(o => o.payment_status === 'paid').length;
  const avgOrderValue = paidOrders > 0 ? Math.round(revenue / paidOrders) : 0;
  const ordersToday = todayOrders.length;
  const revenueToday = todayOrders.reduce((sum, o) => sum + (o.total ?? 0), 0);

  return {
    totalOrders,
    revenue,
    pendingOrders,
    pendingPayment,
    deliveredOrders,
    avgOrderValue,
    ordersToday,
    revenueToday,
  };
}

export async function createOrder(order: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  customer_notes?: string;
  delivery_method?: string;
  payment_method?: string;
  subtotal: number;
  delivery_fee?: number;
  discount?: number;
  total: number;
  items: Array<{
    product_id?: string;
    product_name: string;
    product_image?: string;
    product_sku?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    size?: string;
    color?: string;
  }>;
}): Promise<Order> {
  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email ?? null,
      customer_address: order.customer_address ?? null,
      customer_notes: order.customer_notes ?? null,
      delivery_method: (order.delivery_method as any) ?? 'pickup',
      payment_method: order.payment_method ?? null,
      subtotal: order.subtotal,
      delivery_fee: order.delivery_fee ?? 0,
      discount: order.discount ?? 0,
      total: order.total,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  if (order.items.length > 0) {
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(order.items.map(item => ({
        order_id: newOrder.id,
        product_id: item.product_id ?? null,
        product_name: item.product_name,
        product_image: item.product_image ?? null,
        product_sku: item.product_sku ?? null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        size: item.size ?? null,
        color: item.color ?? null,
      })));

    if (itemsError) throw itemsError;
  }

  await supabase
    .from('order_status_history')
    .insert({
      order_id: newOrder.id,
      status_type: 'order',
      old_value: null,
      new_value: 'new',
      changed_by: 'system',
      note: 'Buyurtma yaratildi',
    });

  return mapDbOrder(newOrder);
}

export async function deleteOrder(orderId: string): Promise<void> {
  await supabase.from('orders').delete().eq('id', orderId);
}
