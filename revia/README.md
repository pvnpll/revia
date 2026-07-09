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

## Tech Stack

Next.js 15 · React · TypeScript · Tailwind · shadcn/ui · Prisma · PostgreSQL · Zod · React Hook Form · TanStack Query
