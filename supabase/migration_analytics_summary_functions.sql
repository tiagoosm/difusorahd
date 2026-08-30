-- ============================================================================
-- Stage 4 of the Analytics dashboard: aggregation functions for the cards.
-- Run in the Supabase SQL Editor (Dashboard > SQL Editor).
-- ============================================================================

-- Views + unique visitors (count distinct) in a range — PostgREST doesn't
-- expose COUNT(DISTINCT ...) via count=exact, hence the function. SECURITY
-- INVOKER (default, no "security definer"): runs with the caller's RLS, so
-- only an admin (via the analytics_events_select_admin policy) gets real
-- data — any other authenticated user gets 0 automatically, with no need
-- to check is_admin() manually here.
create or replace function public.analytics_summary(p_start timestamptz, p_end timestamptz)
returns table (views bigint, visitors bigint)
language sql
stable
set search_path = public
as $$
  select count(*) as views, count(distinct visitor_hash) as visitors
  from public.analytics_events
  where created_at >= p_start and created_at < p_end;
$$;

grant execute on function public.analytics_summary(timestamptz, timestamptz) to authenticated;

-- Unique visitors in the last 5 minutes, for the "real-time" indicator.
create or replace function public.analytics_realtime_visitors()
returns bigint
language sql
stable
set search_path = public
as $$
  select count(distinct visitor_hash)
  from public.analytics_events
  where created_at >= now() - interval '5 minutes';
$$;

grant execute on function public.analytics_realtime_visitors() to authenticated;
