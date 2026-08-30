-- ============================================================================
-- Migration: "Most Read" is always full (cascading fallback)
-- Run this file in the Supabase SQL Editor (existing project).
-- ============================================================================

-- Problem: public_weekly_top_news only looked at the current week (Monday
-- 00h until now) and cut off at the limit — if fewer than p_limit articles
-- had views this week (common right after the week rolls over, when
-- traffic hasn't accumulated yet), the Home page showed only 1, 2, 3 or 4
-- articles in "Most Read" instead of 5.
--
-- Cascading fallback, always prioritizing the most recent period and
-- never repeating an already-chosen article:
--   1) views from the current week;
--   2) if not enough, the previous week, then the one before that, up to
--      12 weeks back (analytics_events retention is 26 months — 12 weeks
--      covers the overwhelming majority of real cases without keeping an
--      expensive loop running almost 2 years back every time the Home
--      page loads);
--   3) if still short, the general analytics_events ranking (the whole
--      history, no week filter);
--   4) last resort: the article's accumulated views_count (published_at
--      desc as a tiebreak) — covers the case of a brand-new site, without
--      enough analytics history, but still only real, published articles,
--      never mocked data.
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
  -- Start of the current week (Monday 00:00, Brasília timezone) — same
  -- calculation as before, just now repeated week by week going back.
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

  -- General analytics_events ranking (no week filter), for whoever
  -- hasn't been chosen yet.
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

  -- Last fallback: the article's accumulated views_count (covers articles
  -- with no analytics_events yet, or a very new site).
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
