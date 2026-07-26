-- ============================================================================
-- Migração: Módulo de Anúncios
-- Execute este arquivo no SQL Editor do Supabase.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ENUM de posições — fixo no código/banco, preparado para expansão futura
-- (adicionar uma posição nova = 1 linha aqui, sem precisar de tabela própria).
-- ----------------------------------------------------------------------------
create type public.ad_position as enum (
  'TOP_HOME',
  'HOME_MIDDLE',
  'ARTICLE_TOP',
  'ARTICLE_MIDDLE',
  'ARTICLE_BOTTOM',
  'SIDEBAR',
  'FOOTER'
);

-- ----------------------------------------------------------------------------
-- TABLE: ads
-- ----------------------------------------------------------------------------
create table public.ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  link_url text not null,
  position public.ad_position not null,
  active boolean not null default true,
  start_date timestamptz not null,
  end_date timestamptz not null,
  priority integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ads_date_range_check check (end_date >= start_date)
);
comment on table public.ads is 'Anúncios exibidos em posições fixas do site (banners de imagem + link).';
comment on column public.ads.position is 'Onde o anúncio aparece: TOP_HOME, HOME_MIDDLE, ARTICLE_TOP, ARTICLE_MIDDLE, ARTICLE_BOTTOM, SIDEBAR, FOOTER.';
comment on column public.ads.priority is 'Entre vários anúncios ativos na mesma posição, o de maior prioridade é exibido.';
comment on column public.ads.active is 'Chave geral liga/desliga, independente do período de exibição.';

-- Consulta mais comum: "qual anúncio ativo, dessa posição, com maior prioridade?"
create index ads_position_active_priority_idx on public.ads (position, active, priority desc);

create trigger set_ads_updated_at
  before update on public.ads
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table public.ads enable row level security;

-- Público só vê anúncios realmente "no ar" agora — a regra de negócio
-- (ativo + dentro do período) vive no banco, não só checada no frontend.
create policy "ads_select_public_valid" on public.ads
  for select using (
    active = true and now() >= start_date and now() <= end_date
  );

-- Admin vê tudo (inclusive expirados/futuros/inativos), para poder gerenciar.
create policy "ads_select_admin" on public.ads
  for select using (public.is_admin());

create policy "ads_insert_admin" on public.ads
  for insert with check (public.is_admin());

create policy "ads_update_admin" on public.ads
  for update using (public.is_admin()) with check (public.is_admin());

create policy "ads_delete_admin" on public.ads
  for delete using (public.is_admin());

-- ----------------------------------------------------------------------------
-- STORAGE: bucket para imagens dos anúncios
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ads-images',
  'ads-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "ads_images_select_all" on storage.objects
  for select using (bucket_id = 'ads-images');

create policy "ads_images_insert_admin" on storage.objects
  for insert with check (bucket_id = 'ads-images' and public.is_admin());

create policy "ads_images_update_admin" on storage.objects
  for update using (bucket_id = 'ads-images' and public.is_admin());

create policy "ads_images_delete_admin" on storage.objects
  for delete using (bucket_id = 'ads-images' and public.is_admin());
