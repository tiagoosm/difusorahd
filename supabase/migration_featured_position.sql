-- ============================================================================
-- Migration: Featured order (Stage 3 — portal refactor)
-- Run this file in the Supabase SQL Editor (existing project).
-- ============================================================================

-- Defines the order among articles marked as featured (is_featured = true).
-- 1 = main feature, 2+ = secondary features, in order. Null = the article
-- isn't among the current featured ones, or hasn't been manually ordered
-- on the /admin/destaques page yet.
alter table public.news add column if not exists featured_position integer;

create index if not exists news_featured_position_idx
  on public.news (featured_position)
  where featured_position is not null;

-- Backfill: preserves the current order (most recent first) for whoever
-- was already marked as featured before this migration.
with ranked as (
  select id, row_number() over (order by published_at desc) as rn
  from public.news
  where is_featured = true and status = 'published'
)
update public.news n
set featured_position = ranked.rn
from ranked
where n.id = ranked.id;
