# Testing & Deployment Guide

This guide gets Revia running locally and explains how to deploy it.

## Prerequisites

- **Node.js 20+**
- **Docker Desktop** (for local PostgreSQL)
- **npm**

## One-Command Setup

From the project root:

```bash
npm run setup
```

This will:

1. Copy `.env.example` → `.env` (if missing)
2. Run `npm install`
3. Start PostgreSQL via Docker Compose
4. Push the Prisma schema
5. Seed demo data (1 user, 1 deck, 3 cards)

## Run the App

### Development (recommended for testing)

```bash
npm run dev
```

Open **http://localhost:3000**

### Production mode (local)

```bash
npm run prod
```

Builds the app and serves it with `next start` at **http://localhost:3000**

## Verify Everything Works

```bash
npm run check
```

Runs: TypeScript check → unit tests → production build

### Health check

With the app running:

```bash
curl http://localhost:3000/api/health
```

Expected: `{"status":"ok","timestamp":"..."}`

If the database is down: `503` with `"status":"degraded"`

## Manual Test Checklist

Use the seeded demo account (no login required — mock auth):

| Step | URL | What to verify |
|------|-----|----------------|
| 1 | `/dashboard` | Shows due count, deck count, recent decks |
| 2 | `/decks` | Lists "Getting Started" deck |
| 3 | `/decks/new` or create form on `/decks` | Create a new deck |
| 4 | `/decks/[id]` | View cards, add a card |
| 5 | `/review` | Start review session |
| 6 | `/review/[sessionId]` | Flip card (Space), rate 1–5 |
| 7 | `/dashboard` | Due count decreases after review |
| 8 | `/statistics` | Review chart updates |

### Seeded demo data

- **User:** demo@decklearning.app
- **Deck:** Getting Started (3 cards, all due immediately)

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | First-time local setup |
| `npm run dev` | Dev server |
| `npm run prod` | Build + production server |
| `npm run check` | typecheck + test + build |
| `npm run test` | Unit tests only |
| `npm run db:reset` | Reset DB + re-seed |
| `npm run db:studio` | Prisma Studio (DB browser) |
| `docker compose up -d` | Start Postgres only |
| `docker compose down` | Stop Postgres |

## Troubleshooting

### `Can't reach database server at localhost:5432`

PostgreSQL is not running. Fix:

```bash
docker compose up -d postgres
npm run db:push
npm run db:seed
```

### Port 5432 already in use

Another Postgres instance is running. Either stop it, or change the port in `docker-compose.yml` and update `DATABASE_URL` in `.env`.

### Empty dashboard / no decks

Re-seed the database:

```bash
npm run db:reset
```

### Docker not installed

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/), then run `npm run setup` again.

## Deploy to Vercel + Supabase

See **[docs/DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md)** for the full guide.

Quick steps:

1. Import repo at [vercel.com/new](https://vercel.com/new) — set **Root Directory** to `revia`
2. Add environment variables:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://[project-ref].supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → API → anon key |
   | `DATABASE_URL` | Supabase transaction pooler (port 6543) |
   | `DIRECT_URL` | Supabase session pooler (port 5432) |

3. Configure Supabase auth redirects for your Vercel URL (or run `npm run vercel:setup`)
4. Deploy — schema is already on Supabase via `npm run db:push`

## Deploy with Docker (self-hosted)

A full Docker setup (app + Postgres) can be added later. For now, use Docker Compose for Postgres only and run the Next.js app on the host with `npm run dev` or `npm run prod`.
