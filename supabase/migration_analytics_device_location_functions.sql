-- ============================================================================
-- Stage 6 of the Analytics dashboard: devices, location and time of day.
-- All SECURITY INVOKER (default) — respect the caller's RLS.
-- Run in the Supabase SQL Editor.
-- ============================================================================

create or replace function public.analytics_by_device(p_start timestamptz, p_end timestamptz)
returns table (device_type text, views bigint)
language sql
stable
set search_path = public
as $$
  select coalesce(device_type, 'Outro') as device_type, count(*) as views
  from public.analytics_events
  where created_at >= p_start and created_at < p_end
  group by 1
  order by views desc;
$$;

grant execute on function public.analytics_by_device(timestamptz, timestamptz) to authenticated;

create or replace function public.analytics_by_os(p_start timestamptz, p_end timestamptz)
returns table (os text, views bigint)
language sql
stable
set search_path = public
as $$
  select coalesce(os, 'Outro') as os, count(*) as views
  from public.analytics_events
  where created_at >= p_start and created_at < p_end
  group by 1
  order by views desc;
$$;

grant execute on function public.analytics_by_os(timestamptz, timestamptz) to authenticated;

create or replace function public.analytics_by_browser(p_start timestamptz, p_end timestamptz)
returns table (browser text, views bigint)
language sql
stable
set search_path = public
as $$
  select coalesce(browser, 'Outro') as browser, count(*) as views
  from public.analytics_events
  where created_at >= p_start and created_at < p_end
  group by 1
  order by views desc;
$$;

grant execute on function public.analytics_by_browser(timestamptz, timestamptz) to authenticated;

-- City is the main level requested (regionally-focused portal); state/country
-- stay available for anyone who wants to aggregate differently in the future.
create or replace function public.analytics_by_location(p_start timestamptz, p_end timestamptz)
returns table (city text, region text, country text, views bigint)
language sql
stable
set search_path = public
as $$
  select coalesce(city, 'Não identificado') as city, region, country, count(*) as views
  from public.analytics_events
  where created_at >= p_start and created_at < p_end
  group by 1, region, country
  order by views desc;
$$;

grant execute on function public.analytics_by_location(timestamptz, timestamptz) to authenticated;

-- Hour of day (0-23) in the Brasília timezone — created_at is UTC, and
-- grouping without converting would shift the chart by 3h, showing the
-- audience peak at the wrong hour for a Brazilian regional portal.
create or replace function public.analytics_by_hour(p_start timestamptz, p_end timestamptz)
returns table (hour int, views bigint)
language sql
stable
set search_path = public
as $$
  select extract(hour from created_at at time zone 'America/Sao_Paulo')::int as hour, count(*) as views
  from public.analytics_events
  where created_at >= p_start and created_at < p_end
  group by 1
  order by 1;
$$;

grant execute on function public.analytics_by_hour(timestamptz, timestamptz) to authenticated;
