# Vercel + Supabase deployment

Deploy Revia to Vercel with Supabase Auth and Postgres.

## 1. Import to Vercel

1. Push this repo to GitHub: `https://github.com/pvnpll/revia`
2. Open [vercel.com/new](https://vercel.com/new) → Import the repo
3. **Root Directory:** `revia` ← **required** if your GitHub repo has the app in a `revia/` subfolder (fixes 404 / empty deploys)
4. Framework: **Next.js** (auto-detected)
5. Do **not** deploy yet — add env vars first (step 2)

### Can't find Root Directory?

It is **not** on the main General page. Use this direct link:

**[revia → Settings → Build and Deployment](https://vercel.com/pvnplls-projects/revia/settings/build-and-deployment)**

Then scroll down to the **Root Directory** section:

1. Click **Edit**
2. Enter `revia`
3. Click **Save**

If you imported the whole `Build` repo (not just `revia`), this setting is mandatory. Without it, git deploys build the repo root and the site returns **404**.

## 1b. Branch environments (main vs develop)

Vercel has three environment types:

| Environment | Purpose | Your setup |
|-------------|---------|------------|
| **Production** | Live site (`revialearn.vercel.app`) | `main` branch |
| **Preview** | Staging / testing before production | `develop` branch |
| **Development** | Local `vercel dev` only | your machine |

Open **[Settings → Environments](https://vercel.com/pvnplls-projects/revia/settings/environments)**:

**Production**
1. Click the **Production** card
2. Under **Branch Tracking**, set the branch to `main`
3. Save

**Preview (for develop)**
1. Click the **Preview** card
2. Under **Branch Tracking**:
   - Turn off **All unassigned branches** (if enabled)
   - Add branch pattern: `develop`
3. Save

Result:
- Push to `main` → deploys to **Production** → `https://revialearn.vercel.app`
- Push to `develop` → deploys to **Preview** → `https://revia-git-develop-pvnplls-projects.vercel.app`

> **Note:** A separate named "develop environment" (custom domain, separate env vars) requires Vercel **Pro** (Custom Environments). On the free plan, `develop` uses the **Preview** environment, which is the standard workflow.

Optional automation (requires a Vercel token):

```bash
cd revia
VERCEL_TOKEN="..." npx tsx scripts/vercel-project-setup.ts
```

Create a token at [vercel.com/account/tokens](https://vercel.com/account/tokens).

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
Browser → Vercel (Next.js, bom1 Mumbai) → Supabase Auth (sessions)
                                       → Supabase Postgres ap-south-1 (Prisma)
```

- **Auth:** Supabase cookies via `@supabase/ssr` middleware
- **Data:** Prisma → Supabase Postgres pooler (`aws-1-ap-south-1`)
- **Functions region:** `bom1` (Mumbai) in `vercel.json` — matches Supabase region for lowest API latency
- **Local dev:** same Supabase project, `localhost:3000` redirect URLs

### Region / latency notes

**Supabase region cannot be changed in-place.** Each project is locked to the region chosen at creation. To move regions you must create a new Supabase project and migrate data (see [Supabase docs](https://supabase.com/docs/guides/troubleshooting/change-project-region-eWJo5Z)).

Your project is already in **ap-south-1 (Mumbai)** — the nearest Supabase region for India. The main latency issue was Vercel API functions defaulting to **US East (`iad1`)** while the database is in India. `vercel.json` sets `"regions": ["bom1"]` so serverless functions run in Mumbai, next to the database.

If you ever need a different region, create a new Supabase project there, run `npm run db:push`, migrate data, and update env vars in Vercel.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Prisma | Ensure `postinstall` runs (`prisma generate` in package.json) |
| 500 after deploy | Check Vercel env vars; `DATABASE_URL` must use port **6543** |
| Login redirect fails | Add Vercel URL to Supabase redirect URLs |
| Build shows 0ms / site 404 | Set **Root Directory** to `revia` under [Build and Deployment](https://vercel.com/pvnplls-projects/revia/settings/build-and-deployment), then redeploy |
| Can't find Root Directory | It's under **Settings → Build and Deployment**, not General |
| `develop` should not go to production | Set Production branch to `main` and Preview branch tracking to `develop` under [Environments](https://vercel.com/pvnplls-projects/revia/settings/environments) |
| Slow API on mobile | Confirm `regions: ["bom1"]` in `vercel.json` is deployed |
| `DEPLOYMENT_NOT_FOUND` on production URL | Redeploy after fixing Root Directory |
