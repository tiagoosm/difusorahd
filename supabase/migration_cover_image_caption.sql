-- ============================================================================
-- Migração: Legenda da imagem de capa (Etapa 1 — refatoração do portal)
-- Execute este arquivo no SQL Editor do Supabase (projeto já existente).
-- ============================================================================

-- Legenda opcional exibida abaixo da imagem de capa na página da notícia.
alter table public.news add column if not exists cover_image_caption text;
