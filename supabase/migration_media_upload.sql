-- ============================================================================
-- Migração: Storage para upload de imagem de capa e áudio (Etapa 14)
-- Execute este arquivo no SQL Editor do Supabase (projeto já existente).
-- ============================================================================

-- Nova coluna para o áudio (narração) opcional da notícia.
alter table public.news add column if not exists audio_url text;

-- Bucket único para os dois tipos de mídia, com limite de tamanho e
-- tipos de arquivo aceitos garantidos pelo próprio Storage (não só no frontend).
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

-- Leitura pública (as mídias aparecem no site para qualquer visitante);
-- escrita só para admins autenticados — mesmo padrão de RLS usado em "news".
create policy "news_media_select_all" on storage.objects
  for select using (bucket_id = 'news-media');

create policy "news_media_insert_admin" on storage.objects
  for insert with check (bucket_id = 'news-media' and public.is_admin());

create policy "news_media_update_admin" on storage.objects
  for update using (bucket_id = 'news-media' and public.is_admin());

create policy "news_media_delete_admin" on storage.objects
  for delete using (bucket_id = 'news-media' and public.is_admin());
