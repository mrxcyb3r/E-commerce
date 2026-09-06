export type OrderStatus = 'new' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'verifying' | 'refunded' | 'cancelled';
export type DeliveryMethod = 'pickup' | 'delivery' | 'courier';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  size: string | null;
  color: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  shop_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string | null;
  customer_notes: string | null;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  delivery_method: DeliveryMethod;
  tracking_number: string | null;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  currency: string;
  source: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status_type: 'order' | 'payment';
  old_value: string | null;
  new_value: string;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Yangi',
  confirmed: 'Tasdiqlangan',
  preparing: 'Tayyorlanmoqda',
  shipped: 'Jo\'natilgan',
  delivered: 'Yetkazildi',
  cancelled: 'Bekor qilindi',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Kutilmoqda',
  paid: 'To\'langan',
  verifying: 'Tekshirilmoqda',
  refunded: 'Qaytarilgan',
  cancelled: 'Bekor qilingan',
};

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  pickup: 'Olib ketish',
  delivery: 'Yetkazish',
  courier: 'Kuryer',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  confirmed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
  preparing: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  verifying: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  refunded: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
};

export const ORDER_STATUS_FLOW: OrderStatus[] = ['new', 'confirmed', 'preparing', 'shipped', 'delivered'];

export function getNextOrderStatus(current: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUS_FLOW.indexOf(current);
  if (idx < 0 || idx >= ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[idx + 1];
}
