# Vercel + Supabase deployment

Deploy Revia to Vercel with Supabase Auth and Postgres.

## 1. Import to Vercel

1. Push this repo to GitHub: `https://github.com/pvnpll/revia`
2. Open [vercel.com/new](https://vercel.com/new) → Import the repo
3. **Root Directory:** `revia` (important — app lives in the `revia/` folder)
4. Framework: **Next.js** (auto-detected)
5. Do **not** deploy yet — add env vars first (step 2)

## 2. Environment variables

In Vercel → Project → **Settings → Environment Variables**, add for **Production** and **Preview**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ophrrajusdwhuxvnsjrr.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase → Settings → API → anon key |
| `DATABASE_URL` | Transaction pooler (port **6543**) — see below |
| `DIRECT_URL` | Session pooler (port **5432**) — see below |
| `SUPABASE_PROJECT_REF` | `ophrrajusdwhuxvnsjrr` |

**Pooler URLs** (replace `[PASSWORD]` with your DB password):

```bash
# Runtime (Vercel serverless) — transaction pooler
DATABASE_URL="postgresql://postgres.ophrrajusdwhuxvnsjrr:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"

# Migrations / Prisma direct — session pooler
DIRECT_URL="postgresql://postgres.ophrrajusdwhuxvnsjrr:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

Or auto-generate values + update Supabase auth redirects:

```bash
cd revia
VERCEL_URL="https://your-app.vercel.app" \
SUPABASE_ACCESS_TOKEN="sbp_..." \
SUPABASE_PROJECT_REF="ophrrajusdwhuxvnsjrr" \
npx tsx scripts/vercel-supabase-setup.ts
```

Copy the printed env vars into Vercel.

## 3. Supabase auth URLs

In [Supabase → Authentication → URL Configuration](https://supabase.com/dashboard/project/ophrrajusdwhuxvnsjrr/auth/url-configuration):

| Setting | Value |
|---------|-------|
| **Site URL** | `https://your-app.vercel.app` |
| **Redirect URLs** | `https://your-app.vercel.app/auth/callback` |
| | `https://*-*.vercel.app/auth/callback` (preview deploys) |
| | `http://localhost:3000/auth/callback` (local dev) |

The setup script above applies these automatically when you pass `VERCEL_URL`.

## 4. Database schema

Schema is already on Supabase. If you need to re-apply:

```bash
cd revia
npm run db:push
```

## 5. Deploy

**From GitHub (recommended):** Push to `main` — Vercel auto-deploys.

**From CLI:**

```bash
cd revia
npx vercel login
npx vercel link          # link to your Vercel project
npx vercel --prod        # production deploy
```

## 6. Verify

1. Open your Vercel URL → should redirect to `/login`
2. Sign up → should land on `/dashboard`
3. Create a deck → data persists in Supabase Postgres
4. Sign out from Settings → returns to `/login`

## Architecture

```text
Browser → Vercel (Next.js) → Supabase Auth (sessions)
                            → Supabase Postgres (Prisma)
```

- **Auth:** Supabase cookies via `@supabase/ssr` middleware
- **Data:** Prisma → Supabase Postgres pooler
- **Local dev:** same Supabase project, `localhost:3000` redirect URLs

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Prisma | Ensure `postinstall` runs (`prisma generate` in package.json) |
| 500 after deploy | Check Vercel env vars; `DATABASE_URL` must use port **6543** |
| Login redirect fails | Add Vercel URL to Supabase redirect URLs |
| API returns HTML not JSON | Fixed — API routes bypass page auth redirect |
