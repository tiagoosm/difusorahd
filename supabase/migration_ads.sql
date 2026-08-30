-- ============================================================================
-- Migration: Ads Module
-- Run this file in the Supabase SQL Editor.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Position ENUM — fixed in code/database, prepared for future expansion
-- (adding a new position = 1 line here, no need for its own table).
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
comment on table public.ads is 'Ads shown in fixed positions on the site (image banners + link).';
comment on column public.ads.position is 'Where the ad appears: TOP_HOME, HOME_MIDDLE, ARTICLE_TOP, ARTICLE_MIDDLE, ARTICLE_BOTTOM, SIDEBAR, FOOTER.';
comment on column public.ads.priority is 'Among several active ads in the same position, the one with the highest priority is shown.';
comment on column public.ads.active is 'Overall on/off switch, independent of the display date range.';

-- Most common query: "which active ad, in this position, has the highest priority?"
create index ads_position_active_priority_idx on public.ads (position, active, priority desc);

create trigger set_ads_updated_at
  before update on public.ads
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table public.ads enable row level security;

-- The public only sees ads that are genuinely "live" right now — the
-- business rule (active + within date range) lives in the database, not
-- just checked on the frontend.
create policy "ads_select_public_valid" on public.ads
  for select using (
    active = true and now() >= start_date and now() <= end_date
  );

-- Admin sees everything (including expired/future/inactive), to manage them.
create policy "ads_select_admin" on public.ads
  for select using (public.is_admin());

create policy "ads_insert_admin" on public.ads
  for insert with check (public.is_admin());

create policy "ads_update_admin" on public.ads
  for update using (public.is_admin()) with check (public.is_admin());

create policy "ads_delete_admin" on public.ads
  for delete using (public.is_admin());

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
