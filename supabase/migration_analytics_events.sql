-- ============================================================================
-- Etapa 2 do dashboard de Analytics: tabela de eventos de acesso.
-- Execute no SQL Editor do Supabase (Dashboard > SQL Editor).
-- ============================================================================

-- analytics_events: um registro por page view. Não mexe em `news` — contador
-- de views_count e increment_news_views continuam existindo e funcionando
-- exatamente como antes; isso é aditivo.
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

-- Escrita seguindo o mesmo padrão de increment_news_views: função
-- SECURITY DEFINER, sem policy pública de INSERT na tabela. Payload em jsonb
-- porque o evento tem muitos campos opcionais e vai crescer com o tempo.
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

alter table public.analytics_events enable row level security;

-- Só admin lê (nem "authenticated" comum) — leitores nunca veem eventos crus.
create policy "analytics_events_select_admin" on public.analytics_events
  for select using (public.is_admin());

-- Sem policy de INSERT: a única porta de entrada é log_analytics_event().
