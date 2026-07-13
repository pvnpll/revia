# Revia

A generic, subject-agnostic spaced repetition learning platform.

## Architecture (v2)

- **API-first:** Business operations via `/app/api` Route Handlers
- **Business logic:** `src/lib/` (services, repositories, scheduler)
- **Features:** `src/features/` (UI, hooks, API clients)
- **Scheduler:** Pure TypeScript in `src/lib/scheduler/` — UI/DB independent

Full docs: [`docs/architecture/README.md`](./docs/architecture/README.md)

## Quick Start

```bash
npm run setup    # Docker Postgres + schema + seed
npm run dev      # http://localhost:3000
```

Without Supabase env vars, the app uses the mock user from `.env` (local dev and E2E).

### Supabase Auth (optional)

**Option A — MCP (recommended in Cursor)**

1. Open **Cursor Settings → Tools & MCP** and enable the `supabase` server (configured in `.cursor/mcp.json` at the repo root).
2. Click **Authenticate** and sign in to Supabase when prompted.
3. Ask the agent to configure auth for Revia using MCP, or run the connect script manually (Option B).

**Option B — connect script**

```bash
# Personal access token: https://supabase.com/dashboard/account/tokens
# Project ref: Dashboard → Project Settings → General → Project ID
SUPABASE_ACCESS_TOKEN="sbp_..." SUPABASE_PROJECT_REF="your-ref" npm run supabase:connect
```

This configures auth redirect URLs, enables email auto-confirm for local dev, and writes keys to `.env`.

**Manual setup**

1. Create a [Supabase](https://supabase.com) project.
2. Copy **Project URL** and **anon public key** into `.env`.
3. In Supabase → **Authentication → URL Configuration**, add redirect URL `http://localhost:3000/auth/callback`.
4. Restart the dev server. Unauthenticated visits redirect to `/login`; sign out is in **Settings**.

On first login, the Supabase user is synced into the local `users` table (same UUID as `auth.users.id`).

## Feature Rollout

| # | Feature | Status |
|---|---------|--------|
| 1 | **Decks** | ✅ Complete — review before continuing |
| 2 | Lessons | Planned |
| 3 | Cards | Planned |
| 4 | Review | Planned |
| 5 | Dashboard | Planned |
| 6 | Statistics | Planned |
| 7 | Settings | Planned |

## Decks Feature (implemented)

- `GET/POST /api/decks`
- `GET/PATCH/DELETE /api/decks/:deckId`
- TanStack Query hooks in `features/decks/hooks/`
- React Hook Form + Zod in `features/decks/components/create-deck-form.tsx`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run setup` | First-time setup |
| `npm run dev` | Dev server |
| `npm run check` | typecheck + test + build |
| `npm run prod` | Production build + start |

See [`docs/TESTING.md`](./docs/TESTING.md) for full testing guide.

## Deploy to Vercel + Supabase

Full guide: [`docs/DEPLOY-VERCEL.md`](./docs/DEPLOY-VERCEL.md)

1. Import repo on [Vercel](https://vercel.com/new) with **Root Directory: `revia`**
2. Add env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`, `DIRECT_URL`)
3. Run `npm run vercel:setup` to configure Supabase auth redirects for your Vercel URL
4. Deploy — push to `main` or `npx vercel --prod`

## Tech Stack

Next.js 15 · React · TypeScript · Tailwind · shadcn/ui · Prisma · PostgreSQL · Zod · React Hook Form · TanStack Query
