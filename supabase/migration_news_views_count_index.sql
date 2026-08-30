-- ============================================================================
-- Performance index for the "Most Read" section: the query orders
-- published news by views_count desc, and there was no index covering
-- this — it would work fine with a few dozen/hundred articles, but would
-- turn into a sequential scan + sort as volume grew (performance item
-- explicitly requested in Part 5/Stage 6).
-- Run in the Supabase SQL Editor.
-- ============================================================================

create index news_status_views_count_idx on public.news (status, views_count desc)
  where status = 'published';
