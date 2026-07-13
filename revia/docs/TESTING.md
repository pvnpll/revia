# Testing & Deployment Guide

## Prerequisites

- **Node.js 20+**
- **Docker Desktop** (for local PostgreSQL) or Supabase connection
- **npm**

## One-Command Setup

```bash
cd revia
npm run setup
```

This will:

1. Copy `.env.example` → `.env` (if missing)
2. Run `npm install`
3. Start PostgreSQL via Docker Compose
4. Push the Prisma schema
5. Seed demo data (1 user, 1 deck, 1 lesson, 3 cards)

## Run the App

### Development

```bash
npm run dev
```

Open **http://localhost:3000**

### Production mode (local)

```bash
npm run prod
```

## Verify Everything Works

```bash
npm run check
```

Runs: TypeScript → unit tests → production build

### Health check

```bash
curl http://localhost:3000/api/health
```

Expected: `{"status":"ok","timestamp":"..."}`

## Manual Test Checklist (v1)

### Without Supabase (mock user)

| Step | URL | Verify |
|------|-----|--------|
| 1 | `/dashboard` | Due count, streak, recent decks |
| 2 | `/decks` | Lists seeded "Getting Started" deck |
| 3 | `/decks/[id]` | Lessons list, tap lesson to study |
| 4 | `/review` | Due cards, reveal, rate 1–5, next card advances quickly |
| 5 | `/search` | Search "hello" or deck title |
| 6 | `/settings` | Theme toggle, import form visible |

### With Supabase Auth

| Step | URL | Verify |
|------|-----|--------|
| 1 | `/login` | Sign in with email/password |
| 2 | `/auth/callback` | Redirects to dashboard after signup |
| 3 | `/settings` | Account section shows email, sign out works |
| 4 | Sign out → `/login` | Unauthenticated redirect |

### After review session

| Step | Verify |
|------|--------|
| Dashboard | Due count decreased, reviewed today increased |
| Review again | Fewer or zero due cards |

## Seeded Demo Data

- User: mock user (`MOCK_USER_ID` in `.env`)
- Deck: "Getting Started"
- Lesson: "Basics"
- Cards: 3 cards due immediately

## Automated Tests

| Type | Command | Coverage |
|------|---------|----------|
| Unit | `npm run test` | Scheduler algorithm |
| E2E | `npm run test:e2e` | Health, nav, decks, review, theme |
| All | `npm run check` | typecheck + unit + build |

E2E uses iPhone 13 viewport (mobile-first).

## Deploy to Vercel

See [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md).

**Critical:** Set Vercel **Root Directory** to `revia`.

**Production:** `https://revialearn.vercel.app`

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 500 on dev | Kill stale `next` processes, `rm -rf .next`, restart |
| DB connection failed | Check `DATABASE_URL`; use Supabase pooler port 6543 in prod |
| Login redirect loop | Add callback URL in Supabase auth settings |
| Site 404 on Vercel | Root Directory must be `revia`; redeploy |
| Slow review on mobile | Ensure `regions: ["bom1"]` in `vercel.json` is deployed |
