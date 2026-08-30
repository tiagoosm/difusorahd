-- ============================================================================
-- Migration: sweepstakes registration ("Sorteio")
-- Run this file in the Supabase SQL Editor (existing project).
-- ============================================================================

create type public.sweepstakes_participant_status as enum ('registered', 'winner', 'disqualified');

-- sweepstakes_participants: personal data of whoever registered to enter.
-- Minimization (LGPD): only the fields needed to identify the participant
-- and contact them/deliver the prize, nothing beyond that.
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
comment on column public.sweepstakes_participants.consent_at is 'Date/time the (LGPD) consent was recorded — always equal to created_at today, but kept as its own column in case the consent flow changes in the future (e.g. reconfirmation).';

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

-- Automatically updates updated_at (reuses the function already used on
-- profiles/news/ads — see set_updated_at() in schema.sql).
create trigger set_sweepstakes_participants_updated_at
  before update on public.sweepstakes_participants
  for each row execute function public.set_updated_at();

alter table public.sweepstakes_participants enable row level security;

-- Only admin reads, updates (e.g. changes status) or deletes. There's no
-- public INSERT policy on this table — registration only happens via the
-- register_sweepstakes_participant() function below (SECURITY DEFINER),
-- same pattern as log_analytics_event/increment_news_views: the public
-- never has direct write access to the table, only through a function
-- that controls exactly which fields can be written and validates
-- everything server-side.
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
