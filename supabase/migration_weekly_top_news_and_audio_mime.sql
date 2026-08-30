-- ============================================================================
-- Migration: public weekly "Most Read" ranking + audio formats
-- ============================================================================

-- The Home page's "Most Read" needs to be based on the current week (not
-- all-time via views_count) and is read by any visitor (anon), not just
-- admins. analytics_events already has RLS restricted to admin
-- (analytics_events_select_admin), so a SECURITY DEFINER function — same
-- pattern as increment_news_views and log_analytics_event — exposes only
-- the aggregated ranking (no view counts, no raw analytics data) to the public.
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
    -- Start of the current week (Monday 00:00, Brasília timezone) until now.
    -- Views from previous weeks never enter this window.
    and e.created_at >= (date_trunc('week', now() at time zone 'America/Sao_Paulo')) at time zone 'America/Sao_Paulo'
    and e.created_at < now()
  group by n.id, n.title, n.slug, n.cover_image_url, c.id, c.name, c.slug
  order by count(e.id) desc
  limit p_limit;
$$;

grant execute on function public.public_weekly_top_news(int) to anon, authenticated;

-- The news media bucket only accepted a narrow subset of audio MIME
-- types. Browsers/OSes report variations for the same formats (e.g. M4A
-- can arrive as audio/mp4, audio/x-m4a or audio/m4a; WAV as audio/wav,
-- audio/x-wav or audio/wave) — Storage silently rejected any variation
-- outside the list, with a generic upload error.
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
