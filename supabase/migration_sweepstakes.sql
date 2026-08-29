-- ============================================================================
-- Migração: cadastro para sorteios ("Sorteio")
-- Execute este arquivo no SQL Editor do Supabase (projeto já existente).
-- ============================================================================

create type public.sweepstakes_participant_status as enum ('registered', 'winner', 'disqualified');

-- sweepstakes_participants: dados pessoais de quem se cadastrou pra
-- concorrer. Minimização (LGPD): só os campos necessários pra identificar o
-- participante e contatá-lo/entregar o prêmio, nada além disso.
create table public.sweepstakes_participants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  -- Só dígitos (ex: "35999998888") — usado pra checar duplicidade e buscar
  -- sem depender de como o telefone foi digitado/formatado.
  phone_normalized text not null,
  rg text not null,
  -- Só alfanumérico maiúsculo — mesmo motivo do phone_normalized.
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
  -- Trava em nível de banco: nenhuma linha existe sem consentimento, mesmo
  -- que algum caminho novo no código esqueça de checar isso no frontend.
  constraint sweepstakes_participants_consent_check check (consent_accepted = true)
);
comment on table public.sweepstakes_participants is 'Cadastros de participantes do sorteio promovido pela Difusora HD. Dados pessoais sensíveis (RG, telefone, endereço) — acesso restrito a administradores via RLS, nunca exposto ao público.';
comment on column public.sweepstakes_participants.status is 'registered = cadastro padrão; winner = sorteado; disqualified = desclassificado pelo admin (ex: dado inválido encontrado manualmente).';
comment on column public.sweepstakes_participants.consent_at is 'Data/hora em que o consentimento (LGPD) foi registrado — sempre igual a created_at hoje, mas mantido como coluna própria caso o fluxo de consentimento mude no futuro (ex: reconfirmação).';

-- Únicos por versão normalizada: "(35) 99999-8888" e "35999998888" são o
-- mesmo telefone, e não podem gerar dois cadastros.
create unique index sweepstakes_participants_phone_normalized_key
  on public.sweepstakes_participants (phone_normalized);
create unique index sweepstakes_participants_rg_normalized_key
  on public.sweepstakes_participants (rg_normalized);
create index sweepstakes_participants_created_at_idx
  on public.sweepstakes_participants (created_at desc);
create index sweepstakes_participants_status_idx
  on public.sweepstakes_participants (status);

-- Atualiza updated_at automaticamente (reaproveita a função já usada em
-- profiles/news/ads — ver set_updated_at() em schema.sql).
create trigger set_sweepstakes_participants_updated_at
  before update on public.sweepstakes_participants
  for each row execute function public.set_updated_at();

alter table public.sweepstakes_participants enable row level security;

-- Só admin lê, atualiza (ex: mudar status) ou exclui. Não existe policy de
-- INSERT pública nesta tabela — o cadastro é feito só via a função
-- register_sweepstakes_participant() abaixo (SECURITY DEFINER), mesmo
-- padrão de log_analytics_event/increment_news_views: o público nunca tem
-- acesso direto de escrita na tabela, só através de uma função que controla
-- exatamente quais campos podem ser gravados e valida tudo no servidor.
create policy "sweepstakes_participants_select_admin" on public.sweepstakes_participants
  for select using (public.is_admin());

create policy "sweepstakes_participants_update_admin" on public.sweepstakes_participants
  for update using (public.is_admin()) with check (public.is_admin());

create policy "sweepstakes_participants_delete_admin" on public.sweepstakes_participants
  for delete using (public.is_admin());

-- Cadastro público. Valida tudo de novo no servidor (nunca confia só no
-- formulário do frontend), normaliza telefone/RG, e traduz a violação de
-- unicidade num erro claro em vez do texto técnico do Postgres. Retorna só
-- o id do novo cadastro — nunca os dados pessoais de volta.
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

  -- Heurística simples de "nome obviamente inválido": exige nome e
  -- sobrenome (pelo menos um espaço) e um tamanho mínimo plausível.
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
