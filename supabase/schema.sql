-- ============================================================================
-- Difusora HD — Schema inicial
-- Execute este arquivo inteiro no SQL Editor do Supabase (Dashboard > SQL Editor).
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'reader');
create type public.news_status as enum ('draft', 'published');
create type public.ad_position as enum (
  'TOP_HOME',
  'HOME_MIDDLE',
  'ARTICLE_TOP',
  'ARTICLE_BOTTOM',
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
  cover_image_caption text,
  audio_url text,
  category_id uuid not null references public.categories (id) on delete restrict,
  author_id uuid not null references public.profiles (id) on delete restrict,
  status public.news_status not null default 'draft',
  is_featured boolean not null default false,
  featured_position integer,
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
create index news_featured_position_idx on public.news (featured_position) where featured_position is not null;
-- (não há mais índice em views_count: "Mais Lidas" ordena por analytics_events,
-- não pelo contador acumulado — ver public_weekly_top_news)

-- news_tags: tabela de junção N:N entre news e tags.
create table public.news_tags (
  news_id uuid not null references public.news (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (news_id, tag_id)
);
comment on table public.news_tags is 'Junção N:N entre news e tags.';

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
comment on column public.ads.position is 'Onde o anúncio aparece: TOP_HOME, HOME_MIDDLE, ARTICLE_TOP, ARTICLE_BOTTOM, FOOTER.';
comment on column public.ads.priority is 'Entre vários anúncios ativos na mesma posição, o de maior prioridade é exibido.';
comment on column public.ads.active is 'Chave geral liga/desliga, independente do período de exibição.';

create index ads_position_active_priority_idx on public.ads (position, active, priority desc);

-- analytics_events: um registro por page view, para o dashboard de analytics
-- do admin. Não deriva de `news` nem mexe em views_count — é aditivo.
create table public.analytics_events (
  id bigint generated always as identity primary key,
  event_type text not null default 'page_view',
  page text not null,
  page_type text,
  news_id uuid references public.news (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  source text not null default 'Outros',
  device_type text,
  browser text,
  os text,
  country text,
  region text,
  city text,
  visitor_hash text,
  created_at timestamptz not null default now()
);
comment on table public.analytics_events is 'Eventos de acesso ao portal (page views) para o dashboard de analytics do admin. Escrita apenas via log_analytics_event() (SECURITY DEFINER). Sem dados pessoais: visitor_hash é um hash diário não reversível calculado no servidor — o IP nunca é armazenado, e não há cookies nem armazenamento no navegador.';
comment on column public.analytics_events.page_type is 'home | news | category | search | other — classificado na coleta, evita parsear `page` nas queries do dashboard.';
comment on column public.analytics_events.category_id is 'Desnormalizado mesmo em page_type=news (copiado da notícia), para agregar "desempenho por categoria" sem join.';
comment on column public.analytics_events.source is 'Origem já classificada na coleta: Google, Facebook, Instagram, X, YouTube, WhatsApp, Direto, Referral ou Outros.';
comment on column public.analytics_events.visitor_hash is 'sha256(ip + user-agent + sal + data), calculado na função serverless. Rotaciona diariamente. Usado só para aproximar "visitantes únicos"; não permite recuperar o IP original.';

create index analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index analytics_events_page_type_created_at_idx on public.analytics_events (page_type, created_at desc);
create index analytics_events_news_id_idx on public.analytics_events (news_id) where news_id is not null;
create index analytics_events_category_id_idx on public.analytics_events (category_id) where category_id is not null;
create index analytics_events_source_idx on public.analytics_events (source);
create index analytics_events_visitor_hash_created_at_idx on public.analytics_events (visitor_hash, created_at);

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

-- Escrita de eventos de analytics, seguindo o mesmo padrão de
-- increment_news_views: função SECURITY DEFINER, sem policy pública de
-- INSERT na tabela. Payload em jsonb porque o evento tem muitos campos
-- opcionais e a estrutura deve crescer com o tempo.
create or replace function public.log_analytics_event(payload jsonb)
returns void as $$
begin
  insert into public.analytics_events (
    event_type, page, page_type, news_id, category_id,
    referrer_host, utm_source, utm_medium, utm_campaign, source,
    device_type, browser, os, country, region, city, visitor_hash
  ) values (
    coalesce(payload->>'event_type', 'page_view'),
    payload->>'page',
    payload->>'page_type',
    nullif(payload->>'news_id', '')::uuid,
    nullif(payload->>'category_id', '')::uuid,
    payload->>'referrer_host',
    payload->>'utm_source',
    payload->>'utm_medium',
    payload->>'utm_campaign',
    coalesce(payload->>'source', 'Outros'),
    payload->>'device_type',
    payload->>'browser',
    payload->>'os',
    payload->>'country',
    payload->>'region',
    payload->>'city',
    payload->>'visitor_hash'
  );
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.log_analytics_event(jsonb) to anon, authenticated;

-- Views + visitantes únicos (count distinct) num intervalo, para os cards do
-- dashboard de analytics. SECURITY INVOKER (padrão): roda com o RLS de quem
-- chama, então só admin (via policy analytics_events_select_admin) recebe
-- dados reais.
create or replace function public.analytics_summary(p_start timestamptz, p_end timestamptz)
returns table (views bigint, visitors bigint)
language sql
stable
set search_path = public
as $$
  select count(*) as views, count(distinct visitor_hash) as visitors
  from public.analytics_events
  where created_at >= p_start and created_at < p_end;
$$;

grant execute on function public.analytics_summary(timestamptz, timestamptz) to authenticated;

-- Visitantes únicos nos últimos 5 minutos, para o indicador "tempo real".
create or replace function public.analytics_realtime_visitors()
returns bigint
language sql
stable
set search_path = public
as $$
  select count(distinct visitor_hash)
  from public.analytics_events
  where created_at >= now() - interval '5 minutes';
$$;

grant execute on function public.analytics_realtime_visitors() to authenticated;

-- Série temporal de views/visitantes, agrupada por hora ou por dia, para o
-- gráfico de evolução dos acessos.
create or replace function public.analytics_timeseries(p_start timestamptz, p_end timestamptz, p_bucket text default 'day')
returns table (bucket timestamptz, views bigint, visitors bigint)
language sql
stable
set search_path = public
as $$
  select
    date_trunc(case when p_bucket = 'hour' then 'hour' else 'day' end, created_at) as bucket,
    count(*) as views,
    count(distinct visitor_hash) as visitors
  from public.analytics_events
  where created_at >= p_start and created_at < p_end
  group by 1
  order by 1;
$$;

grant execute on function public.analytics_timeseries(timestamptz, timestamptz, text) to authenticated;

-- Origem do tráfego (já classificada na coleta), ordenada por volume.
create or replace function public.analytics_by_source(p_start timestamptz, p_end timestamptz)
returns table (source text, views bigint)
language sql
stable
set search_path = public
as $$
  select source, count(*) as views
  from public.analytics_events
  where created_at >= p_start and created_at < p_end
  group by source
  order by views desc;
$$;

grant execute on function public.analytics_by_source(timestamptz, timestamptz) to authenticated;

-- Desempenho por categoria (nome já resolvido, evita join no cliente).
create or replace function public.analytics_by_category(p_start timestamptz, p_end timestamptz)
returns table (category_id uuid, category_name text, views bigint)
language sql
stable
set search_path = public
as $$
  select e.category_id, c.name as category_name, count(*) as views
  from public.analytics_events e
  join public.categories c on c.id = e.category_id
  where e.created_at >= p_start and e.created_at < p_end and e.category_id is not null
  group by e.category_id, c.name
  order by views desc;
$$;

grant execute on function public.analytics_by_category(timestamptz, timestamptz) to authenticated;

-- Ranking de notícias mais lidas no período, com os dados já resolvidos
-- (título, capa, categoria, publicação) para não precisar de join no cliente.
create or replace function public.analytics_top_news(p_start timestamptz, p_end timestamptz, p_limit int default 10)
returns table (
  news_id uuid,
  title text,
  slug text,
  cover_image_url text,
  category_name text,
  published_at timestamptz,
  views bigint
)
language sql
stable
set search_path = public
as $$
  select n.id, n.title, n.slug, n.cover_image_url, c.name as category_name, n.published_at, count(e.id) as views
  from public.analytics_events e
  join public.news n on n.id = e.news_id
  left join public.categories c on c.id = n.category_id
  where e.created_at >= p_start and e.created_at < p_end and e.news_id is not null
  group by n.id, n.title, n.slug, n.cover_image_url, c.name, n.published_at
  order by views desc
  limit p_limit;
$$;

grant execute on function public.analytics_top_news(timestamptz, timestamptz, int) to authenticated;

-- Páginas mais acessadas (qualquer page_type, não só notícias).
create or replace function public.analytics_top_pages(p_start timestamptz, p_end timestamptz, p_limit int default 10)
returns table (page text, views bigint, visitors bigint)
language sql
stable
set search_path = public
as $$
  select page, count(*) as views, count(distinct visitor_hash) as visitors
  from public.analytics_events
  where created_at >= p_start and created_at < p_end
  group by page
  order by views desc
  limit p_limit;
$$;

grant execute on function public.analytics_top_pages(timestamptz, timestamptz, int) to authenticated;

create or replace function public.analytics_by_device(p_start timestamptz, p_end timestamptz)
returns table (device_type text, views bigint)
language sql
stable
set search_path = public
as $$
  select coalesce(device_type, 'Outro') as device_type, count(*) as views
  from public.analytics_events
  where created_at >= p_start and created_at < p_end
  group by 1
  order by views desc;
$$;

grant execute on function public.analytics_by_device(timestamptz, timestamptz) to authenticated;

create or replace function public.analytics_by_os(p_start timestamptz, p_end timestamptz)
returns table (os text, views bigint)
language sql
stable
set search_path = public
as $$
  select coalesce(os, 'Outro') as os, count(*) as views
  from public.analytics_events
  where created_at >= p_start and created_at < p_end
  group by 1
  order by views desc;
$$;

grant execute on function public.analytics_by_os(timestamptz, timestamptz) to authenticated;

create or replace function public.analytics_by_browser(p_start timestamptz, p_end timestamptz)
returns table (browser text, views bigint)
language sql
stable
set search_path = public
as $$
  select coalesce(browser, 'Outro') as browser, count(*) as views
  from public.analytics_events
  where created_at >= p_start and created_at < p_end
  group by 1
  order by views desc;
$$;

grant execute on function public.analytics_by_browser(timestamptz, timestamptz) to authenticated;

-- Cidade é o nível principal pedido (portal de foco regional); estado/país
-- ficam disponíveis para quem quiser agregar diferente no futuro.
create or replace function public.analytics_by_location(p_start timestamptz, p_end timestamptz)
returns table (city text, region text, country text, views bigint)
language sql
stable
set search_path = public
as $$
  select coalesce(city, 'Não identificado') as city, region, country, count(*) as views
  from public.analytics_events
  where created_at >= p_start and created_at < p_end
  group by 1, region, country
  order by views desc;
$$;

grant execute on function public.analytics_by_location(timestamptz, timestamptz) to authenticated;

-- Hora do dia (0-23) no fuso de Brasília — created_at é UTC, e agrupar sem
-- converter deslocaria o gráfico em 3h, mostrando o pico de audiência na
-- hora errada para um portal regional brasileiro.
create or replace function public.analytics_by_hour(p_start timestamptz, p_end timestamptz)
returns table (hour int, views bigint)
language sql
stable
set search_path = public
as $$
  select extract(hour from created_at at time zone 'America/Sao_Paulo')::int as hour, count(*) as views
  from public.analytics_events
  where created_at >= p_start and created_at < p_end
  group by 1
  order by 1;
$$;

grant execute on function public.analytics_by_hour(timestamptz, timestamptz) to authenticated;

-- Ranking semanal de "Mais Lidas" para a Home — público (anon), diferente das
-- funções analytics_* acima (admin-only). analytics_events tem RLS restrita a
-- admin, então esta função precisa ser SECURITY DEFINER (mesmo padrão de
-- increment_news_views/log_analytics_event) para poder ler os eventos da
-- semana e devolver só o ranking agregado — sem contagem de views, sem
-- nenhum dado bruto de analytics.
--
-- Fallback em cascata pra nunca devolver menos que p_limit (enquanto houver
-- notícia publicada suficiente): semana atual -> semana a semana pra trás
-- (até 12 semanas) -> ranking geral de analytics_events (todo o histórico)
-- -> views_count acumulado. Sempre prioriza o período mais recente e nunca
-- repete uma notícia já escolhida num estágio anterior.
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
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  chosen_ids uuid[] := '{}';
  new_ids uuid[];
  week_start timestamptz;
  week_end timestamptz;
  weeks_checked int := 0;
  max_weeks_back constant int := 12;
begin
  -- Início da semana atual (segunda-feira 00:00, fuso de Brasília) — mesmo
  -- cálculo de antes, só que agora repetido semana a semana pra trás.
  week_start := (date_trunc('week', now() at time zone 'America/Sao_Paulo')) at time zone 'America/Sao_Paulo';
  week_end := now();

  while coalesce(array_length(chosen_ids, 1), 0) < p_limit and weeks_checked < max_weeks_back loop
    select coalesce(array_agg(x.id order by x.views desc), '{}')
    into new_ids
    from (
      select e.news_id as id, count(*) as views
      from public.analytics_events e
      join public.news n on n.id = e.news_id and n.status = 'published'
      where e.page_type = 'news'
        and e.news_id is not null
        and e.created_at >= week_start
        and e.created_at < week_end
        and not (e.news_id = any (chosen_ids))
      group by e.news_id
      order by views desc
      limit (p_limit - coalesce(array_length(chosen_ids, 1), 0))
    ) x;

    chosen_ids := chosen_ids || new_ids;

    week_end := week_start;
    week_start := week_start - interval '7 days';
    weeks_checked := weeks_checked + 1;
  end loop;

  -- Ranking geral de analytics_events (sem filtro de semana), pra quem
  -- ainda não foi escolhido.
  if coalesce(array_length(chosen_ids, 1), 0) < p_limit then
    select coalesce(array_agg(x.id order by x.views desc), '{}')
    into new_ids
    from (
      select e.news_id as id, count(*) as views
      from public.analytics_events e
      join public.news n on n.id = e.news_id and n.status = 'published'
      where e.page_type = 'news'
        and e.news_id is not null
        and not (e.news_id = any (chosen_ids))
      group by e.news_id
      order by views desc
      limit (p_limit - coalesce(array_length(chosen_ids, 1), 0))
    ) x;

    chosen_ids := chosen_ids || new_ids;
  end if;

  -- Último fallback: views_count acumulado da notícia (cobre notícias sem
  -- nenhum evento em analytics_events ainda, ou um site muito novo).
  if coalesce(array_length(chosen_ids, 1), 0) < p_limit then
    select coalesce(array_agg(x.id order by x.views_count desc, x.published_at desc), '{}')
    into new_ids
    from (
      select n.id, n.views_count, n.published_at
      from public.news n
      where n.status = 'published'
        and not (n.id = any (chosen_ids))
      order by n.views_count desc, n.published_at desc
      limit (p_limit - coalesce(array_length(chosen_ids, 1), 0))
    ) x;

    chosen_ids := chosen_ids || new_ids;
  end if;

  return query
    select n.id, n.title, n.slug, n.cover_image_url, c.id, c.name, c.slug
    from unnest(chosen_ids) with ordinality as picked (id, ord)
    join public.news n on n.id = picked.id
    left join public.categories c on c.id = n.category_id
    order by picked.ord;
end;
$$;

grant execute on function public.public_weekly_top_news(int) to anon, authenticated;

-- Retenção de analytics_events: 26 meses cobre a comparação "Este ano vs.
-- ano anterior" em qualquer mês do ano, sem reter eventos indefinidamente
-- (minimização de dados / LGPD) nem deixar a tabela crescer sem limite.
create extension if not exists pg_cron;

create or replace function public.purge_old_analytics_events()
returns void
language sql
set search_path = public
as $$
  delete from public.analytics_events where created_at < now() - interval '26 months';
$$;

select cron.schedule(
  'purge-old-analytics-events',
  '0 4 1 * *', -- dia 1 de cada mês, 04:00 UTC
  $$select public.purge_old_analytics_events();$$
);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.news enable row level security;
alter table public.news_tags enable row level security;
alter table public.analytics_events enable row level security;

-- profiles: leitura pública (nome/avatar aparecem como autor nas notícias);
-- e-mail e senha nunca são expostos aqui, continuam só em auth.users.
create policy "profiles_select_all" on public.profiles
  for select using (true);

-- (select auth.uid()) em vez de auth.uid() direto: avaliado uma vez por
-- query, não uma vez por linha (mesmo resultado, mais barato em escala).
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

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

-- analytics_events: só admin lê (nem "authenticated" comum); leitores nunca
-- veem eventos crus. Sem policy de INSERT — a única porta de entrada é a
-- função log_analytics_event().
create policy "analytics_events_select_admin" on public.analytics_events
  for select using (public.is_admin());

-- ----------------------------------------------------------------------------
-- STORAGE: bucket único para imagem de capa e áudio das notícias
-- ----------------------------------------------------------------------------
-- Lista de MIME types de áudio cobre as variações que navegadores/SO
-- diferentes reportam para o mesmo formato (ex: M4A como audio/mp4,
-- audio/x-m4a ou audio/m4a; WAV como audio/wav, audio/x-wav ou audio/wave) —
-- o Storage rejeita silenciosamente qualquer variação fora da lista.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'news-media',
  'news-media',
  true,
  52428800, -- 50 MB (áudio de narração sem compressão/WAV passa fácil dos 20 MB antigos)
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'audio/mpeg', 'audio/mp3',
    'audio/wav', 'audio/x-wav', 'audio/wave',
    'audio/ogg',
    'audio/mp4', 'audio/x-m4a', 'audio/m4a',
    'audio/aac',
    'audio/webm',
    'audio/flac'
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
