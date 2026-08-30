-- ============================================================================
-- Stage 7 of the Analytics dashboard: data retention (performance + LGPD).
-- Run in the Supabase SQL Editor.
-- ============================================================================

create extension if not exists pg_cron;

-- 26 months covers the "This year vs. last year" comparison in any month
-- of the year (item 12), without retaining events indefinitely (data
-- minimization, item 16) or letting the table grow without limit (item 15).
create or replace function public.purge_old_analytics_events()
returns void
language sql
set search_path = public
as $$
  delete from public.analytics_events where created_at < now() - interval '26 months';
$$;

select cron.schedule(
  'purge-old-analytics-events',
  '0 4 1 * *', -- 1st of every month, 04:00 UTC (low traffic)
  $$select public.purge_old_analytics_events();$$
);
