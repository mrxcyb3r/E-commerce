-- Migration: Harden analytics authorization (role-blind -> role-aware)
--
-- Replaces the broad "auth manage analytics events" policy
-- (for all to authenticated using (true) with check (true)) with the verified
-- profile-role pattern. Two goals:
--
--   1. READ: only owner/admin can SELECT analytics rows. Anonymous visitors
--      have no SELECT path (the anon INSERT policy remains the only anon policy).
--   2. WRITE: collection keeps working for every caller shape —
--        - anon visitors   -> existing "anon insert analytics events"
--        - authenticated   -> new "Members insert analytics events"
--                             (event_type validity is enforced for ALL writers
--                              by the analytics_events_event_type_check column
--                              constraint, converged by 20260907120000/…08…);
--      UPDATE/DELETE privileges are revoked at the SQL level (no client ever
--      mutates analytics rows through this app).
--
-- The analytics reader RPC get_analytics_events is a SECURITY DEFINER function
-- that BYPASSES RLS and was previously granted to anon with no authorization
-- inside the body — meaning any unauthenticated visitor could dump the entire
-- analytics dataset. It is now role-gated (owner/admin) and anon execute is
-- revoked. All callers (useAnalyticsData, DashboardPage) live behind AdminRoute,
-- so authenticated admin reads keep working unchanged.

-- ============ RLS policies ============
drop policy if exists "auth manage analytics events" on public.analytics_events;

-- Read: owner/admin only. Insert: shape-guarded for any authenticated caller so
-- event collection works when a logged-in staff member browses the storefront.
create policy "Owner select analytics events" on public.analytics_events
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'owner'
    )
  );

create policy "Admin select analytics events" on public.analytics_events
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
      and p2.role = 'admin'
    )
  );

create policy "Members insert analytics events" on public.analytics_events
  for insert to authenticated
  with check (
    length(visitor_id) between 8 and 200
    and length(session_id) between 8 and 200
  );

-- Keep the existing anon collection policy untouched.
-- "anon insert analytics events" (20260903120000) -> unchanged.

-- ============ Grants ============
revoke update, delete on public.analytics_events from authenticated;
grant select, insert on public.analytics_events to authenticated;
grant insert on public.analytics_events to anon;

-- ============ Reader RPC: role-gate the SECURITY DEFINER read path ============
create or replace function public.get_analytics_events(
  p_shop_id text,
  p_limit integer
)
returns setof public.analytics_events
language plpgsql
security definer
set search_path = public, pg_temp
stable
as $$
begin
  if not exists (
    select 1 from public.profiles me
    where me.id = auth.uid()
      and me.role in ('owner', 'admin')
  ) then
    return;
  end if;

  return query
    select *
    from public.analytics_events
    where shop_id = p_shop_id
    order by created_at desc
    limit p_limit;
end;
$$;

revoke execute on function public.get_analytics_events(text, integer) from anon;
grant execute on function public.get_analytics_events(text, integer) to authenticated;
grant execute on function public.get_analytics_events(text, integer) to service_role;