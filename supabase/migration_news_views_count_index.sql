-- ============================================================================
-- Índice de performance para a seção "Mais Lidas": a query ordena
-- news publicadas por views_count desc, e não havia índice cobrindo isso —
-- funcionaria bem com poucas dezenas/centenas de notícias, mas viraria
-- sequential scan + sort conforme o volume crescesse (item de performance
-- pedido explicitamente na Parte 5/Etapa 6).
-- Execute no SQL Editor do Supabase.
-- ============================================================================

create index news_status_views_count_idx on public.news (status, views_count desc)
  where status = 'published';
