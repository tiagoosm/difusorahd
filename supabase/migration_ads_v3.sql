-- ============================================================================
-- Migration: removes the SIDEBAR position entirely (same technique used to
-- remove ARTICLE_MIDDLE — Postgres has no "ALTER TYPE ... DROP VALUE").
-- Run this file in the Supabase SQL Editor.
-- ============================================================================

-- 1. Removes ads using the position that's about to stop existing.
delete from public.ads where position = 'SIDEBAR';

-- 2. Renames the current enum.
alter type public.ad_position rename to ad_position_old;

-- 3. Creates the new enum, already without SIDEBAR.
create type public.ad_position as enum (
  'TOP_HOME',
  'HOME_MIDDLE',
  'ARTICLE_TOP',
  'ARTICLE_BOTTOM',
  'FOOTER'
);

-- 4. Migrates the table's column to the new type.
alter table public.ads
  alter column position type public.ad_position
  using position::text::public.ad_position;

-- 5. Drops the old enum.
drop type public.ad_position_old;
