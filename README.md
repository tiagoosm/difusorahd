# Difusora HD

News portal and live radio for **Rádio Difusora HD** (Pouso Alegre – MG, Brazil), with a full admin panel for managing editorial content, advertising, and the station's sweepstakes sign-ups.

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com)
[![Vitest](https://img.shields.io/badge/tests-vitest-6e9f18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Vercel](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com)

🌐 **Live site:** [difusorahd.com.br](https://difusorahd.com.br/)

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Database (Supabase)](#database-supabase)
- [Running locally](#running-locally)
- [Environment variables](#environment-variables)
- [Tests](#tests)
- [Deploy](#deploy)
- [License](#license)

---

## Overview

The project is made up of two fronts sharing the same codebase:

- **Public portal** — reading articles, browsing 100% dynamic categories (created/edited in the admin panel, nothing hardcoded in the code), search, a live radio player, and sweepstakes sign-up.
- **Admin panel** (`/admin`) — restricted authentication, article CRUD with a rich text editor, management of featured items, categories, ads, sweepstakes participants, and a self-built analytics dashboard (no dependency on Google Analytics or similar).

## Features

### Public portal

- **Editorial Home page**: Featured → Latest News (3×3 grid) → one section per existing category → Most Read — all built dynamically from the database, with no hardcoded per-category section.
- **Most Read with a cascading fallback**: current week's ranking via analytics events; if there isn't enough data, it falls back to previous weeks, then to the overall history, and finally to the accumulated view counter — never leaves the section empty nor uses fake data.
- **Article page**: rich text content, optional audio narration, related articles from the same category, share buttons, and dynamic Open Graph tags — social media bots (Facebook, WhatsApp, Twitter/X, LinkedIn, Telegram, etc.) get a pre-rendered version of the page with the correct title, image and description (`api/share/[slug].js`, routed via `vercel.json`).
- **Search and category pages** with pagination.
- **Dynamic `sitemap.xml`**, generated from published articles (`api/sitemap.xml.js`).
- **Live radio player**: floating mini-player, automatic reconnection with exponential backoff on stream drops, responds to online/offline events, lock-screen controls via the Media Session API, volume persisted locally.
- **Sweepstakes sign-up**: pop-up + full form (name, phone, ID document, address) with input masks, recorded LGPD consent, and a `SECURITY DEFINER` database RPC so the participants table is never publicly exposed.
- **Ad banners** per position, manageable from the admin panel.
- **Mobile-first** layout with its own mobile menu navigation, responsive images (`srcset`), data caching, and load-error handling.
- Accessibility: skip-to-content link, consistent `focus-visible`, tap targets ≥ 24px, no title truncation or `line-clamp` where content needs to be read in full.

### Admin panel

- Authentication via Supabase Auth, with profiles (`profiles`) controlling access.
- Full article CRUD with a rich text editor (Tiptap), cover image and audio upload.
- Home page featured-items management with reordering.
- Category management (create, edit, and delete protected by referential integrity — a category with linked articles can't be removed).
- Ad management per position.
- Sweepstakes participant management (status: registered / winner / disqualified, registration details, deletion).
- **Self-built analytics**: unique visitors (daily hash, no IP stored), top pages, devices, location, retention, and comparison with the previous period — all via dedicated SQL functions in Supabase.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, React Router 7, Vite 8, Tailwind CSS 4 |
| Data / remote state | TanStack Query, Supabase JS |
| Forms and rich content | React Hook Form, Tiptap |
| UI | Lucide Icons, Embla Carousel, Recharts, React Hot Toast |
| Backend | Supabase (Postgres, Auth, Storage, `SECURITY DEFINER` RPCs, RLS) |
| Serverless functions | Vercel Functions (`api/`) — sitemap, bot share previews, and analytics tracking |
| Tests | Vitest, Testing Library, jsdom |
| Lint | oxlint |
| Hosting | Vercel |

## Project structure

```
api/                      Serverless functions (Vercel): sitemap, share preview, tracking
public/                   Static assets
src/
├── assets/                Images/logos imported by the bundle
├── components/
│   ├── admin/              Components exclusive to the admin panel (analytics, sweepstakes)
│   ├── ads/                 Ad banners
│   ├── categories/          Category-related components
│   ├── layout/               Navbar, Footer, public and admin layouts
│   ├── news/                  Article cards, sections and listings
│   ├── radio/                  Live radio player
│   ├── sweepstakes/            Sweepstakes sign-up pop-up and form
│   └── ui/                      Generic, reusable UI components
├── contexts/               React contexts (authentication)
├── hooks/                  Custom hooks (data, categories, radio, SEO...)
├── pages/
│   └── admin/                Admin panel pages
├── routes/                 Centralized route definitions
├── services/               Supabase access layer (one function per operation)
├── test/                   Global test setup
└── utils/                  Formatting, input masks, storage, SEO
supabase/
├── schema.sql               Full schema (tables, RLS, functions)
├── migration_*.sql           Incremental migrations applied to the project
└── seed_*.sql                 Sample data for development
```

## Database (Supabase)

The schema lives in [`supabase/schema.sql`](supabase/schema.sql), with changes tracked as incremental migrations (`supabase/migration_*.sql`) — there's no `migrations/` folder versioned by the Supabase CLI; each file is applied to the project manually as needed.

Main tables: `news`, `categories`, `ads`, `sweepstakes_participants`, `analytics_events`, `profiles`.

Sensitive business logic lives in the database as `SECURITY DEFINER` functions, not in the frontend — for example:

- `public_weekly_top_news` — the Most Read ranking with the cascading fallback described above.
- `register_sweepstakes_participant` — validates and inserts a participant without exposing the table via a public API.
- `increment_news_views` — counts views atomically.

## Running locally

**Prerequisites:** Node.js `^20.19.0` or `>=22.12.0`, and access to a Supabase project (your own or a development one).

```bash
git clone https://github.com/tiagoosm/difusorahd.git
cd difusorahd
npm install
cp .env.example .env   # fill in your credentials (see the section below)
npm run dev
```

Available scripts:

| Command | Description |
| --- | --- |
| `npm run dev` | Development server (Vite) |
| `npm run build` | Production build in `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Lint with oxlint |
| `npm test` | Runs the test suite once |
| `npm run test:watch` | Tests in watch mode |

## Environment variables

See [`.env.example`](.env.example) for the full, commented file. Summary:

| Variable | Where it's used | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase public/anonymous key |
| `VITE_RADIO_STREAM_URL` | Frontend | Live audio stream URL (Shoutcast/Icecast/Centova) |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Serverless functions (`api/`) | Same credentials, without the `VITE_` prefix because they run server-side |
| `SITE_URL` | Serverless functions | Production domain, no trailing slash |
| `ANALYTICS_SALT` | `api/track.js` | Salt for the daily unique-visitor hash — **don't change it in production** (resets the count) |

In production (Vercel), these variables need to be registered under **Project Settings → Environment Variables**; the local `.env` is never committed.

## Tests

The suite uses Vitest + Testing Library, with test files next to the code they test (`Component.jsx` + `Component.test.jsx`). Coverage ranges from pure utilities to full component flows (forms, pop-ups, players with reconnection simulated via fake timers).

```bash
npm test
```

## Deploy

Hosted on **Vercel**, with automatic deploys from the `main` branch. `vercel.json` defines:

- a rewrite of `/sitemap.xml` to the serverless function that generates it dynamically;
- a rewrite of `/noticia/:slug` to a pre-rendered version when the request comes from a social media bot (correct Open Graph tags on shares);
- the default SPA fallback for every other route.

## License

Private project. All rights reserved © Fundação São José do Paraíso – Rádio Difusora HD.

---

Built for **Rádio Difusora HD**.
