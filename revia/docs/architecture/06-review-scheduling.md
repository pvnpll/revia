# 06 — Review Scheduling (v2)

The scheduler lives entirely in **`src/lib/scheduler/`** — a pure TypeScript module with zero dependencies on Next.js, React, Prisma, or PostgreSQL.

---

## Module Structure

```
src/lib/scheduler/
├── types.ts              # CardSchedulingState, ScheduleResult, SchedulingAlgorithm
├── rating.ts             # RATING constants, validation
├── engine.ts             # SchedulingEngine wrapper
├── algorithms/
│   ├── simple-interval.ts   # MVP default
│   ├── sm2.ts                 # future
│   └── fsrs.ts                # future
└── index.ts              # public exports
```

---

## Isolation Rules

| Rule | Enforcement |
|------|-------------|
| No `import` from `next`, `react`, `@prisma/client` | ESLint + code review |
| No file I/O or network | Pure functions only |
| No card content fields in inputs | TypeScript interfaces |
| Unit tests run without database | Vitest |

---

## Usage (server-side only)

Only `lib/services/review.service.ts` calls the scheduler:

```typescript
import { schedulingEngine } from "@/lib/scheduler";

const result = schedulingEngine.submitReview({
  state,
  rating: input.rating,
  reviewHistory: history,
  now: new Date(),
});
```

Route Handlers call `reviewService` — never the scheduler directly.  
Mobile apps call `POST /api/review` — same service path.

---

## Algorithm Swap

```typescript
// lib/scheduler/index.ts
import { SimpleIntervalAlgorithm } from "./algorithms/simple-interval";

const algorithm = new SimpleIntervalAlgorithm();
export const schedulingEngine = new SchedulingEngine(algorithm);
```

To swap to FSRS: change one import. Services and API unchanged.

---

## Rating → Interval (Simple Interval v1)

| Rating | Label | Behavior |
|--------|-------|----------|
| 1 | Forgot | Reset to 1 day, repetitions → 0 |
| 2 | Hard | 0.6× interval |
| 3 | Okay | 1.0× interval |
| 4 | Good | 1.3× interval |
| 5 | Perfect | 1.8× interval |

Monotonicity: `interval(1) ≤ interval(2) ≤ … ≤ interval(5)` for same state.

See v1 doc for full pseudocode — algorithm logic unchanged, only location moved to `lib/scheduler/`.

---

## Tests

```
tests/unit/lib/scheduler/simple-interval.test.ts
```

Must pass with zero database dependency.
