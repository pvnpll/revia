# Revia — Architecture (v2)

> Production-ready web app with mobile-ready business logic.

**Status:** v2 architecture — API-first, feature-based, scheduler isolated.

## Vision

Revia is a **generic spaced repetition platform**. The scheduler never knows what subject is being learned — only card state, rating, and review history.

## Tech Stack

| Concern | Technology |
|---------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React, TypeScript, Tailwind CSS, shadcn/ui |
| Forms | React Hook Form + Zod |
| Client data | TanStack Query |
| ORM | Prisma |
| Database | PostgreSQL |
| Validation | Zod (API + forms) |

## Documents

| # | Document | Description |
|---|----------|-------------|
| 1 | [Overview](./01-overview.md) | Layers, mobile strategy, API-first design |
| 2 | [Folder Structure](./02-folder-structure.md) | Feature-based layout |
| 3 | [Database Schema](./03-database-schema.md) | Prisma/PostgreSQL (unchanged) |
| 4 | [Core Types & Contracts](./04-core-interfaces.md) | Shared types, scheduler port, API shapes |
| 5 | [Data Flow](./05-data-flow.md) | UI → API → Service → Repository |
| 6 | [Review Scheduling](./06-review-scheduling.md) | Pure `lib/scheduler` module |
| 7 | [State Management](./07-state-management.md) | TanStack Query + RHF |
| 8 | [Architectural Decisions](./08-architectural-decisions.md) | ADRs including v2 migration |

## Core Principles

1. **Business logic lives in `lib/`** — never in React components or Route Handlers
2. **Route Handlers (`/app/api`)** — all business operations (REST JSON)
3. **Server Actions** — optional, simple form-only shortcuts; no business rules
4. **Scheduler isolation** — pure TypeScript in `lib/scheduler/`, zero DB/UI imports
5. **Feature folders** — each feature owns UI, hooks, API client, types
6. **Mobile-ready** — Android/iOS will consume the same `/api` endpoints + `lib/` services

## Feature Rollout (Implementation Order)

| # | Feature | Status |
|---|---------|--------|
| 1 | **Decks** | In progress |
| 2 | Lessons | Planned |
| 3 | Cards | Planned |
| 4 | Review | Planned |
| 5 | Dashboard | Planned |
| 6 | Statistics | Planned |
| 7 | Settings | Planned |

Stop after each feature for review before continuing.

## Implemented Features

See [Feature Rollout](#feature-rollout-implementation-order) above.
