# Progress and Roadmap

**Last updated:** July 2026 — **v1.0 stable baseline**  
**Policy:** Incremental changes from here. Review phases below before requesting implementation.

---

## v1 Summary

Revia v1 is **stable and deployed**. The personal learning loop works:

```text
Import or create content → Study lessons → Daily review → Track on dashboard
```

| Area | v1 Status |
|------|-----------|
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

**Release snapshot:** [v1-release.md](./v1-release.md)

---

## Completed Phases (v1)

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

## Upcoming Phases (for your review)

> **Not committed.** Review this list, mark what you want, add items, or defer. Implementation only after you approve.

### Phase A — Content editing UI

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

### Phase B — Export

**Goal:** Portable backup and sharing prep (personal use).

| Item | Effort | Value |
|------|--------|-------|
| `GET /api/decks/:id/export` — JSON | Small | High |
| Export all decks | Medium | Medium |
| Future `.revia` package format | Large | Low (v2+) |

**Depends on:** Nothing.

---

### Phase C — Statistics and progress

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

### Phase D — Tags

**Goal:** Organize and filter content.

| Item | Effort | Value |
|------|--------|-------|
| Tag CRUD API | Small | Medium |
| Tag picker on deck/card forms | Medium | Medium |
| Filter decks by tag | Medium | Medium |
| Tag display on deck list | Small | Low |

**Depends on:** Prisma schema (exists).

---

### Phase E — Rich cards (media)

**Goal:** Image and audio on flashcards.

| Item | Effort | Value |
|------|--------|-------|
| Supabase Storage bucket + upload API | Medium | High |
| Image display in `StudyCardViewer` | Small | High |
| Audio playback on cards | Medium | Medium |
| Camera capture on mobile | Large | Medium |

**Depends on:** Supabase Storage setup.

---

### Phase F — Import expansion

**Goal:** More ways to get content in.

| Item | Effort | Value |
|------|--------|-------|
| CSV import (front, back columns) | Medium | High |
| Anki `.apkg` import | Large | High |
| Markdown import | Medium | Low |
| PDF → cards (AI-assisted) | Large | Low (v2+) |

**Depends on:** Phase A (card UI) helpful but not required.

---

### Phase G — Review enhancements

**Goal:** Smarter, more flexible review.

| Item | Effort | Value |
|------|--------|-------|
| Filter review by deck | Small | Medium |
| Custom daily review limit | Small | Low |
| "Cram" mode (ignore schedule) | Medium | Medium |
| Review session history page | Medium | Low |
| Alternative scheduler algorithms | Large | Low |
| Leech detection (cards failed N times) | Medium | Medium |

**Depends on:** Nothing for deck filter; session page needs UI design.

---

### Phase H — Platform and admin

**Goal:** Owner tools and future multi-user prep.

| Item | Effort | Value |
|------|--------|-------|
| Role field on User (admin/user) | Small | Low |
| Admin: seed sample decks | Medium | Low |
| Admin: view all users (if multi-tenant) | Large | Low (v2+) |
| Public deck marketplace | Large | Out of scope |

**Depends on:** Product decision on multi-user.

---

### Phase I — Mobile native (future)

**Goal:** Android/iOS apps consuming same API.

| Item | Effort | Value |
|------|--------|-------|
| OpenAPI spec from existing routes | Medium | High |
| React Native or Flutter client | Very large | High |
| Offline review queue | Very large | High |
| Push notifications (due cards) | Large | Medium |

**Depends on:** v1 API stability (achieved).

---

## Suggested Priority (agent recommendation)

If you want a sensible default order when you pick items:

1. **Phase A** — Content editing UI (biggest daily-use gap)
2. **Phase B** — Export (backup + peace of mind)
3. **Phase C** — Statistics (motivation + insight)
4. **Phase E** — Media (if visual/audio learning matters)
5. **Phase D** — Tags (when library grows)
6. **Phase F/G/H/I** — As needed

---

## How to Request Work

When ready, tell the agent something like:

- "Implement Phase A — deck edit and card UI on deck page"
- "Skip statistics for now; do export only"
- "Add Phase G cram mode to the roadmap and build it"

The agent should treat v1 as frozen unless you explicitly approve a phase or item.

---

## Doc Maintenance

Update this file when:

- A phase is completed (move to Completed section)
- You approve, defer, or cancel a roadmap item
- Infrastructure changes (new region, new auth provider, etc.)

Related docs to keep in sync:

- [v1-release.md](./v1-release.md)
- [layman-guide.md](./layman-guide.md)
- [technical-reference.md](./technical-reference.md)
- [README.md](../../README.md)
- [architecture/README.md](../architecture/README.md)
