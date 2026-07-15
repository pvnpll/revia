# 06 — Review Scheduling (v2)

Scheduling lives in **`src/lib/scheduler/`** — pure TypeScript with no React, Next.js, or Prisma imports in algorithm code.

---

## Two Learning Modes (v1.4+)

| Mode | Scheduler | Where | Persists to DB |
|------|-----------|-------|--------------|
| **Practice** | `PracticeScheduler` | Client (`PracticeSession`) | No |
| **Daily Review** | `DailyReviewScheduler` | Server (`review.service.ts`) | Yes — `CardSchedulingState`, `ReviewLog` |

Both use the same 1–5 ratings and shared `StudyCardViewer` UI.

---

## Module Structure

```
src/lib/scheduler/
├── types.ts                  # RatingValue, CardSchedulingState, SchedulingAlgorithm
├── engine.ts                 # SchedulingEngine wrapper
├── practice-scheduler.ts     # Endless queue (client-only)
├── daily-review-scheduler.ts # SRS wrapper for Daily Review
├── algorithms/
│   └── simple-interval.ts    # simple-v1 (Daily Review)
└── index.ts                  # public exports
```

---

## PracticeScheduler (client)

- **Initial queue:** shuffled card IDs
- **On rating:** remove current card, reinsert after randomized gap
- **Gap ranges (cards before reappearance):**

| Rating | Approx. gap |
|--------|-------------|
| 1 | 2–4 |
| 2 | 5–9 |
| 3 | 10–18 |
| 4 | 19–35 |
| 5 | 36–55 |

Does **not** read or write `dueAt` / `nextReviewDate`.

Tests: `tests/unit/lib/scheduler/practice-scheduler.test.ts`

---

## DailyReviewScheduler (server)

Wraps `SchedulingEngine` + `SimpleIntervalAlgorithm` (`simple-v1`).

Only `review.service.ts` calls it:

```typescript
import { DailyReviewScheduler } from "@/lib/scheduler/daily-review-scheduler";

DailyReviewScheduler.submitReview({ state, rating, reviewHistory, now });
```

Route handlers call `reviewService` — not schedulers directly.

---

## Rating → Interval (Simple Interval v1, Daily Review only)

| Rating | Label | Behavior |
|--------|-------|----------|
| 1 | Forgot | Reset to 1 day, repetitions → 0 |
| 2 | Hard | 0.6× interval |
| 3 | Okay | 1.0× interval |
| 4 | Good | 1.3× interval |
| 5 | Perfect | 1.8× interval |

Monotonicity: `interval(1) ≤ interval(2) ≤ … ≤ interval(5)` for same state.

---

## Isolation Rules

| Rule | Enforcement |
|------|-------------|
| No `import` from `next`, `react`, `@prisma/client` in scheduler | Code review |
| Practice queue state stays on client | `PracticeSession` only |
| Daily Review state in Postgres | `review.repository.ts` |

---

## Tests

```
tests/unit/lib/scheduler/simple-interval.test.ts
tests/unit/lib/scheduler/practice-scheduler.test.ts
```

Must pass with zero database dependency.
