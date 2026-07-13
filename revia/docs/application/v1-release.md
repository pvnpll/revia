# Revia v1.0.0 — Release Snapshot

**Version:** v1.0.0 (see [release-versioning.md](./release-versioning.md))  
**Status:** **Published** (14 July 2026)  
**Production:** [https://revialearn.vercel.app](https://revialearn.vercel.app)

---

## What v1 Delivers

Revia v1 is a **mobile-first spaced repetition learning app**. A personal user can:

1. Sign up / sign in (Supabase Auth)
2. Import or create decks with lessons and cards
3. Study lessons with a swipe-based card viewer
4. Complete daily review sessions with 1–5 ratings
5. See progress on the dashboard (due count, streak, reviewed today)
6. Search across decks, lessons, and cards
7. Configure theme and account in Settings

The core learning loop is **functional end-to-end**.

---

## Infrastructure (v1)

| Component | Detail |
|-----------|--------|
| **Hosting** | Vercel — Root Directory must be `revia` |
| **Function region** | `bom1` (Mumbai) — see `vercel.json` |
| **Database** | Supabase Postgres — `ap-south-1` |
| **Auth** | Supabase (`@supabase/ssr`) |
| **ORM** | Prisma with pooler (`DATABASE_URL` port 6543) |

See [DEPLOY-VERCEL.md](../DEPLOY-VERCEL.md) for full deployment guide.

---

## Feature Completion Summary

| Feature | v1 Status |
|---------|-----------|
| Dashboard | ✅ Complete |
| Decks (list, create, delete, detail) | ✅ Complete |
| Lessons (create, delete, study) | ✅ Complete |
| Review (due queue, ratings, scheduler) | ✅ Complete |
| Search | ✅ Complete |
| Settings (theme, import, account) | ✅ Complete |
| JSON import | ✅ Complete |
| Supabase Auth | ✅ Complete |
| Mobile shell + floating nav | ✅ Complete |
| Deck edit UI | ⏳ API only |
| Lesson edit/reorder UI | ⏳ API only |
| Card management UI on deck page | ⏳ API exists; UI not mounted |
| Tags UI | ⏳ Schema + import only |
| Export | ⏳ Not started |
| Statistics / charts | ⏳ Not started |
| Media upload (image/audio) | ⏳ Schema only |
| Admin / roles | ⏳ Not started |

---

## Performance Optimizations (v1)

Applied in code for mobile UX:

- Optimistic review UI — next card shows immediately; rating saves in background
- Vercel functions in Mumbai (`bom1`) aligned with Supabase region
- Middleware skips API auth (routes validate themselves)
- Cached session read; no per-request user DB sync on hot path
- TanStack Query prefetch on app load and nav tap
- Dashboard loads 5 recent decks only; optimized streak SQL
- Lesson study loads cards by `lessonId`, not entire deck
- Review batch size: 30 cards

---

## Key Docs (start here)

| Audience | Document |
|----------|----------|
| Non-technical users | [layman-guide.md](./layman-guide.md) |
| Developers | [technical-reference.md](./technical-reference.md) |
| What's next | [progress-and-roadmap.md](./progress-and-roadmap.md) |
| Deploy | [DEPLOY-VERCEL.md](../DEPLOY-VERCEL.md) |
| Architecture | [architecture/README.md](../architecture/README.md) |
| Testing | [TESTING.md](../TESTING.md) |
| Product scope | [product-doc](./product-doc) |

---

## Git / Repo Layout

```
Build/                  ← Git root
  revia/                ← Application (Vercel Root Directory)
    src/
    prisma/
    docs/
```

Pushes to `main` → Production. Pushes to `develop` → Preview (when configured in Vercel Environments).
