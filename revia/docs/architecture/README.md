# Revia — Architecture (v2)

> **v1.0 stable** — API-first, feature-based, scheduler isolated, deployed on Vercel + Supabase.

## Vision

Revia is a **generic spaced repetition platform**. The scheduler never knows what subject is being learned — only card state, rating, and time.

## Tech Stack

| Concern | Technology |
|---------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Forms | React Hook Form + Zod |
| Client data | TanStack Query |
| Auth | Supabase (`@supabase/ssr`) |
| ORM | Prisma |
| Database | PostgreSQL (Supabase `ap-south-1`) |
| Deploy | Vercel (`bom1` Mumbai) |

## Documents

| # | Document | Description |
|---|----------|-------------|
| 1 | [Overview](./01-overview.md) | Layers, mobile strategy, API-first design |
| 2 | [Folder Structure](./02-folder-structure.md) | Feature-based layout |
| 3 | [Database Schema](./03-database-schema.md) | Prisma/PostgreSQL |
| 4 | [Core Types & Contracts](./04-core-interfaces.md) | Shared types, scheduler port, API shapes |
| 5 | [Data Flow](./05-data-flow.md) | UI → API → Service → Repository |
| 6 | [Review Scheduling](./06-review-scheduling.md) | Pure `lib/scheduler` module |
| 7 | [State Management](./07-state-management.md) | TanStack Query + RHF |
| 8 | [Architectural Decisions](./08-architectural-decisions.md) | ADRs including v2 migration |

## Core Principles

1. **Business logic lives in `lib/`** — never in React components or Route Handlers
2. **Route Handlers (`/app/api`)** — all business operations (REST JSON)
3. **Scheduler isolation** — pure TypeScript in `lib/scheduler/`, zero DB/UI imports
4. **Feature folders** — each feature owns UI, hooks, API client
5. **Mobile-first** — phone UX primary; desktop shows guidance message
6. **Mobile-ready API** — future native apps consume the same `/api` endpoints

## Feature Status (v1)

| # | Feature | Status |
|---|---------|--------|
| 1 | Decks | ✅ Complete |
| 2 | Lessons | ✅ Complete |
| 3 | Cards (API) | ✅ API / ⏳ deck page UI |
| 4 | Review | ✅ Complete |
| 5 | Dashboard | ✅ Complete |
| 6 | Search | ✅ Complete |
| 7 | Settings + Import | ✅ Complete |
| 8 | Auth (Supabase) | ✅ Complete |
| 9 | Statistics | ⏳ Planned |
| 10 | Export | ⏳ Planned |
| 11 | Tags UI | ⏳ Planned |

**Roadmap for next phases:** [application/progress-and-roadmap.md](../application/progress-and-roadmap.md)

## Application Docs

For user-facing and developer documentation (v1 baseline):

- [v1 Release](../application/v1-release.md)
- [Layman Guide](../application/layman-guide.md)
- [Technical Reference](../application/technical-reference.md)
- [Progress & Roadmap](../application/progress-and-roadmap.md)
