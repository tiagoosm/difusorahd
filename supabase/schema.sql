-- ============================================================================
-- Portal de Notícias — Schema inicial
-- Execute este arquivo inteiro no SQL Editor do Supabase (Dashboard > SQL Editor).
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'reader');
create type public.news_status as enum ('draft', 'published');
create type public.comment_status as enum ('pending', 'approved', 'rejected');
create type public.ad_position as enum (
  'TOP_HOME',
  'HOME_MIDDLE',
  'ARTICLE_TOP',
  'ARTICLE_BOTTOM',
  'SIDEBAR',
  'FOOTER'
);

-- ----------------------------------------------------------------------------
-- TABLES
-- ----------------------------------------------------------------------------

-- profiles: extensão de auth.users (1:1). Guarda dados públicos + role.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'reader',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is 'Dados públicos de cada usuário autenticado, incluindo o nível de acesso (role).';

-- categories: taxonomia principal das notícias (1 notícia -> 1 categoria).
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);
comment on table public.categories is 'Categorias de notícias (Política, Economia, Esportes, etc).';

-- tags: rótulos livres, N:N com notícias via news_tags.
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);
comment on table public.tags is 'Rótulos livres para notícias, relação N:N via news_tags.';

-- news: entidade central do portal.
create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  audio_url text,
  category_id uuid not null references public.categories (id) on delete restrict,
  author_id uuid not null references public.profiles (id) on delete restrict,
  status public.news_status not null default 'draft',
  is_featured boolean not null default false,
  views_count integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.news is 'Notícias do portal. status=draft não é visível publicamente.';

create index news_category_id_idx on public.news (category_id);
create index news_author_id_idx on public.news (author_id);
create index news_status_published_at_idx on public.news (status, published_at desc);
create index news_is_featured_idx on public.news (is_featured) where is_featured = true;

-- news_tags: tabela de junção N:N entre news e tags.
create table public.news_tags (
  news_id uuid not null references public.news (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (news_id, tag_id)
);
comment on table public.news_tags is 'Junção N:N entre news e tags.';

-- comments: comentários de leitores autenticados em notícias.
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  news_id uuid not null references public.news (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  content text not null,
  status public.comment_status not null default 'pending',
  created_at timestamptz not null default now()
);
comment on table public.comments is 'Comentários de leitores em notícias, moderados por admins (status).';

create index comments_news_id_idx on public.comments (news_id);

-- ads: banners de imagem + link exibidos em posições fixas do site.
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
comment on column public.ads.position is 'Onde o anúncio aparece: TOP_HOME, HOME_MIDDLE, ARTICLE_TOP, ARTICLE_BOTTOM, SIDEBAR, FOOTER.';
comment on column public.ads.priority is 'Entre vários anúncios ativos na mesma posição, o de maior prioridade é exibido.';
comment on column public.ads.active is 'Chave geral liga/desliga, independente do período de exibição.';

create index ads_position_active_priority_idx on public.ads (position, active, priority desc);

-- ----------------------------------------------------------------------------
-- FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------

-- Mantém updated_at sempre atualizado.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_news_updated_at
  before update on public.news
  for each row execute function public.set_updated_at();

create trigger set_ads_updated_at
  before update on public.ads
  for each row execute function public.set_updated_at();

-- Cria automaticamente um profile (role='reader') quando um usuário se cadastra no Supabase Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'reader');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper usado nas policies de RLS: o usuário logado é admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public;

-- Impede que o próprio usuário se promova a admin via update no profile.
-- auth.uid() is null quando o comando roda fora do PostgREST (ex: SQL Editor do
-- Supabase) — nesse caso confiamos no acesso direto ao banco e permitimos a troca.
create or replace function public.prevent_role_escalation()
returns trigger as $$
begin
  if new.role <> old.role and auth.uid() is not null and not public.is_admin() then
    new.role = old.role;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger enforce_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- Incrementa o contador de visualizações de forma segura (sem dar UPDATE público na tabela news).
create or replace function public.increment_news_views(news_slug text)
returns void as $$
begin
  update public.news
  set views_count = views_count + 1
  where slug = news_slug and status = 'published';
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.increment_news_views(text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.news enable row level security;
alter table public.news_tags enable row level security;
alter table public.comments enable row level security;

-- profiles: leitura pública (nome/avatar aparecem como autor nas notícias);
-- e-mail e senha nunca são expostos aqui, continuam só em auth.users.
create policy "profiles_select_all" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- categories: leitura pública, escrita só admin
create policy "categories_select_all" on public.categories
  for select using (true);

create policy "categories_insert_admin" on public.categories
  for insert with check (public.is_admin());

create policy "categories_update_admin" on public.categories
  for update using (public.is_admin()) with check (public.is_admin());

create policy "categories_delete_admin" on public.categories
  for delete using (public.is_admin());

-- tags: leitura pública, escrita só admin
create policy "tags_select_all" on public.tags
  for select using (true);

create policy "tags_insert_admin" on public.tags
  for insert with check (public.is_admin());

create policy "tags_update_admin" on public.tags
  for update using (public.is_admin()) with check (public.is_admin());

create policy "tags_delete_admin" on public.tags
  for delete using (public.is_admin());

-- news: público só vê publicadas; admin vê e gerencia tudo
create policy "news_select_published" on public.news
  for select using (status = 'published');

create policy "news_select_admin" on public.news
  for select using (public.is_admin());

create policy "news_insert_admin" on public.news
  for insert with check (public.is_admin());

create policy "news_update_admin" on public.news
  for update using (public.is_admin()) with check (public.is_admin());

create policy "news_delete_admin" on public.news
  for delete using (public.is_admin());

-- news_tags: segue a visibilidade da notícia relacionada; escrita só admin
create policy "news_tags_select" on public.news_tags
  for select using (
    exists (
      select 1 from public.news n
      where n.id = news_id and (n.status = 'published' or public.is_admin())
    )
  );

create policy "news_tags_insert_admin" on public.news_tags
  for insert with check (public.is_admin());

create policy "news_tags_delete_admin" on public.news_tags
  for delete using (public.is_admin());

-- comments: leitor vê aprovados + os próprios; insere autenticado; admin modera
create policy "comments_select" on public.comments
  for select using (status = 'approved' or user_id = auth.uid() or public.is_admin());

create policy "comments_insert_authenticated" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "comments_update_admin" on public.comments
  for update using (public.is_admin()) with check (public.is_admin());

create policy "comments_delete_own_or_admin" on public.comments
  for delete using (user_id = auth.uid() or public.is_admin());

-- ads: público só vê os "no ar" agora (regra de ativo + período aplicada no banco);
-- admin vê e gerencia tudo.
alter table public.ads enable row level security;

create policy "ads_select_public_valid" on public.ads
  for select using (
    active = true and now() >= start_date and now() <= end_date
  );

create policy "ads_select_admin" on public.ads
  for select using (public.is_admin());

create policy "ads_insert_admin" on public.ads
  for insert with check (public.is_admin());

create policy "ads_update_admin" on public.ads
  for update using (public.is_admin()) with check (public.is_admin());

create policy "ads_delete_admin" on public.ads
  for delete using (public.is_admin());

-- ----------------------------------------------------------------------------
-- STORAGE: bucket único para imagem de capa e áudio das notícias
-- ----------------------------------------------------------------------------
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

create policy "news_media_select_all" on storage.objects
  for select using (bucket_id = 'news-media');

create policy "news_media_insert_admin" on storage.objects
  for insert with check (bucket_id = 'news-media' and public.is_admin());

create policy "news_media_update_admin" on storage.objects
  for update using (bucket_id = 'news-media' and public.is_admin());

create policy "news_media_delete_admin" on storage.objects
  for delete using (bucket_id = 'news-media' and public.is_admin());

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

-- ----------------------------------------------------------------------------
-- SEED: categorias iniciais (opcional, ajuda a testar as próximas etapas)
-- ----------------------------------------------------------------------------
insert into public.categories (name, slug, description) values
  ('Política', 'politica', 'Notícias sobre política nacional e internacional'),
  ('Economia', 'economia', 'Mercado, finanças e negócios'),
  ('Tecnologia', 'tecnologia', 'Inovação, ciência e tecnologia'),
  ('Esportes', 'esportes', 'Futebol e demais esportes'),
  ('Cultura', 'cultura', 'Cinema, música, artes e entretenimento');
