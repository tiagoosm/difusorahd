-- ============================================================================
-- Migração: ranking semanal público de "Mais Lidas" + formatos de áudio
-- ============================================================================

-- "Mais Lidas" da Home precisa ser por semana atual (não all-time via
-- views_count) e é lida por qualquer visitante (anon), não só admin.
-- analytics_events já tem RLS restrita a admin (analytics_events_select_admin),
-- então uma função SECURITY DEFINER — mesmo padrão de increment_news_views e
-- log_analytics_event — expõe só o ranking agregado (sem contagem de views,
-- sem dados de analytics crus) para o público.
create or replace function public.public_weekly_top_news(p_limit int default 5)
returns table (
  news_id uuid,
  title text,
  slug text,
  cover_image_url text,
  category_id uuid,
  category_name text,
  category_slug text
)
language sql
stable
security definer
set search_path = public
as $$
  select n.id, n.title, n.slug, n.cover_image_url, c.id, c.name, c.slug
  from public.analytics_events e
  join public.news n on n.id = e.news_id and n.status = 'published'
  left join public.categories c on c.id = n.category_id
  where e.page_type = 'news'
    and e.news_id is not null
    -- Início da semana atual (segunda-feira 00:00, fuso de Brasília) até agora.
    -- Views de semanas anteriores nunca entram nessa janela.
    and e.created_at >= (date_trunc('week', now() at time zone 'America/Sao_Paulo')) at time zone 'America/Sao_Paulo'
    and e.created_at < now()
  group by n.id, n.title, n.slug, n.cover_image_url, c.id, c.name, c.slug
  order by count(e.id) desc
  limit p_limit;
$$;

grant execute on function public.public_weekly_top_news(int) to anon, authenticated;

-- Bucket de mídia das notícias aceitava só um subconjunto estreito de MIME
-- types de áudio. Navegadores/SO reportam variações para os mesmos formatos
-- (ex: M4A pode chegar como audio/mp4, audio/x-m4a ou audio/m4a; WAV como
-- audio/wav, audio/x-wav ou audio/wave) — o Storage rejeitava silenciosamente
-- qualquer variação fora da lista, com um erro genérico no upload.
update storage.buckets
set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'audio/mpeg', 'audio/mp3',
  'audio/wav', 'audio/x-wav', 'audio/wave',
  'audio/ogg',
  'audio/mp4', 'audio/x-m4a', 'audio/m4a',
  'audio/aac',
  'audio/webm',
  'audio/flac'
]
where id = 'news-media';
