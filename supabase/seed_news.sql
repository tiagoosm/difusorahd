-- ============================================================================
-- Notícias de exemplo, só para validação visual das Etapas 8-11.
-- Pode apagar tudo mais tarde pelo painel admin, quando tiver conteúdo real.
-- Execute no SQL Editor do Supabase.
-- ============================================================================

insert into public.news
  (title, slug, excerpt, content, cover_image_url, category_id, author_id, status, is_featured, views_count, published_at)
values
(
  'Inteligência artificial impulsiona nova geração de startups brasileiras',
  'ia-impulsiona-startups-brasileiras',
  'Investimentos em IA generativa crescem 40% no país e atraem atenção de fundos internacionais.',
  '<p>O mercado brasileiro de tecnologia vive um momento de efervescência com o avanço da inteligência artificial generativa. Nos últimos doze meses, o volume de investimentos em startups do setor cresceu 40%, segundo levantamento de associações do setor.</p><p>Especialistas apontam que o país tem se destacado pela combinação de talento técnico qualificado e custo operacional competitivo em relação a outros polos de tecnologia. "Estamos vendo um interesse real de fundos internacionais que antes olhavam só para Estados Unidos e Europa", afirma uma analista do setor.</p><p>O movimento também tem gerado debate sobre regulamentação e uso responsável da tecnologia, temas que devem pautar a agenda do setor nos próximos meses.</p>',
  'https://picsum.photos/seed/ia-startups/1200/675',
  (select id from public.categories where slug = 'tecnologia'),
  'c95b1387-8294-4141-a82e-62df126de630',
  'published',
  true,
  1520,
  now() - interval '1 day'
),
(
  'Congresso aprova nova lei de proteção de dados para o setor público',
  'congresso-aprova-lei-protecao-dados-setor-publico',
  'Norma estabelece regras mais rígidas para tratamento de informações de cidadãos por órgãos governamentais.',
  '<p>Depois de mais de um ano de tramitação, o Congresso Nacional aprovou nesta semana um novo marco legal para o tratamento de dados pessoais por órgãos públicos.</p><p>A proposta prevê auditorias periódicas, obrigatoriedade de relatórios de impacto e criação de canais específicos para que cidadãos solicitem a exclusão de informações sensíveis.</p><p>Entidades de defesa do consumidor classificaram a aprovação como um avanço, mas cobram regulamentação clara sobre prazos de implementação.</p>',
  'https://picsum.photos/seed/lei-dados-publicos/1200/675',
  (select id from public.categories where slug = 'politica'),
  'c95b1387-8294-4141-a82e-62df126de630',
  'published',
  true,
  980,
  now() - interval '2 days'
),
(
  'Banco Central mantém taxa de juros e mercado reage com cautela',
  'banco-central-mantem-taxa-juros',
  'Decisão era esperada por analistas, mas comunicado trouxe sinais mistos sobre os próximos meses.',
  '<p>O Comitê de Política Monetária decidiu manter a taxa básica de juros no patamar atual, em linha com as expectativas da maioria dos analistas do mercado financeiro.</p><p>No comunicado divulgado após a reunião, a autoridade monetária destacou a necessidade de acompanhar de perto a inflação de serviços e o cenário externo antes de sinalizar novos cortes.</p><p>Economistas consultados avaliam que o próximo movimento só deve ocorrer nas reuniões seguintes, dependendo da divulgação de novos indicadores.</p>',
  'https://picsum.photos/seed/banco-central-juros/1200/675',
  (select id from public.categories where slug = 'economia'),
  'c95b1387-8294-4141-a82e-62df126de630',
  'published',
  false,
  742,
  now() - interval '3 days'
),
(
  'Seleção brasileira se prepara para amistosos antes da próxima Copa',
  'selecao-brasileira-amistosos-copa',
  'Comissão técnica convoca grupo com mistura de titulares e novos nomes para os próximos jogos.',
  '<p>A comissão técnica da seleção brasileira divulgou a lista de convocados para a próxima rodada de amistosos internacionais, marcados como parte da preparação para a próxima Copa do Mundo.</p><p>Entre as novidades, chamam atenção dois jogadores que se destacaram nas últimas temporadas em ligas europeias e disputam posição no time titular.</p><p>Os jogos servirão também para testar variações táticas que a comissão técnica vem estudando ao longo do ano.</p>',
  'https://picsum.photos/seed/selecao-amistosos/1200/675',
  (select id from public.categories where slug = 'esportes'),
  'c95b1387-8294-4141-a82e-62df126de630',
  'published',
  false,
  2103,
  now() - interval '4 days'
),
(
  'Festival de cinema nacional bate recorde de público em 2026',
  'festival-cinema-nacional-recorde-publico',
  'Edição deste ano teve mais de 200 mil espectadores e programação com produções de todas as regiões do país.',
  '<p>O maior festival de cinema do país fechou sua edição de 2026 com recorde de público, superando 200 mil espectadores ao longo de dez dias de programação.</p><p>A curadoria deste ano priorizou produções de regiões historicamente pouco representadas no circuito nacional, resultado de um edital lançado há dois anos.</p><p>Organizadores já confirmaram data para a próxima edição e prometem ampliar o número de sessões gratuitas ao ar livre.</p>',
  'https://picsum.photos/seed/festival-cinema/1200/675',
  (select id from public.categories where slug = 'cultura'),
  'c95b1387-8294-4141-a82e-62df126de630',
  'published',
  false,
  615,
  now() - interval '5 days'
),
(
  'Novo chip nacional promete reduzir custo de data centers no Brasil',
  'chip-nacional-reduz-custo-data-centers',
  'Projeto desenvolvido em parceria entre universidade pública e iniciativa privada chega ao mercado em 2027.',
  '<p>Um consórcio formado por uma universidade pública e empresas de tecnologia anunciou o desenvolvimento de um chip voltado para servidores, com previsão de chegar ao mercado em 2027.</p><p>Segundo os desenvolvedores, o componente reduz em até 30% o consumo de energia em comparação com soluções importadas equivalentes, o que pode baratear a operação de data centers no país.</p><p>O projeto recebeu financiamento de fundos de fomento à inovação e é apontado como um passo relevante para reduzir a dependência tecnológica externa.</p>',
  'https://picsum.photos/seed/chip-nacional/1200/675',
  (select id from public.categories where slug = 'tecnologia'),
  'c95b1387-8294-4141-a82e-62df126de630',
  'published',
  false,
  431,
  now() - interval '6 days'
);
