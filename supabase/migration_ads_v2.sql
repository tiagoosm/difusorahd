-- ============================================================================
-- Migração: remove a posição ARTICLE_MIDDLE por completo (Postgres não tem
-- "ALTER TYPE ... DROP VALUE", então recriamos o enum sem ela).
-- Execute este arquivo no SQL Editor do Supabase.
-- ============================================================================

-- 1. Remove anúncios que usam a posição que vai deixar de existir.
delete from public.ads where position = 'ARTICLE_MIDDLE';

-- 2. Renomeia o enum atual (fica "de lado" até o fim da migração).
alter type public.ad_position rename to ad_position_old;

-- 3. Cria o novo enum, já sem ARTICLE_MIDDLE.
create type public.ad_position as enum (
  'TOP_HOME',
  'HOME_MIDDLE',
  'ARTICLE_TOP',
  'ARTICLE_BOTTOM',
  'SIDEBAR',
  'FOOTER'
);

-- 4. Migra a coluna da tabela para o novo tipo.
alter table public.ads
  alter column position type public.ad_position
  using position::text::public.ad_position;

-- 5. Remove o enum antigo, que não é mais usado por nada.
drop type public.ad_position_old;
