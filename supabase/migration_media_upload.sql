-- ============================================================================
-- Migration: Storage for cover image and audio upload (Stage 14)
-- Run this file in the Supabase SQL Editor (existing project).
-- ============================================================================

-- New column for the article's optional (narration) audio.
alter table public.news add column if not exists audio_url text;

-- Single bucket for both media types, with size limit and accepted file
-- types enforced by Storage itself (not just on the frontend).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'news-media',
  'news-media',
  true,
  20971520, -- 20 MB
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm'
  ]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read (media shows up on the site for any visitor); write only
-- for authenticated admins — same RLS pattern used on "news".
create policy "news_media_select_all" on storage.objects
  for select using (bucket_id = 'news-media');

create policy "news_media_insert_admin" on storage.objects
  for insert with check (bucket_id = 'news-media' and public.is_admin());

create policy "news_media_update_admin" on storage.objects
  for update using (bucket_id = 'news-media' and public.is_admin());

create policy "news_media_delete_admin" on storage.objects
  for delete using (bucket_id = 'news-media' and public.is_admin());
