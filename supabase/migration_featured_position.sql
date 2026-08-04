-- ============================================================================
-- Migração: Ordem dos destaques (Etapa 3 — refatoração do portal)
-- Execute este arquivo no SQL Editor do Supabase (projeto já existente).
-- ============================================================================

-- Define a ordem entre as notícias marcadas como destaque (is_featured = true).
-- 1 = destaque principal, 2+ = destaques secundários, em ordem. Nulo = a
-- notícia não está entre os destaques atuais ou ainda não foi ordenada
-- manualmente na página /admin/destaques.
alter table public.news add column if not exists featured_position integer;

create index if not exists news_featured_position_idx
  on public.news (featured_position)
  where featured_position is not null;

-- Backfill: preserva a ordem atual (mais recente primeiro) para quem já
-- estava marcado como destaque antes desta migração.
with ranked as (
  select id, row_number() over (order by published_at desc) as rn
  from public.news
  where is_featured = true and status = 'published'
)
update public.news n
set featured_position = ranked.rn
from ranked
where n.id = ranked.id;
