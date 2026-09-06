-- Supabase Migration: Orders System
-- Creates orders, order_items, and order_status_history tables

-- Orders table
create table if not exists public.orders (
  id text primary key default ('ORD-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  shop_id text not null default 'default',
  
  -- Customer info
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_address text,
  customer_notes text,
  
  -- Order status
  order_status text not null default 'new' check (order_status in (
    'new',           -- Yangi buyurtma
    'confirmed',     -- Tasdiqlangan
    'preparing',     -- Tayyorlanmoqda
    'shipped',       -- Jo'natilgan
    'delivered',     -- Yetkazildi
    'cancelled'      -- Bekor qilindi
  )),
  
  -- Payment status
  payment_status text not null default 'pending' check (payment_status in (
    'pending',       -- Kutilmoqda
    'paid',          -- To'langan
    'verifying',     -- Tekshirilmoqda
    'refunded',      -- Qaytarilgan
    'cancelled'      -- Bekor qilingan
  )),
  payment_method text, -- 'cash', 'card', 'transfer', 'telegram'
  
  -- Fulfillment
  delivery_method text default 'pickup' check (delivery_method in (
    'pickup',        -- Olib ketish
    'delivery',      -- Yetkazish
    'courier'        -- Kuryer
  )),
  tracking_number text,
  
  -- Monetary
  subtotal integer not null default 0,
  delivery_fee integer not null default 0,
  discount integer not null default 0,
  total integer not null default 0,
  currency text not null default 'uzs',
  
  -- Metadata
  source text default 'admin', -- 'admin', 'web', 'telegram'
  tags text[] default '{}',
  
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Order Items table
create table if not exists public.order_items (
  id text primary key default (gen_random_uuid()::text),
  order_id text not null references public.orders on delete cascade,
  product_id text references public.products on delete set null,
  
  product_name text not null,
  product_image text,
  product_sku text,
  
  quantity integer not null default 1 check (quantity > 0),
  unit_price integer not null default 0,
  total_price integer not null default 0,
  
  -- Variant info
  size text,
  color text,
  
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Order Status History
create table if not exists public.order_status_history (
  id text primary key default (gen_random_uuid()::text),
  order_id text not null references public.orders on delete cascade,
  
  status_type text not null check (status_type in ('order', 'payment')),
  old_value text,
  new_value text not null,
  
  changed_by text, -- admin username or 'system'
  note text,
  
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indexes
create index if not exists idx_orders_order_status on public.orders(order_status);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_customer_name on public.orders(customer_name);
create index if not exists idx_orders_id on public.orders(id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);
create index if not exists idx_order_status_history_order_id on public.order_status_history(order_id);

-- Grants
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
grant select, insert, update, delete on public.order_status_history to authenticated;

-- RLS policies
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

-- Admins can manage all orders
create policy "Admins manage orders" on public.orders
  for all using (auth.role() = 'authenticated');

create policy "Admins manage order items" on public.order_items
  for all using (auth.role() = 'authenticated');

create policy "Admins manage order history" on public.order_status_history
  for all using (auth.role() = 'authenticated');

-- Auto-update updated_at
create or replace function update_orders_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger orders_updated_at
  before update on public.orders
  for each row
  execute function update_orders_updated_at();
