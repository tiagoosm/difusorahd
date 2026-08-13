-- ============================================================================
-- Etapa 6 do dashboard de Analytics: dispositivos, localização e horários.
-- Todas SECURITY INVOKER (padrão) — respeitam a RLS de quem chama.
-- Execute no SQL Editor do Supabase.
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

-- Cidade é o nível principal pedido (portal de foco regional); estado/país
-- ficam disponíveis para quem quiser agregar diferente no futuro.
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

-- Hora do dia (0-23) no fuso de Brasília — created_at é UTC, e agrupar sem
-- converter deslocaria o gráfico em 3h, mostrando o pico de audiência na
-- hora errada para um portal regional brasileiro.
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
