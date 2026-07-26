-- ============================================================================
-- Migração: remove a posição SIDEBAR por completo (mesma técnica usada para
-- remover ARTICLE_MIDDLE — Postgres não tem "ALTER TYPE ... DROP VALUE").
-- Execute este arquivo no SQL Editor do Supabase.
-- ============================================================================

-- 1. Remove anúncios que usam a posição que vai deixar de existir.
delete from public.ads where position = 'SIDEBAR';

-- 2. Renomeia o enum atual.
alter type public.ad_position rename to ad_position_old;

-- 3. Cria o novo enum, já sem SIDEBAR.
create type public.ad_position as enum (
  'TOP_HOME',
  'HOME_MIDDLE',
  'ARTICLE_TOP',
  'ARTICLE_BOTTOM',
  'FOOTER'
);

-- 4. Migra a coluna da tabela para o novo tipo.
alter table public.ads
  alter column position type public.ad_position
  using position::text::public.ad_position;

-- 5. Remove o enum antigo.
drop type public.ad_position_old;
