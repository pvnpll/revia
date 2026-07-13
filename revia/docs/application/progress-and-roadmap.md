# Progress and Roadmap

**Last updated:** July 2026 — **v1.0.0** (first stable release)  
**Versioning:** [release-versioning.md](./release-versioning.md) — SemVer; every `main` merge = new version  
**Policy:** Plan features by target release. Implement after you approve. Publish release notes only when you ask.

---

## Release map (proposed)

| Version | Status | Scope | Roadmap |
|---------|--------|-------|---------|
| **v1.0.0** | ✅ Published | Core app + deploy | Phases 0–12 |
| **v1.0.1** | Open | Patches: bugs, perf, deploy fixes | Ad-hoc |
| **v1.1.0** | Planned | Content editing UI | Phase A |
| **v1.2.0** | Planned | JSON export | Phase B |
| **v1.3.0** | Planned | Statistics / charts | Phase C |
| **v1.4.0** | Planned | Tags | Phase D |
| **v1.5.0** | Planned | Image/audio cards | Phase E |
| **v1.6.0** | Planned | CSV import, review filters | Phase F + G |
| **v2.0.0** | Future | Breaking changes, roles, native API | Phase H / I |

Release notes: [docs/releases/](../releases/) · Changelog: [CHANGELOG.md](../../CHANGELOG.md)

---

## v1.0.0 Summary

Revia **v1.0.0** is **stable and deployed**. The personal learning loop works:

```text
Import or create content → Study lessons → Daily review → Track on dashboard
```

| Area | v1.0.0 Status |
|------|---------------|
| Auth (Supabase) | ✅ Shipped |
| Dashboard | ✅ Shipped |
| Decks | ✅ Shipped |
| Lessons + study viewer | ✅ Shipped |
| Review + scheduler | ✅ Shipped |
| Search | ✅ Shipped |
| Settings + import | ✅ Shipped |
| Mobile shell | ✅ Shipped |
| Vercel + Supabase deploy | ✅ Shipped |
| Performance (mobile) | ✅ Optimized |

**Release notes:** [v1.0.0.md](../releases/v1.0.0.md) (**Published**) · [v1-release.md](./v1-release.md) (snapshot)

---

## Completed Phases (v1.0.0)

### Phase 0 — Architecture

- API-first, feature-based structure documented
- Pure scheduler isolated from UI/DB
- Docs in `docs/architecture/`

### Phase 1 — Scaffold

- Next.js 15, Prisma, PostgreSQL, seed data, Vitest scheduler tests

### Phase 2 — Architecture v2 migration

- `app/`, `features/`, `lib/`, `types/` layout
- All business logic behind `/api` route handlers

### Phase 3 — Decks

- Full deck API CRUD
- Deck list, create, delete, detail pages

### Phase 4 — Lessons

- Lesson API CRUD
- Lesson list, create, delete on deck detail
- Tap-to-study with `StudyCardViewer` (swipe, reverse mode)

### Phase 5 — Cards (backend)

- Card API CRUD with scheduling state on create
- Card components exist; not mounted on deck page in v1

### Phase 6 — Review

- Due queue API, submit review API
- Full-screen review UI with 1–5 ratings
- `SimpleIntervalAlgorithm` (`simple-v1`)
- Optimistic card advance for mobile UX

### Phase 7 — Dashboard

- Daily summary: due, reviewed, streak, totals
- Recent decks with due badges
- Review CTA

### Phase 8 — Search

- Search API across decks, lessons, cards
- Grouped results UI

### Phase 9 — Settings + Import

- Theme toggle (light/dark)
- JSON deck import (file + paste)
- Create deck, account sign-out, about

### Phase 10 — Auth

- Supabase email/password login and signup
- Middleware session protection
- Prisma user sync on auth callback
- Mock user for local dev without Supabase

### Phase 11 — Mobile shell + branding

- Floating bottom nav (Home, Decks, Review, Search)
- Desktop gate ("mobile-first" message)
- Revia branding and theme system

### Phase 12 — Deploy + performance

- Vercel production (`revialearn.vercel.app`)
- Supabase Postgres + Auth (`ap-south-1`)
- Vercel function region `bom1` (Mumbai)
- Query prefetching, optimistic review, DB query optimizations

---

## v1 Gaps (known, acceptable for baseline)

These exist in code partially but are **not required for v1 stability**:

| Gap | What exists | What's missing |
|-----|-------------|----------------|
| Deck edit | `PATCH /api/decks/:id` | Edit form in UI |
| Lesson edit/reorder | `PATCH` API, `useUpdateLesson` | Edit/reorder UI |
| Card management | Full API + forms in `features/cards/` | `CardsSection` on deck page |
| Tags | Prisma models + import | Tag API routes + UI |
| Export | — | API + UI |
| Statistics | Dashboard counts | Charts page `/statistics` |
| Media | Schema fields | Upload UI |
| Review sessions page | DB model | `/review/[sessionId]` route |

---

## Upcoming releases (for your review)

> Map features to **target versions** below. Adjust scope or merge versions before approving work.  
> See [release-versioning.md](./release-versioning.md) for MAJOR/MINOR/PATCH rules.

### v1.1.0 — Phase A: Content editing UI

**Goal:** Edit content without re-importing JSON.

| Item | Effort | Value |
|------|--------|-------|
| Deck edit form (title, description, subject, color) | Small | High |
| Lesson rename | Small | Medium |
| Lesson reorder (drag or up/down) | Medium | Medium |
| Mount `CardsSection` on deck detail | Medium | High |
| Inline card create/edit/delete on deck page | Medium | High |

**Depends on:** Nothing — APIs already exist.

---

### v1.2.0 — Phase B: Export

**Goal:** Portable backup and sharing prep (personal use).

| Item | Effort | Value |
|------|--------|-------|
| `GET /api/decks/:id/export` — JSON | Small | High |
| Export all decks | Medium | Medium |
| Future `.revia` package format | Large | Low (v2+) |

**Depends on:** Nothing.

---

### v1.3.0 — Phase C: Statistics and progress

**Goal:** Visual learning history beyond dashboard counts.

| Item | Effort | Value |
|------|--------|-------|
| `/statistics` page | Medium | High |
| Reviews per day chart (7/30 days) | Medium | High |
| Mature vs learning card breakdown | Small | Medium |
| Deck-level progress | Medium | Medium |
| Review heatmap (GitHub-style) | Large | Low |

**Depends on:** Review logs (already populated in v1).

---

### v1.4.0 — Phase D: Tags

**Goal:** Organize and filter content.

| Item | Effort | Value |
|------|--------|-------|
| Tag CRUD API | Small | Medium |
| Tag picker on deck/card forms | Medium | Medium |
| Filter decks by tag | Medium | Medium |
| Tag display on deck list | Small | Low |

**Depends on:** Prisma schema (exists).

---

### v1.5.0 — Phase E: Rich cards (media)

**Goal:** Image and audio on flashcards.

| Item | Effort | Value |
|------|--------|-------|
| Supabase Storage bucket + upload API | Medium | High |
| Image display in `StudyCardViewer` | Small | High |
| Audio playback on cards | Medium | Medium |
| Camera capture on mobile | Large | Medium |

**Depends on:** Supabase Storage setup.

---

### v1.6.0 — Phase F + G: Import expansion & review enhancements

**Goal:** More ways to get content in.

| Item | Effort | Value |
|------|--------|-------|
| CSV import (front, back columns) | Medium | High |
| Anki `.apkg` import | Large | High |
| Markdown import | Medium | Low |
| PDF → cards (AI-assisted) | Large | Low (v2+) |

### v1.6.0 — Phase F + G: Import expansion & review enhancements

**Goal:** More import options and flexible review.

| Item | Effort | Value |
|------|--------|-------|
| CSV import (front, back columns) | Medium | High |
| Filter review by deck | Small | Medium |
| "Cram" mode (ignore schedule) | Medium | Medium |
| Anki `.apkg` import | Large | High |
| Custom daily review limit | Small | Low |
| Leech detection (cards failed N times) | Medium | Medium |
| Markdown import | Medium | Low |

**Depends on:** v1.1.0 card UI helpful for import testing.

---

### v2.0.0 — Phase H + I: Platform (future)

**Goal:** Admin tools, roles, and native mobile clients.

| Item | Effort | Value |
|------|--------|-------|
| Role field on User (admin/user) | Small | Low |
| OpenAPI spec from existing routes | Medium | High |
| Admin: seed sample decks | Medium | Low |
| React Native or Flutter client | Very large | High |
| Offline review queue | Very large | High |
| Public deck marketplace | Large | Out of scope |

**Depends on:** Product decision on multi-user and native apps.

---

## Suggested priority (by release)

1. **v1.1.0** — Content editing UI
2. **v1.2.0** — Export
3. **v1.3.0** — Statistics
4. **v1.5.0** — Media (if needed)
5. **v1.4.0** — Tags
6. **v1.6.0+** / **v2.0.0** — As needed

---

## How to Request Work

When ready, tell the agent something like:

- "Build v1.1.0 — deck edit and card UI"
- "Skip v1.3.0 for now; ship v1.2.0 export only"
- "Publish release notes for v1.0.0"

The agent drafts release docs on `main` merges; **publishes only when you ask**.

---

## Doc Maintenance

Update this file when:

- A release ships (move to Completed, add release notes)
- You retarget a feature to a different version
- Infrastructure changes

Related docs:

- [release-versioning.md](./release-versioning.md)
- [docs/releases/](../releases/)
- [CHANGELOG.md](../../CHANGELOG.md)
- [v1-release.md](./v1-release.md)
- [layman-guide.md](./layman-guide.md)
- [technical-reference.md](./technical-reference.md)
