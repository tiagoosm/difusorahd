-- ============================================================================
-- Migration: Cover image caption (Stage 1 — portal refactor)
-- Run this file in the Supabase SQL Editor (existing project).
-- ============================================================================

-- Optional caption shown below the cover image on the article page.
alter table public.news add column if not exists cover_image_caption text;
