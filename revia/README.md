# Revia

A mobile-first, subject-agnostic spaced repetition learning platform.

**v1.4** — Practice mode + Daily Review at [revialearn.vercel.app](https://revialearn.vercel.app)

## What You Can Do

- **Practice** endlessly on app open (adaptive queue, recent decks)
- **Daily Review** for spaced repetition when cards are due
- Create, import, and share decks with lessons and flashcards
- Explore and import public decks from other learners
- Track progress on the dashboard (due count, streak, totals)
- Sign in with Supabase Auth (email or username)

## Documentation

| Doc | Audience |
|-----|----------|
| [v1 Release Snapshot](./docs/application/v1-release.md) | Everyone — what's in v1 |
| [Layman Guide](./docs/application/layman-guide.md) | Non-technical users |
| [Technical Reference](./docs/application/technical-reference.md) | Developers |
| [Progress & Roadmap](./docs/application/progress-and-roadmap.md) | Features by release version |
| [Release Versioning](./docs/application/release-versioning.md) | SemVer policy |
| [CHANGELOG](./CHANGELOG.md) | Shipped versions |
| [Deploy Guide](./docs/DEPLOY-VERCEL.md) | Vercel + Supabase setup |
| [Architecture](./docs/architecture/README.md) | System design |
| [Testing](./docs/TESTING.md) | Local dev and QA |

## Quick Start

```bash
cd revia
npm run setup    # Docker Postgres + schema + seed
npm run dev      # http://localhost:3000
```

Without Supabase env vars, the app uses a mock user (no login required).

### Supabase Auth

```bash
# Option A: Cursor MCP (see .cursor/mcp.json at repo root)
# Option B: Connect script
SUPABASE_ACCESS_TOKEN="sbp_..." SUPABASE_PROJECT_REF="your-ref" npm run supabase:connect
```

Add redirect URL `http://localhost:3000/auth/callback` in Supabase dashboard.

## Feature Status (v1)

| Feature | Status |
|---------|--------|
| Practice | ✅ |
| Daily Review | ✅ |
| Dashboard | ✅ |
| Decks + Explore | ✅ |
| Lessons + practice | ✅ |
| Settings + import + feedback | ✅ |
| Supabase Auth | ✅ |
| Deck/lesson edit UI | ⏳ API only |
| Card UI on deck page | ⏳ API only |
| Export | Planned |
| Statistics | Planned |
| Tags UI | Planned |

See [progress-and-roadmap.md](./docs/application/progress-and-roadmap.md) for upcoming phases.

## Deploy

```bash
cd revia
# Vercel Root Directory must be set to "revia"
npx vercel --prod
```

Full guide: [docs/DEPLOY-VERCEL.md](./docs/DEPLOY-VERCEL.md)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run check` | typecheck + test + build |
| `npm run test` | Unit tests |
| `npm run test:e2e` | Playwright E2E |
| `npm run setup` | First-time local setup |
| `npm run vercel:setup` | Supabase + Vercel env template |

## Tech Stack

Next.js 15 · React 19 · TypeScript · Tailwind · shadcn/ui · Prisma · PostgreSQL · Supabase Auth · TanStack Query · Zod

## Repo Layout

```
Build/          ← Git root
  revia/        ← Application (set as Vercel Root Directory)
```
