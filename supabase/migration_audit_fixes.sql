-- ============================================================================
-- Migration: weak-point audit fixes
-- - RLS re-evaluating auth.uid() per row (4 policies)
-- - Unused index (Most Read no longer uses views_count)
-- - audio_url = '' (should be null) from removals done before the form fix
-- ============================================================================

-- (select auth.uid()) is evaluated once per query instead of once per
-- row — same result, cheaper on large tables.
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

-- Created back when "Most Read" ordered by views_count (all-time); it now
-- uses analytics_events (weekly ranking) — the index has never been read since.
drop index if exists public.news_status_views_count_idx;

-- FileUpload used to save '' (empty string) instead of null when removing
-- a file — fixed in the code, this cleans up the records already affected.
update public.news set audio_url = null where audio_url = '';
update public.news set cover_image_caption = null where cover_image_caption = '';
