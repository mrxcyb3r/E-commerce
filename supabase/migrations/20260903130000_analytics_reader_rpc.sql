-- Supabase Migration: Analytics Reader RPC
--
-- The storefront app has NO Supabase Auth and the admin dashboard uses the same
-- publishable (anon) client as visitors. To keep the analytics_events table
-- RLS-protected against direct anonymous reads (RLS is enabled with no anon
-- SELECT policy), the dashboard reads through a controlled SECURITY DEFINER
-- function instead of querying the table directly.
--
-- SECURITY DEFINER lets the function run with owner privileges, bypassing RLS
-- for this specific, intentional read path. The table itself remains locked:
-- anonymous visitors cannot SELECT from analytics_events directly.

create or replace function public.get_analytics_events(
  p_shop_id text,
  p_limit integer
)
returns setof public.analytics_events
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select *
  from public.analytics_events
  where shop_id = p_shop_id
  order by created_at desc
  limit p_limit;
$$;

-- Allow anon to call the read function (required so the dashboard works with
-- the publishable-key client). This is the ONLY anonymous read path to the
-- analytics rows.
grant execute on function public.get_analytics_events(text, integer) to anon;
grant execute on function public.get_analytics_events(text, integer) to authenticated;
grant execute on function public.get_analytics_events(text, integer) to service_role;
