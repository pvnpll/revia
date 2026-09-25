# 04 — Core Types & Contracts (v2)

Shared types live in `src/types/`. Scheduler contracts in `src/lib/scheduler/types.ts`.

---

## API Envelope (`src/types/api.ts`)

```typescript
export interface ApiSuccess<T> {
  data: T;
}

export interface ApiErrorBody {
  error: {
    code: "VALIDATION" | "NOT_FOUND" | "UNAUTHORIZED" | "CONFLICT" | "INTERNAL";
    message: string;
    field?: string;
  };
}

export type ApiResult<T> = ApiSuccess<T> | ApiErrorBody;
```

---

## Branded IDs (`src/types/ids.ts`)

```typescript
export type UserId = string & { readonly __brand: "UserId" };
export type DeckId = string & { readonly __brand: "DeckId" };
export type LessonId = string & { readonly __brand: "LessonId" };
export type CardId = string & { readonly __brand: "CardId" };
export type ReviewSessionId = string & { readonly __brand: "ReviewSessionId" };
```

---

## Deck Types (`src/types/deck.ts`)

```typescript
export interface Deck {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  subject: string | null;
  color: string;
  isArchived: boolean;
  createdAt: string;   // ISO — JSON-safe for mobile
  updatedAt: string;
}

export interface DeckWithStats extends Deck {
  cardCount: number;
  dueCount: number;
}
```

---

## Scheduler Types (`src/lib/scheduler/types.ts`)

Pure module — no Prisma, no React.

```typescript
export type RatingValue = 1 | 2 | 3 | 4 | 5;

export interface CardSchedulingState {
  cardId: string;
  dueAt: Date;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  lastReviewedAt: Date | null;
  algorithmVersion: string;
  algorithmState: Record<string, unknown> | null;
}

export interface ReviewRecord {
  rating: RatingValue;
  reviewedAt: Date;
  intervalBefore: number;
  intervalAfter: number;
}

export interface ScheduleResult {
  dueAt: Date;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  algorithmVersion: string;
  algorithmState: Record<string, unknown> | null;
}

export interface SchedulingInput {
  state: CardSchedulingState;
  rating: RatingValue;
  reviewHistory: readonly ReviewRecord[];
  now: Date;
}

export interface SchedulingAlgorithm {
  readonly version: string;
  calculateNext(input: SchedulingInput): ScheduleResult;
  initialSchedule(now: Date): ScheduleResult;
}
```

---

## Service Interfaces

Services are plain objects/functions — no framework coupling:

```typescript
// lib/services/deck.service.ts
export const deckService = {
  list(userId: string): Promise<DeckWithStats[]>;
  getById(userId: string, deckId: string): Promise<Deck | null>;
  create(userId: string, input: CreateDeckInput): Promise<Deck>;
  update(userId: string, deckId: string, input: UpdateDeckInput): Promise<Deck>;
  delete(userId: string, deckId: string): Promise<void>;
};
```

---

## Zod Schemas (`lib/validators/`)

Shared between Route Handlers and React Hook Form:

| Schema | Used by |
|--------|---------|
| `createDeckSchema` | POST `/api/decks`, CreateDeckForm |
| `updateDeckSchema` | PATCH `/api/decks/:id` |
| `submitReviewSchema` | POST `/api/review` (planned) |
| `createCardSchema` | POST `/api/cards` (planned) |

---

## Feature API Client (`features/decks/services/deck-api.ts`)

```typescript
export const deckApi = {
  list: (): Promise<DeckWithStats[]> =>
    fetchJson("/api/decks"),

  create: (input: CreateDeckInput): Promise<Deck> =>
    fetchJson("/api/decks", { method: "POST", body: JSON.stringify(input) }),

  delete: (id: string): Promise<void> =>
    fetchJson(`/api/decks/${id}`, { method: "DELETE" }),
};
```

HTTP only — no direct service/repository imports in features.
