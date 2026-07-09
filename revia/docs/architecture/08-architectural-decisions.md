# 08 — Architectural Decisions (v2)

## ADR-021: API-First via Route Handlers

**Decision:** All business operations exposed as REST JSON Route Handlers under `/app/api`. Server Actions must not contain business logic.

**Rationale:** Mobile apps (Android/iOS) need the same endpoints as the web app. Route Handlers are the natural HTTP boundary. Server Actions are Next.js-specific and not consumable by mobile clients.

**Consequences:**
- (+) Web and mobile share one API
- (+) Easy to test with curl/Postman
- (+) Clear separation: HTTP glue in routes, logic in services
- (−) Slightly more boilerplate than Server Actions

---

## ADR-022: Business Logic in `lib/` Not Features

**Decision:** Services, repositories, scheduler, and validators live in `src/lib/`. Feature folders contain UI + HTTP client hooks only.

**Rationale:** Business rules must be UI-independent for mobile and future CLI/admin tools.

**Consequences:**
- (+) Single source of truth for rules
- (+) Features stay thin and swappable
- (−) Must resist importing `lib/services` from components (use API instead)

---

## ADR-023: React Hook Form + Zod for Forms

**Decision:** All forms use React Hook Form with Zod schemas shared with API validators.

**Rationale:** Client-side validation matches server validation. Better UX than uncontrolled forms. Production-standard pattern.

**Consequences:**
- (+) One schema, two consumers (form + API)
- (+) Accessible, performant forms
- (−) Additional dependencies (`react-hook-form`, `@hookform/resolvers`)

---

## ADR-024: TanStack Query for Client Server State

**Decision:** TanStack Query wraps all `/api` fetches in feature hooks.

**Rationale:** Caching, invalidation, loading/error states without global store. Works identically if API base URL changes for mobile.

**Consequences:**
- (+) Declarative data fetching in features
- (+) Optimistic updates possible later
- (−) Client-side fetch vs RSC (acceptable for interactive features)

---

## ADR-025: Scheduler in `lib/scheduler/` Pure Module

**Decision:** Move scheduler from `domain/` + `infrastructure/` to standalone pure module.

**Rationale:** Simplest possible isolation. Can be extracted to npm package or shared with mobile via duplicate-free server-side execution.

**Consequences:**
- (+) Trivial to unit test
- (+) Zero framework lock-in
- (−) Mobile runs scheduler via API, not locally (correct for consistency)

---

## ADR-026: Feature Rollout with Review Gates

**Decision:** Implement one feature at a time; stop for review after each.

**Order:** Decks → Lessons → Cards → Review → Dashboard → Statistics → Settings

**Rationale:** Controlled delivery, easier code review, incremental migration from v1.

---

## ADR-027: JSON ISO Dates in API Responses

**Decision:** API returns dates as ISO strings, not `Date` objects.

**Rationale:** JSON serialization. Mobile clients parse consistently.

---

## v1 → v2 Migration Map

| v1 | v2 |
|----|-----|
| Server Actions for CRUD | `/api/*` Route Handlers |
| `src/domain/` | `src/lib/scheduler/` + `src/types/` |
| `src/application/use-cases/` | `src/lib/services/` |
| `src/infrastructure/repositories/` | `src/lib/repositories/` |
| `src/presentation/features/` | `src/features/` |
| `src/presentation/components/` | `src/components/` |
| Uncontrolled forms | React Hook Form + Zod |

Previous ADRs (001–020) remain valid where not superseded by 021–027.
