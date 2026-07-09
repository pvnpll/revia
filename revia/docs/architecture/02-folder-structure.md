# 02 — Folder Structure (v2)

Feature-based architecture. Business logic centralized in `lib/`. UI organized by feature.

## Root Layout

```
revia/
├── docs/architecture/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── src/
│   ├── app/                 # Next.js routes + API handlers
│   ├── components/          # Shared UI (shadcn, layout)
│   ├── features/            # Feature modules
│   ├── lib/                 # Business logic (framework-agnostic)
│   └── types/               # Shared TypeScript types
├── tests/
├── docker-compose.yml
└── package.json
```

---

## `src/app/` — Routes & API

```
src/app/
├── layout.tsx
├── page.tsx                         # → redirect /dashboard
├── globals.css
├── (app)/
│   ├── layout.tsx                   # App shell
│   ├── dashboard/page.tsx
│   ├── decks/
│   │   ├── page.tsx
│   │   └── [deckId]/page.tsx
│   ├── lessons/                     # future
│   ├── review/
│   ├── statistics/
│   └── settings/
└── api/                             # ★ ALL business operations
    ├── health/route.ts
    ├── decks/
    │   ├── route.ts                 # GET list, POST create
    │   └── [deckId]/route.ts        # GET, PATCH, DELETE
    ├── lessons/                     # planned
    ├── cards/                       # planned
    ├── review/                      # planned
    ├── statistics/                  # planned
    └── dashboard/                   # planned
```

**Rule:** Route Handlers are thin — parse request, validate with Zod, call `lib/services`, return JSON.

```typescript
// app/api/decks/route.ts — pattern
export async function POST(req: Request) {
  const body = createDeckSchema.parse(await req.json());
  const deck = await deckService.create(getUserId(req), body);
  return jsonResponse(deck, 201);
}
```

Server Actions (if any) only re-export or redirect — **no business logic**.

---

## `src/features/` — Feature Modules

Each feature is self-contained:

```
src/features/
├── decks/
│   ├── components/
│   │   ├── deck-list.tsx
│   │   ├── deck-card.tsx
│   │   ├── create-deck-form.tsx
│   │   └── delete-deck-button.tsx
│   ├── hooks/
│   │   ├── use-decks.ts           # TanStack Query
│   │   └── use-create-deck.ts
│   ├── services/
│   │   └── deck-api.ts            # fetch('/api/decks')
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── index.ts
├── lessons/                         # planned
├── cards/
├── review/
├── dashboard/
├── statistics/
└── settings/
```

**Feature `services/`** = HTTP client only (calls `/api`).  
**Feature `hooks/`** = TanStack Query wrappers.  
**Feature `components/`** = React UI using hooks + React Hook Form.

---

## `src/lib/` — Business Logic

```
src/lib/
├── scheduler/                       # ★ Pure TS — no imports from next/react/prisma
│   ├── types.ts
│   ├── rating.ts
│   ├── engine.ts
│   ├── algorithms/
│   │   ├── simple-interval.ts
│   │   ├── sm2.ts                   # future
│   │   └── fsrs.ts                  # future
│   └── index.ts
├── db/
│   └── prisma.ts
├── repositories/
│   ├── deck.repository.ts
│   ├── lesson.repository.ts         # planned
│   ├── card.repository.ts
│   ├── review.repository.ts
│   └── scheduling-state.repository.ts
├── services/
│   ├── deck.service.ts
│   ├── lesson.service.ts
│   ├── card.service.ts
│   ├── review.service.ts
│   └── stats.service.ts
├── validators/
│   ├── deck.schema.ts
│   ├── card.schema.ts
│   └── review.schema.ts
├── api/
│   ├── response.ts                  # jsonResponse, apiError
│   └── auth.ts                      # getUserId from request
└── utils/
    ├── result.ts
    └── ids.ts
```

---

## `src/components/` — Shared UI

```
src/components/
├── ui/                              # shadcn/ui
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── label.tsx
│   └── ...
├── layout/
│   ├── app-shell.tsx
│   ├── app-sidebar.tsx
│   └── page-header.tsx
└── providers/
    └── query-provider.tsx
```

---

## `src/types/` — Shared Types

```
src/types/
├── api.ts                           # ApiResponse<T>, ApiError
├── ids.ts                           # Branded ID types
├── deck.ts
├── card.ts
└── review.ts
```

---

## `tests/`

```
tests/
├── unit/
│   └── lib/
│       └── scheduler/
│           └── simple-interval.test.ts
├── integration/
│   └── api/
│       └── decks.test.ts
└── e2e/
```

---

## Import Rules

```
features/     → components/, types/, features/*/services (fetch only)
components/   → components/ui, lib/utils (cn only)
app/api/      → lib/services, lib/validators, lib/api
lib/services/ → lib/repositories, lib/scheduler
lib/scheduler → (nothing external)
app/pages/    → features/, components/
```

**Forbidden:**
- `features/` importing `@prisma/client`
- `features/` importing `lib/scheduler`
- `lib/scheduler` importing anything from Next.js, React, or Prisma
- Business logic inside `app/api/route.ts` beyond validation + service call

---

## Migration from v1

| v1 path | v2 path |
|---------|---------|
| `src/domain/scheduling/` | `src/lib/scheduler/` |
| `src/application/use-cases/` | `src/lib/services/` |
| `src/infrastructure/repositories/` | `src/lib/repositories/` |
| `src/presentation/features/` | `src/features/` |
| `src/presentation/components/` | `src/components/` |
| `src/app/actions/` | **Removed** → `src/app/api/` |
