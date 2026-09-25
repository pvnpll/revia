# 05 — Data Flow (v2)

## Standard Request Flow

```mermaid
sequenceDiagram
  participant UI as Feature Component
  participant Hook as useDecks hook
  participant API as /api/decks
  participant SVC as deckService
  participant REPO as deckRepository
  participant DB as PostgreSQL

  UI->>Hook: render / user action
  Hook->>API: fetch GET /api/decks
  API->>API: Zod validate (if body)
  API->>SVC: deckService.list(userId)
  SVC->>REPO: findByUser(userId)
  REPO->>DB: prisma.deck.findMany
  DB-->>REPO: rows
  REPO-->>SVC: Deck[]
  SVC-->>API: Deck[]
  API-->>Hook: { data: Deck[] }
  Hook-->>UI: cached data
```

## Create Deck Flow

```mermaid
sequenceDiagram
  participant Form as CreateDeckForm
  participant RHF as React Hook Form + Zod
  participant Hook as useCreateDeck
  participant API as POST /api/decks
  participant SVC as deckService
  participant REPO as deckRepository

  Form->>RHF: submit
  RHF->>RHF: client Zod validation
  RHF->>Hook: mutate(values)
  Hook->>API: POST JSON body
  API->>API: createDeckSchema.parse(body)
  API->>SVC: deckService.create(userId, input)
  SVC->>REPO: create(input)
  REPO-->>SVC: Deck
  SVC-->>API: Deck
  API-->>Hook: { data: Deck } 201
  Hook->>Hook: invalidateQueries(['decks'])
  Hook-->>Form: success → redirect
```

## Review Submit Flow (planned)

```mermaid
sequenceDiagram
  participant UI as ReviewSession
  participant API as POST /api/review
  participant SVC as reviewService
  participant SCHED as lib/scheduler
  participant REPO as repositories

  UI->>API: { cardId, rating, sessionId }
  API->>SVC: submitReview(input)
  SVC->>REPO: getSchedulingState(cardId)
  SVC->>SCHED: engine.calculateNext(state, rating)
  Note over SCHED: Pure function — no I/O
  SCHED-->>SVC: ScheduleResult
  SVC->>REPO: save state + review log (transaction)
  SVC-->>API: ScheduleResult
  API-->>UI: { data: result }
```

## Error Flow

```mermaid
flowchart TD
  A[Request] --> B{Zod valid?}
  B -->|No| C[400 ApiError VALIDATION]
  B -->|Yes| D[Service call]
  D --> E{Found?}
  E -->|No| F[404 ApiError NOT_FOUND]
  E -->|Yes| G[200/201 data]
```

## Client vs Server State

| Data | Mechanism |
|------|-----------|
| Deck list | TanStack Query `useDecks()` |
| Create deck | `useMutation` → POST `/api/decks` |
| Form fields | React Hook Form local state |
| Review session | Feature hook `useReviewSession` (ephemeral) |
| Scheduler | Never on client — server only via API |

## Mobile Parity

Mobile app uses identical flows — only the UI layer differs:

```
Web:    CreateDeckForm → useCreateDeck → fetch('/api/decks')
Mobile: CreateDeckScreen → DeckRepository.create() → HTTP POST /api/decks
```

Both hit the same Route Handler and `deckService`.
