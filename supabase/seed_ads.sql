-- ============================================================================
-- Anúncios de exemplo, só para validação visual do módulo de anúncios.
-- Pode apagar depois pelo próprio painel admin (/admin/anuncios).
-- Execute no SQL Editor do Supabase.
-- ============================================================================

insert into public.ads (title, image_url, link_url, position, active, start_date, end_date, priority) values
(
  'Exemplo — Topo da Home',
  'https://picsum.photos/seed/ad-top-home/1200/200',
  'https://exemplo.com/anunciante-1',
  'TOP_HOME',
  true,
  now() - interval '1 day',
  now() + interval '30 day',
  10
),
(
  'Exemplo — Meio da Home',
  'https://picsum.photos/seed/ad-home-middle/1200/200',
  'https://exemplo.com/anunciante-2',
  'HOME_MIDDLE',
  true,
  now() - interval '1 day',
  now() + interval '30 day',
  10
),
(
  'Exemplo — Topo da notícia',
  'https://picsum.photos/seed/ad-article-top/1200/200',
  'https://exemplo.com/anunciante-3',
  'ARTICLE_TOP',
  true,
  now() - interval '1 day',
  now() + interval '30 day',
  10
),
(
  'Exemplo — Final da notícia',
  'https://picsum.photos/seed/ad-article-bottom/1200/200',
  'https://exemplo.com/anunciante-5',
  'ARTICLE_BOTTOM',
  true,
  now() - interval '1 day',
  now() + interval '30 day',
  10
);
