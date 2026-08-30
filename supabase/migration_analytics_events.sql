-- ============================================================================
-- Stage 2 of the Analytics dashboard: access events table.
-- Run in the Supabase SQL Editor (Dashboard > SQL Editor).
-- ============================================================================

-- analytics_events: one record per page view. Doesn't touch `news` — the
-- views_count counter and increment_news_views keep existing and working
-- exactly as before; this is additive.
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
comment on table public.analytics_events is 'Portal access events (page views) for the admin analytics dashboard. Written only via log_analytics_event() (SECURITY DEFINER). No personal data: visitor_hash is a non-reversible daily hash computed server-side — the IP is never stored, and there are no cookies or browser storage involved.';
comment on column public.analytics_events.page_type is 'home | news | category | search | other — classified at collection time, avoids parsing `page` in the dashboard queries.';
comment on column public.analytics_events.category_id is 'Denormalized even for page_type=news (copied from the article), to aggregate "performance by category" without a join.';
comment on column public.analytics_events.source is 'Source already classified at collection time: Google, Facebook, Instagram, X, YouTube, WhatsApp, Direto, Referral or Outros.';
comment on column public.analytics_events.visitor_hash is 'sha256(ip + user-agent + salt + date), computed in the serverless function. Rotates daily. Used only to approximate "unique visitors"; the original IP cannot be recovered from it.';

create index analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index analytics_events_page_type_created_at_idx on public.analytics_events (page_type, created_at desc);
create index analytics_events_news_id_idx on public.analytics_events (news_id) where news_id is not null;
create index analytics_events_category_id_idx on public.analytics_events (category_id) where category_id is not null;
create index analytics_events_source_idx on public.analytics_events (source);
create index analytics_events_visitor_hash_created_at_idx on public.analytics_events (visitor_hash, created_at);

-- Writes follow the same pattern as increment_news_views: a SECURITY
-- DEFINER function, no public INSERT policy on the table. Payload as
-- jsonb because the event has many optional fields and will grow over time.
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

-- Only admin reads (not even regular "authenticated") — readers never see raw events.
create policy "analytics_events_select_admin" on public.analytics_events
  for select using (public.is_admin());

-- No INSERT policy: the only way in is log_analytics_event().
