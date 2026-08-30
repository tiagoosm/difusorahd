-- ============================================================================
-- Difusora HD — Initial schema
-- Run this entire file in the Supabase SQL Editor (Dashboard > SQL Editor).
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

-- profiles: extension of auth.users (1:1). Holds public data + role.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'reader',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is 'Public data for each authenticated user, including the access level (role).';

-- categories: main taxonomy for articles (1 article -> 1 category).
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);
comment on table public.categories is 'Article categories (Politics, Economy, Sports, etc).';

-- tags: free-form labels, N:N with articles via news_tags.
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);
comment on table public.tags is 'Free-form labels for articles, N:N relationship via news_tags.';

-- news: the portal's central entity.
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
comment on table public.news is 'Portal articles. status=draft is not publicly visible.';

create index news_category_id_idx on public.news (category_id);
create index news_author_id_idx on public.news (author_id);
create index news_status_published_at_idx on public.news (status, published_at desc);
create index news_is_featured_idx on public.news (is_featured) where is_featured = true;
create index news_featured_position_idx on public.news (featured_position) where featured_position is not null;
-- (no more index on views_count: "Most Read" orders by analytics_events,
-- not by the accumulated counter — see public_weekly_top_news)

-- news_tags: N:N junction table between news and tags.
create table public.news_tags (
  news_id uuid not null references public.news (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (news_id, tag_id)
);
comment on table public.news_tags is 'N:N junction between news and tags.';

-- ads: image + link banners shown in fixed positions on the site.
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
comment on table public.ads is 'Ads shown in fixed positions on the site (image banners + link).';
comment on column public.ads.position is 'Where the ad appears: TOP_HOME, HOME_MIDDLE, ARTICLE_TOP, ARTICLE_BOTTOM, FOOTER.';
comment on column public.ads.priority is 'Among several active ads in the same position, the one with the highest priority is shown.';
comment on column public.ads.active is 'Overall on/off switch, independent of the display date range.';

create index ads_position_active_priority_idx on public.ads (position, active, priority desc);

-- analytics_events: one record per page view, for the admin's analytics
-- dashboard. Doesn't derive from `news` nor touch views_count — it's additive.
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

-- ----------------------------------------------------------------------------
-- FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------

-- Keeps updated_at always current.
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

-- Automatically creates a profile (role='reader') when a user signs up via Supabase Auth.
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

-- Helper used in RLS policies: is the logged-in user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public;

-- Prevents a user from promoting themselves to admin via a profile update.
-- auth.uid() is null when the command runs outside PostgREST (e.g. the
-- Supabase SQL Editor) — in that case we trust direct database access and allow the change.
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

-- Safely increments the view counter (without giving public UPDATE access to the news table).
create or replace function public.increment_news_views(news_slug text)
returns void as $$
begin
  update public.news
  set views_count = views_count + 1
  where slug = news_slug and status = 'published';
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.increment_news_views(text) to anon, authenticated;

-- Writes analytics events, following the same pattern as
-- increment_news_views: a SECURITY DEFINER function, no public INSERT
-- policy on the table. Payload as jsonb because the event has many
-- optional fields and the structure is expected to grow over time.
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

-- Views + unique visitors (count distinct) in a range, for the analytics
-- dashboard's cards. SECURITY INVOKER (default): runs with the caller's
-- RLS, so only admin (via the analytics_events_select_admin policy) gets real data.
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

-- Unique visitors in the last 5 minutes, for the "real-time" indicator.
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

-- Time series of views/visitors, grouped by hour or by day, for the
-- traffic evolution chart.
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

-- Traffic source (already classified at collection time), ordered by volume.
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

-- Performance by category (name already resolved, avoids a join on the client).
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

-- Ranking of the most-read articles in the period, with the data already
-- resolved (title, cover, category, publication) so no join is needed on the client.
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

-- Most visited pages (any page_type, not just articles).
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

-- City is the main level requested (regionally-focused portal); state/country
-- stay available for anyone who wants to aggregate differently in the future.
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

-- Hour of day (0-23) in the Brasília timezone — created_at is UTC, and
-- grouping without converting would shift the chart by 3h, showing the
-- audience peak at the wrong hour for a Brazilian regional portal.
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

-- Weekly "Most Read" ranking for the Home page — public (anon), unlike the
-- analytics_* functions above (admin-only). analytics_events has RLS
-- restricted to admin, so this function needs to be SECURITY DEFINER
-- (same pattern as increment_news_views/log_analytics_event) to be able
-- to read the week's events and return only the aggregated ranking — no
-- view counts, no raw analytics data.
--
-- Cascading fallback so it never returns less than p_limit (as long as
-- there are enough published articles): current week -> week by week
-- going back (up to 12 weeks) -> general analytics_events ranking (the
-- whole history) -> accumulated views_count. Always prioritizes the most
-- recent period and never repeats an article already chosen in an earlier stage.
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
  -- Start of the current week (Monday 00:00, Brasília timezone) — same
  -- calculation as before, just now repeated week by week going back.
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

  -- General analytics_events ranking (no week filter), for whoever
  -- hasn't been chosen yet.
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

  -- Last fallback: the article's accumulated views_count (covers articles
  -- with no analytics_events yet, or a very new site).
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

-- analytics_events retention: 26 months covers the "This year vs. last
-- year" comparison in any month of the year, without retaining events
-- indefinitely (data minimization / LGPD) or letting the table grow without limit.
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
  '0 4 1 * *', -- 1st of every month, 04:00 UTC
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

-- profiles: public read (name/avatar show up as the author on articles);
-- email and password are never exposed here, they stay only in auth.users.
create policy "profiles_select_all" on public.profiles
  for select using (true);

-- (select auth.uid()) instead of auth.uid() directly: evaluated once per
-- query, not once per row (same result, cheaper at scale).
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- categories: public read, admin-only write
create policy "categories_select_all" on public.categories
  for select using (true);

create policy "categories_insert_admin" on public.categories
  for insert with check (public.is_admin());

create policy "categories_update_admin" on public.categories
  for update using (public.is_admin()) with check (public.is_admin());

create policy "categories_delete_admin" on public.categories
  for delete using (public.is_admin());

-- tags: public read, admin-only write
create policy "tags_select_all" on public.tags
  for select using (true);

create policy "tags_insert_admin" on public.tags
  for insert with check (public.is_admin());

create policy "tags_update_admin" on public.tags
  for update using (public.is_admin()) with check (public.is_admin());

create policy "tags_delete_admin" on public.tags
  for delete using (public.is_admin());

-- news: the public only sees published ones; admin sees and manages everything
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

-- news_tags: follows the related article's visibility; admin-only write
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

-- ads: the public only sees ones "live" right now (active + date-range
-- rule enforced in the database); admin sees and manages everything.
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

-- analytics_events: only admin reads (not even regular "authenticated");
-- readers never see raw events. No INSERT policy — the only way in is the
-- log_analytics_event() function.
create policy "analytics_events_select_admin" on public.analytics_events
  for select using (public.is_admin());

-- ----------------------------------------------------------------------------
-- SWEEPSTAKES: participant registration ("Sorteio")
-- ----------------------------------------------------------------------------
create type public.sweepstakes_participant_status as enum ('registered', 'winner', 'disqualified');

-- Personal data of whoever registered to enter. Minimization (LGPD): only
-- the fields needed to identify the participant and deliver the prize.
create table public.sweepstakes_participants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  -- Digits only (e.g. "35999998888") — used to check for duplicates and
  -- search without depending on how the phone was typed/formatted.
  phone_normalized text not null,
  rg text not null,
  -- Uppercase alphanumeric only — same reason as phone_normalized.
  rg_normalized text not null,
  address_street text not null,
  address_number text not null,
  address_complement text,
  address_neighborhood text not null,
  address_city text not null,
  address_state text not null,
  address_zip_code text,
  status public.sweepstakes_participant_status not null default 'registered',
  consent_accepted boolean not null default false,
  consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Database-level lock: no row exists without consent, even if some new
  -- code path forgets to check this on the frontend.
  constraint sweepstakes_participants_consent_check check (consent_accepted = true)
);
comment on table public.sweepstakes_participants is 'Registrations for the sweepstakes promoted by Difusora HD. Sensitive personal data (ID document, phone, address) — access restricted to admins via RLS, never exposed to the public.';
comment on column public.sweepstakes_participants.status is 'registered = default registration; winner = drawn as a winner; disqualified = disqualified by the admin (e.g. invalid data found manually).';
comment on column public.sweepstakes_participants.consent_at is 'Date/time the (LGPD) consent was recorded.';

-- Unique by normalized version: "(35) 99999-8888" and "35999998888" are
-- the same phone number, and can't produce two registrations.
create unique index sweepstakes_participants_phone_normalized_key
  on public.sweepstakes_participants (phone_normalized);
create unique index sweepstakes_participants_rg_normalized_key
  on public.sweepstakes_participants (rg_normalized);
create index sweepstakes_participants_created_at_idx
  on public.sweepstakes_participants (created_at desc);
create index sweepstakes_participants_status_idx
  on public.sweepstakes_participants (status);

create trigger set_sweepstakes_participants_updated_at
  before update on public.sweepstakes_participants
  for each row execute function public.set_updated_at();

alter table public.sweepstakes_participants enable row level security;

-- Only admin reads, updates (e.g. changes status) or deletes. No public
-- INSERT policy — registration only happens via
-- register_sweepstakes_participant() (SECURITY DEFINER), same pattern as
-- log_analytics_event/increment_news_views: the public never has direct
-- write access to the table, only through a function that controls
-- exactly which fields can be written and validates everything server-side.
create policy "sweepstakes_participants_select_admin" on public.sweepstakes_participants
  for select using (public.is_admin());

create policy "sweepstakes_participants_update_admin" on public.sweepstakes_participants
  for update using (public.is_admin()) with check (public.is_admin());

create policy "sweepstakes_participants_delete_admin" on public.sweepstakes_participants
  for delete using (public.is_admin());

-- Public registration. Re-validates everything server-side (never trusts
-- just the frontend form), normalizes phone/ID document, and translates
-- the uniqueness violation into a clear error instead of Postgres's
-- technical text. Returns only the new registration's id — never the
-- personal data back.
create or replace function public.register_sweepstakes_participant(
  p_full_name text,
  p_phone text,
  p_rg text,
  p_address_street text,
  p_address_number text,
  p_address_complement text,
  p_address_neighborhood text,
  p_address_city text,
  p_address_state text,
  p_address_zip_code text,
  p_consent_accepted boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_phone_normalized text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_rg_normalized text := upper(regexp_replace(coalesce(p_rg, ''), '[^0-9A-Za-z]', '', 'g'));
  v_id uuid;
begin
  if p_consent_accepted is distinct from true then
    raise exception 'É necessário aceitar os termos para participar.';
  end if;

  -- Simple heuristic for an "obviously invalid name": requires a first
  -- and last name (at least one space) and a plausible minimum length.
  if p_full_name is null or length(trim(p_full_name)) < 5 or position(' ' in trim(p_full_name)) = 0 then
    raise exception 'Informe seu nome completo.';
  end if;

  if length(v_phone_normalized) < 10 or length(v_phone_normalized) > 11 then
    raise exception 'Informe um telefone válido.';
  end if;

  if length(v_rg_normalized) < 5 then
    raise exception 'Informe um RG válido.';
  end if;

  if p_address_street is null or trim(p_address_street) = ''
     or p_address_number is null or trim(p_address_number) = ''
     or p_address_neighborhood is null or trim(p_address_neighborhood) = ''
     or p_address_city is null or trim(p_address_city) = ''
     or p_address_state is null or trim(p_address_state) = '' then
    raise exception 'Informe seu endereço completo.';
  end if;

  begin
    insert into public.sweepstakes_participants (
      full_name, phone, phone_normalized, rg, rg_normalized,
      address_street, address_number, address_complement, address_neighborhood,
      address_city, address_state, address_zip_code,
      consent_accepted, consent_at
    ) values (
      trim(p_full_name), p_phone, v_phone_normalized, p_rg, v_rg_normalized,
      trim(p_address_street), trim(p_address_number), nullif(trim(coalesce(p_address_complement, '')), ''),
      trim(p_address_neighborhood), trim(p_address_city), upper(trim(p_address_state)),
      nullif(regexp_replace(coalesce(p_address_zip_code, ''), '\D', '', 'g'), ''),
      true, now()
    )
    returning id into v_id;
  exception
    when unique_violation then
      raise exception 'Você já está cadastrado neste sorteio.';
  end;

  return v_id;
end;
$$;

grant execute on function public.register_sweepstakes_participant(
  text, text, text, text, text, text, text, text, text, text, boolean
) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- STORAGE: single bucket for article cover images and audio
-- ----------------------------------------------------------------------------
-- The audio MIME type list covers the variations different browsers/OSes
-- report for the same format (e.g. M4A as audio/mp4, audio/x-m4a or
-- audio/m4a; WAV as audio/wav, audio/x-wav or audio/wave) — Storage
-- silently rejects any variation outside the list.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'news-media',
  'news-media',
  true,
  52428800, -- 50 MB (uncompressed/WAV narration audio easily passes the old 20 MB)
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
-- STORAGE: bucket for ad images
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
-- SEED: initial categories (optional, helps test the next stages)
-- ----------------------------------------------------------------------------
insert into public.categories (name, slug, description) values
  ('Política', 'politica', 'Notícias sobre política nacional e internacional'),
  ('Economia', 'economia', 'Mercado, finanças e negócios'),
  ('Tecnologia', 'tecnologia', 'Inovação, ciência e tecnologia'),
  ('Esportes', 'esportes', 'Futebol e demais esportes'),
  ('Cultura', 'cultura', 'Cinema, música, artes e entretenimento');
