-- ============================================================================
-- Migração: correções da auditoria de pontos fracos
-- - RLS re-avaliando auth.uid() por linha (4 policies)
-- - Índice não utilizado (Mais Lidas não usa mais views_count)
-- - audio_url = '' (deveria ser null) de remoções feitas antes do fix no form
-- ============================================================================

-- (select auth.uid()) é avaliado uma vez por query em vez de uma vez por
-- linha — mesmo resultado, mais barato em tabelas grandes.
drop policy "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy "comments_select" on public.comments;
create policy "comments_select" on public.comments
  for select using (status = 'approved' or user_id = (select auth.uid()) or public.is_admin());

drop policy "comments_insert_authenticated" on public.comments;
create policy "comments_insert_authenticated" on public.comments
  for insert with check ((select auth.uid()) = user_id);

drop policy "comments_delete_own_or_admin" on public.comments;
create policy "comments_delete_own_or_admin" on public.comments
  for delete using (user_id = (select auth.uid()) or public.is_admin());

-- Criado quando "Mais Lidas" ordenava por views_count (all-time); hoje usa
-- analytics_events (ranking semanal) — o índice nunca mais foi lido.
drop index if exists public.news_status_views_count_idx;

-- FileUpload salvava '' (string vazia) em vez de null ao remover um arquivo
-- — corrigido no código, isto limpa os registros já afetados.
update public.news set audio_url = null where audio_url = '';
update public.news set cover_image_caption = null where cover_image_caption = '';
