# Difusora HD

Portal de notícias e rádio ao vivo da **Rádio Difusora HD** (Pouso Alegre – MG), com painel administrativo completo para gestão de conteúdo editorial, publicidade e o cadastro de sorteios da emissora.

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com)
[![Vitest](https://img.shields.io/badge/tests-vitest-6e9f18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Vercel](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com)

🌐 **Site em produção:** [difusorahd.com.br](https://difusorahd.com.br/)

---

## Sumário

- [Visão geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack tecnológica](#stack-tecnológica)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Banco de dados (Supabase)](#banco-de-dados-supabase)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Testes](#testes)
- [Deploy](#deploy)
- [Licença](#licença)

---

## Visão geral

O projeto é composto por duas frentes que compartilham a mesma base de código:

- **Portal público** — leitura de notícias, navegação por categorias 100% dinâmicas (criadas/editadas no admin, sem nada fixo no código), busca, player de rádio ao vivo e cadastro para sorteios.
- **Painel administrativo** (`/admin`) — autenticação restrita, CRUD de notícias com editor rich text, gestão de destaques, categorias, anúncios, participantes de sorteio e um dashboard de analytics próprio (sem depender de Google Analytics ou similar).

## Funcionalidades

### Portal público

- **Home editorial**: Destaques → Últimas Notícias (grade 3×3) → uma seção por categoria existente → Mais Lidas — tudo construído dinamicamente a partir do banco, sem seção hardcoded por categoria.
- **Mais Lidas com fallback em cascata**: ranking da semana atual via eventos de analytics; se não houver dados suficientes, cai para semanas anteriores, depois para o histórico geral e, por fim, para o contador acumulado de visualizações — nunca deixa a seção vazia nem usa dado fictício.
- **Notícia individual**: conteúdo em rich text, narração em áudio opcional, notícias relacionadas da mesma categoria, botões de compartilhamento e Open Graph dinâmico — bots de redes sociais (Facebook, WhatsApp, Twitter/X, LinkedIn, Telegram etc.) recebem uma versão pré-renderizada da página com título, imagem e descrição corretos (`api/share/[slug].js`, roteado via `vercel.json`).
- **Busca e páginas de categoria** com paginação.
- **`sitemap.xml` dinâmico**, gerado a partir das notícias publicadas (`api/sitemap.xml.js`).
- **Player de rádio ao vivo**: mini-player flutuante, reconexão automática com backoff exponencial em caso de queda do stream, resposta a eventos online/offline, controles na tela de bloqueio via Media Session API, volume persistido localmente.
- **Cadastro de sorteios**: pop-up + formulário completo (nome, telefone, RG, endereço) com máscaras de input, consentimento LGPD registrado e RPC `SECURITY DEFINER` no banco para não expor a tabela de participantes publicamente.
- **Banners de anúncio** por posição, gerenciáveis pelo admin.
- Layout **mobile-first** com navegação por menu próprio no celular, imagens responsivas (`srcset`), cache de dados e tratamento de erro de carregamento.
- Acessibilidade: link de pular para o conteúdo, `focus-visible` consistente, alvos de toque ≥ 24px, sem cortes de título nem `line-clamp` onde o conteúdo precisa ser lido por completo.

### Painel administrativo

- Autenticação via Supabase Auth, com perfis (`profiles`) controlando acesso.
- CRUD completo de notícias com editor rich text (Tiptap), upload de imagem de capa e áudio.
- Gestão de destaques da Home com reordenação.
- Gestão de categorias (criação, edição e exclusão protegida por integridade referencial — não é possível remover uma categoria com notícias vinculadas).
- Gestão de anúncios por posição.
- Gestão de participantes do sorteio (status: cadastrado / sorteado / desclassificado, detalhes de cadastro, exclusão).
- **Analytics próprio**: visitantes únicos (hash diário sem guardar IP), páginas mais vistas, dispositivos, localização, retenção e comparação com período anterior — tudo via funções SQL dedicadas no Supabase.

## Stack tecnológica

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, React Router 7, Vite 8, Tailwind CSS 4 |
| Dados / estado remoto | TanStack Query, Supabase JS |
| Formulários e conteúdo rico | React Hook Form, Tiptap |
| UI | Lucide Icons, Embla Carousel, Recharts, React Hot Toast |
| Backend | Supabase (Postgres, Auth, Storage, RPCs `SECURITY DEFINER`, RLS) |
| Funções serverless | Vercel Functions (`api/`) — sitemap, share previews para bots e tracking de analytics |
| Testes | Vitest, Testing Library, jsdom |
| Lint | oxlint |
| Hospedagem | Vercel |

## Estrutura do projeto

```
api/                      Funções serverless (Vercel): sitemap, share preview, tracking
public/                   Assets estáticos
src/
├── assets/                Imagens/logos importados pelo bundle
├── components/
│   ├── admin/              Componentes exclusivos do painel admin (analytics, sorteio)
│   ├── ads/                 Banners de anúncio
│   ├── categories/          Componentes ligados a categorias
│   ├── layout/               Navbar, Footer, layouts público e admin
│   ├── news/                  Cards, seções e listagens de notícia
│   ├── radio/                  Player de rádio ao vivo
│   ├── sweepstakes/            Pop-up e formulário de cadastro do sorteio
│   └── ui/                      Componentes de UI genéricos e reutilizáveis
├── contexts/               Contextos React (autenticação)
├── hooks/                  Hooks customizados (dados, categorias, rádio, SEO...)
├── pages/
│   └── admin/                Páginas do painel administrativo
├── routes/                 Definição centralizada de rotas
├── services/               Camada de acesso ao Supabase (uma função por operação)
├── test/                   Setup global dos testes
└── utils/                  Formatação, máscaras, storage, SEO
supabase/
├── schema.sql               Schema completo (tabelas, RLS, funções)
├── migration_*.sql           Migrações incrementais aplicadas ao projeto
└── seed_*.sql                 Dados de exemplo para desenvolvimento
```

## Banco de dados (Supabase)

O schema vive em [`supabase/schema.sql`](supabase/schema.sql), com evoluções registradas como migrações incrementais (`supabase/migration_*.sql`) — não há uma pasta `migrations/` versionada pela CLI do Supabase; cada arquivo é aplicado manualmente ao projeto conforme necessário.

Tabelas principais: `news`, `categories`, `ads`, `sweepstakes_participants`, `analytics_events`, `profiles`.

Lógica de negócio sensível vive no banco como funções `SECURITY DEFINER`, não no frontend — por exemplo:

- `public_weekly_top_news` — ranking de mais lidas com o fallback em cascata descrito acima.
- `register_sweepstakes_participant` — valida e insere um participante sem expor a tabela via API pública.
- `increment_news_views` — contabiliza visualizações de forma atômica.

## Como rodar localmente

**Pré-requisitos:** Node.js `^20.19.0` ou `>=22.12.0`, e acesso a um projeto Supabase (próprio ou de desenvolvimento).

```bash
git clone https://github.com/tiagoosm/difusorahd.git
cd difusorahd
npm install
cp .env.example .env   # preencha com suas credenciais (veja a seção abaixo)
npm run dev
```

Scripts disponíveis:

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Lint com oxlint |
| `npm test` | Roda a suíte de testes uma vez |
| `npm run test:watch` | Testes em modo watch |

## Variáveis de ambiente

Veja [`.env.example`](.env.example) para o arquivo completo e comentado. Resumo:

| Variável | Onde é usada | Descrição |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Frontend | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Chave pública/anônima do Supabase |
| `VITE_RADIO_STREAM_URL` | Frontend | URL do stream de áudio ao vivo (Shoutcast/Icecast/Centova) |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Funções serverless (`api/`) | Mesmas credenciais, sem prefixo `VITE_` porque rodam no servidor |
| `SITE_URL` | Funções serverless | Domínio de produção, sem barra final |
| `ANALYTICS_SALT` | `api/track.js` | Sal para o hash diário de visitante único — **não trocar em produção** (reinicia a contagem) |

Em produção (Vercel), essas variáveis precisam ser cadastradas em **Project Settings → Environment Variables**; o `.env` local nunca é commitado.

## Testes

A suíte usa Vitest + Testing Library, com os arquivos de teste ao lado do código que testam (`Componente.jsx` + `Componente.test.jsx`). Cobre desde utilitários puros até fluxos completos de componentes (formulários, pop-ups, players com reconexão simulada via fake timers).

```bash
npm test
```

## Deploy

Hospedado na **Vercel**, com deploy automático a partir da branch `main`. O `vercel.json` define:

- reescrita de `/sitemap.xml` para a função serverless que o gera dinamicamente;
- reescrita de `/noticia/:slug` para uma versão pré-renderizada quando a requisição vem de um bot de rede social (Open Graph correto em compartilhamentos);
- fallback padrão de SPA para todas as demais rotas.

## Licença

Projeto privado. Todos os direitos reservados © Fundação São José do Paraíso – Rádio Difusora HD.

---

Desenvolvido para a **Rádio Difusora HD**.
