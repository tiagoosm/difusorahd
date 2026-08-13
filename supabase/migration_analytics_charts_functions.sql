-- ============================================================================
-- Etapa 5 do dashboard de Analytics: funções de agregação para os gráficos.
-- Todas SECURITY INVOKER (padrão) — respeitam a RLS de quem chama, só admin
-- recebe dados reais. Execute no SQL Editor do Supabase.
-- ============================================================================

-- Série temporal de views/visitantes, agrupada por hora ou por dia.
create or replace function public.analytics_timeseries(p_start timestamptz, p_end timestamptz, p_bucket text default 'day')
returns table (bucket timestamptz, views bigint, visitors bigint)
language sql
stable
set search_path = public
as $$
  select
    date_trunc(case when p_bucket = 'hour' then 'hour' else 'day' end, created_at) as bucket,
    count(*) as views,
    count(distinct visitor_hash) as visitors
  from public.analytics_events
  where created_at >= p_start and created_at < p_end
  group by 1
  order by 1;
$$;

grant execute on function public.analytics_timeseries(timestamptz, timestamptz, text) to authenticated;

-- Origem do tráfego (já classificada na coleta), ordenada por volume.
create or replace function public.analytics_by_source(p_start timestamptz, p_end timestamptz)
returns table (source text, views bigint)
language sql
stable
set search_path = public
as $$
  select source, count(*) as views
  from public.analytics_events
  where created_at >= p_start and created_at < p_end
  group by source
  order by views desc;
$$;

grant execute on function public.analytics_by_source(timestamptz, timestamptz) to authenticated;

-- Desempenho por categoria (nome já resolvido, evita join no cliente).
create or replace function public.analytics_by_category(p_start timestamptz, p_end timestamptz)
returns table (category_id uuid, category_name text, views bigint)
language sql
stable
set search_path = public
as $$
  select e.category_id, c.name as category_name, count(*) as views
  from public.analytics_events e
  join public.categories c on c.id = e.category_id
  where e.created_at >= p_start and e.created_at < p_end and e.category_id is not null
  group by e.category_id, c.name
  order by views desc;
$$;

grant execute on function public.analytics_by_category(timestamptz, timestamptz) to authenticated;

-- Ranking de notícias mais lidas no período, com os dados já resolvidos
-- (título, capa, categoria, publicação) para não precisar de join no cliente.
create or replace function public.analytics_top_news(p_start timestamptz, p_end timestamptz, p_limit int default 10)
returns table (
  news_id uuid,
  title text,
  slug text,
  cover_image_url text,
  category_name text,
  published_at timestamptz,
  views bigint
)
language sql
stable
set search_path = public
as $$
  select n.id, n.title, n.slug, n.cover_image_url, c.name as category_name, n.published_at, count(e.id) as views
  from public.analytics_events e
  join public.news n on n.id = e.news_id
  left join public.categories c on c.id = n.category_id
  where e.created_at >= p_start and e.created_at < p_end and e.news_id is not null
  group by n.id, n.title, n.slug, n.cover_image_url, c.name, n.published_at
  order by views desc
  limit p_limit;
$$;

grant execute on function public.analytics_top_news(timestamptz, timestamptz, int) to authenticated;

-- Páginas mais acessadas (qualquer page_type, não só notícias).
create or replace function public.analytics_top_pages(p_start timestamptz, p_end timestamptz, p_limit int default 10)
returns table (page text, views bigint, visitors bigint)
language sql
stable
set search_path = public
as $$
  select page, count(*) as views, count(distinct visitor_hash) as visitors
  from public.analytics_events
  where created_at >= p_start and created_at < p_end
  group by page
  order by views desc
  limit p_limit;
$$;

grant execute on function public.analytics_top_pages(timestamptz, timestamptz, int) to authenticated;
