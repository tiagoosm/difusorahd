-- ============================================================================
-- Migration: removes the ARTICLE_MIDDLE position entirely (Postgres has no
-- "ALTER TYPE ... DROP VALUE", so we recreate the enum without it).
-- Run this file in the Supabase SQL Editor.
-- ============================================================================

-- 1. Removes ads using the position that's about to stop existing.
delete from public.ads where position = 'ARTICLE_MIDDLE';

-- 2. Renames the current enum (set "aside" until the end of the migration).
alter type public.ad_position rename to ad_position_old;

-- 3. Creates the new enum, already without ARTICLE_MIDDLE.
create type public.ad_position as enum (
  'TOP_HOME',
  'HOME_MIDDLE',
  'ARTICLE_TOP',
  'ARTICLE_BOTTOM',
  'SIDEBAR',
  'FOOTER'
);

-- 4. Migrates the table's column to the new type.
alter table public.ads
  alter column position type public.ad_position
  using position::text::public.ad_position;

-- 5. Drops the old enum, no longer used by anything.
drop type public.ad_position_old;
