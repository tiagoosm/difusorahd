-- ============================================================================
-- Etapa 4 do dashboard de Analytics: funções de agregação para os cards.
-- Execute no SQL Editor do Supabase (Dashboard > SQL Editor).
-- ============================================================================

-- Views + visitantes únicos (count distinct) num intervalo — PostgREST não
-- expõe COUNT(DISTINCT ...) via count=exact, por isso a função. SECURITY
-- INVOKER (padrão, sem "security definer"): roda com o RLS de quem chama,
-- então só admin (via policy analytics_events_select_admin) recebe dados
-- reais — qualquer outro authenticated recebe 0 automaticamente, sem
-- precisar checar is_admin() manualmente aqui.
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

-- Visitantes únicos nos últimos 5 minutos, para o indicador "tempo real".
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
