-- ============================================================================
-- Etapa 7 do dashboard de Analytics: retenção de dados (performance + LGPD).
-- Execute no SQL Editor do Supabase.
-- ============================================================================

create extension if not exists pg_cron;

-- 26 meses cobre a comparação "Este ano vs. ano anterior" em qualquer mês do
-- ano (item 12), sem reter eventos indefinidamente (minimização de dados,
-- item 16) nem deixar a tabela crescer sem limite (item 15).
create or replace function public.purge_old_analytics_events()
returns void
language sql
set search_path = public
as $$
  delete from public.analytics_events where created_at < now() - interval '26 months';
$$;

select cron.schedule(
  'purge-old-analytics-events',
  '0 4 1 * *', -- dia 1 de cada mês, 04:00 UTC (baixo tráfego)
  $$select public.purge_old_analytics_events();$$
);
