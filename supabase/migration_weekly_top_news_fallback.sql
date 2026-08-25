-- ============================================================================
-- Migração: "Mais Lidas" sempre completa (fallback em cascata)
-- Execute este arquivo no SQL Editor do Supabase (projeto já existente).
-- ============================================================================

-- Problema: public_weekly_top_news só olhava a semana atual (segunda 00h
-- até agora) e cortava no limit — se menos de p_limit notícias tivessem
-- visualização essa semana (comum logo após a virada de semana, quando o
-- tráfego ainda não se acumulou), a Home mostrava só 1, 2, 3 ou 4 notícias
-- em "Mais Lidas" em vez de 5.
--
-- Fallback em cascata, sempre priorizando o período mais recente e nunca
-- repetindo uma notícia já escolhida:
--   1) visualizações da semana atual;
--   2) se não completou, semana anterior, depois a anterior a essa, até
--      12 semanas pra trás (retenção de analytics_events é 26 meses —
--      12 semanas cobre a esmagadora maioria dos casos reais sem manter
--      um loop caro rodando quase 2 anos pra trás toda vez que a Home
--      carrega);
--   3) se ainda faltar, ranking geral de analytics_events (todo o
--      histórico, sem filtro de semana);
--   4) último recurso: views_count acumulado da notícia (published_at
--      desc como desempate) — cobre o caso de um site novo, sem histórico
--      de analytics suficiente, mas ainda assim só notícias reais e
--      publicadas, nunca dado mockado.
create or replace function public.public_weekly_top_news(p_limit int default 5)
returns table (
  news_id uuid,
  title text,
  slug text,
  cover_image_url text,
  category_id uuid,
  category_name text,
  category_slug text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  chosen_ids uuid[] := '{}';
  new_ids uuid[];
  week_start timestamptz;
  week_end timestamptz;
  weeks_checked int := 0;
  max_weeks_back constant int := 12;
begin
  -- Início da semana atual (segunda-feira 00:00, fuso de Brasília) — mesmo
  -- cálculo de antes, só que agora repetido semana a semana pra trás.
  week_start := (date_trunc('week', now() at time zone 'America/Sao_Paulo')) at time zone 'America/Sao_Paulo';
  week_end := now();

  while coalesce(array_length(chosen_ids, 1), 0) < p_limit and weeks_checked < max_weeks_back loop
    select coalesce(array_agg(x.id order by x.views desc), '{}')
    into new_ids
    from (
      select e.news_id as id, count(*) as views
      from public.analytics_events e
      join public.news n on n.id = e.news_id and n.status = 'published'
      where e.page_type = 'news'
        and e.news_id is not null
        and e.created_at >= week_start
        and e.created_at < week_end
        and not (e.news_id = any (chosen_ids))
      group by e.news_id
      order by views desc
      limit (p_limit - coalesce(array_length(chosen_ids, 1), 0))
    ) x;

    chosen_ids := chosen_ids || new_ids;

    week_end := week_start;
    week_start := week_start - interval '7 days';
    weeks_checked := weeks_checked + 1;
  end loop;

  -- Ranking geral de analytics_events (sem filtro de semana), pra quem
  -- ainda não foi escolhido.
  if coalesce(array_length(chosen_ids, 1), 0) < p_limit then
    select coalesce(array_agg(x.id order by x.views desc), '{}')
    into new_ids
    from (
      select e.news_id as id, count(*) as views
      from public.analytics_events e
      join public.news n on n.id = e.news_id and n.status = 'published'
      where e.page_type = 'news'
        and e.news_id is not null
        and not (e.news_id = any (chosen_ids))
      group by e.news_id
      order by views desc
      limit (p_limit - coalesce(array_length(chosen_ids, 1), 0))
    ) x;

    chosen_ids := chosen_ids || new_ids;
  end if;

  -- Último fallback: views_count acumulado da notícia (cobre notícias sem
  -- nenhum evento em analytics_events ainda, ou um site muito novo).
  if coalesce(array_length(chosen_ids, 1), 0) < p_limit then
    select coalesce(array_agg(x.id order by x.views_count desc, x.published_at desc), '{}')
    into new_ids
    from (
      select n.id, n.views_count, n.published_at
      from public.news n
      where n.status = 'published'
        and not (n.id = any (chosen_ids))
      order by n.views_count desc, n.published_at desc
      limit (p_limit - coalesce(array_length(chosen_ids, 1), 0))
    ) x;

    chosen_ids := chosen_ids || new_ids;
  end if;

  return query
    select n.id, n.title, n.slug, n.cover_image_url, c.id, c.name, c.slug
    from unnest(chosen_ids) with ordinality as picked (id, ord)
    join public.news n on n.id = picked.id
    left join public.categories c on c.id = n.category_id
    order by picked.ord;
end;
$$;

grant execute on function public.public_weekly_top_news(int) to anon, authenticated;
