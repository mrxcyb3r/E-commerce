-- Migration: Harden orders authorization (role-blind -> role-aware)
--
-- Replaces the broad "auth.role() = 'authenticated'" policies on orders,
-- order_items and order_status_history with the verified profile-role pattern
-- used across the rest of the app (see 20260610141013_rls_policies.sql).
--
-- Model: orders have NO customer auth uid in the schema (customer identity is
-- free-text name/phone/email; source is 'admin' | 'web' | 'telegram'). There is
-- no customer-facing order flow in the app, so orders are owner/admin-only.
-- The missing customer->order ownership column is a documented schema gap and
-- must NOT be faked by inventing columns in this migration.
--
-- order_status_history is append-only: the client only ever INSERTs status
-- rows (updateOrderStatus). We revoke UPDATE/DELETE grants at the SQL level so
-- the history is tamper-proof even before RLS runs.

-- ============ orders ============
drop policy if exists "Admins manage orders" on public.orders;

create policy "Owner manage orders" on public.orders
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  );

create policy "Admin manage orders" on public.orders
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  );

-- ============ order_items ============
drop policy if exists "Admins manage order items" on public.order_items;

create policy "Owner manage order items" on public.order_items
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  );

create policy "Admin manage order items" on public.order_items
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  );

-- ============ order_status_history (append-only for owner/admin) ============
drop policy if exists "Admins manage order history" on public.order_status_history;

create policy "Owner manage order history" on public.order_status_history
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  );

create policy "Admin manage order history" on public.order_status_history
  for all using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  );

-- ============ Grants ============
-- Revoke mutation on the append-only history. SELECT + INSERT are still granted
-- to authenticated so owner/admin can read and append status rows.
revoke update, delete on public.order_status_history from authenticated;