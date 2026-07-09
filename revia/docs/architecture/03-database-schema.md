# 03 — Database Schema

PostgreSQL via Prisma. Schema separates **content** (what is learned) from **scheduling state** (when to review) — enforcing the subject-blind engine boundary at the data layer.

---

## Entity Relationship Diagram

```mermaid
erDiagram
  User ||--o{ Deck : owns
  User ||--o{ ReviewSession : has
  User ||--o{ Tag : creates

  Deck ||--o{ Lesson : contains
  Deck ||--o{ Card : contains
  Deck }o--o{ Tag : tagged

  Lesson ||--o{ Card : groups

  Card ||--|| CardSchedulingState : has
  Card ||--o{ ReviewLog : history
  Card }o--o{ Tag : tagged

  ReviewSession ||--o{ ReviewLog : records

  User {
    uuid id PK
    string email UK
    string name
    datetime createdAt
    datetime updatedAt
  }

  Deck {
    uuid id PK
    uuid userId FK
    string title
    string description
    string subject
    string color
    boolean isArchived
    datetime createdAt
    datetime updatedAt
  }

  Lesson {
    uuid id PK
    uuid deckId FK
    string title
    int sortOrder
    datetime createdAt
    datetime updatedAt
  }

  Card {
    uuid id PK
    uuid deckId FK
    uuid lessonId FK
    string front
    string back
    string pronunciation
    string exampleSentence
    string notes
    string imageUrl
    string audioUrl
    boolean isSuspended
    datetime createdAt
    datetime updatedAt
  }

  CardSchedulingState {
    uuid id PK
    uuid cardId FK UK
    datetime dueAt
    int intervalDays
    float easeFactor
    int repetitions
    int lapses
    datetime lastReviewedAt
    string algorithmVersion
    json algorithmState
    datetime createdAt
    datetime updatedAt
  }

  ReviewLog {
    uuid id PK
    uuid cardId FK
    uuid userId FK
    uuid sessionId FK
    int rating
    int intervalBefore
    int intervalAfter
    float easeBefore
    float easeAfter
    datetime reviewedAt
    int durationMs
    string algorithmVersion
  }

  ReviewSession {
    uuid id PK
    uuid userId FK
    uuid deckId FK
    datetime startedAt
    datetime completedAt
    int cardsReviewed
    int newCards
    int reviewCards
  }

  Tag {
    uuid id PK
    uuid userId FK
    string name UK
    string color
    datetime createdAt
  }

  CardTag {
    uuid cardId FK
    uuid tagId FK
  }

  DeckTag {
    uuid deckId FK
    uuid tagId FK
  }
```

---

## Prisma Schema (Design)

```prisma
// prisma/schema.prisma — DESIGN DOCUMENT (not yet applied)

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Identity ───────────────────────────────────────────────

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  decks          Deck[]
  tags           Tag[]
  reviewSessions ReviewSession[]
  reviewLogs     ReviewLog[]

  @@map("users")
}

// ─── Content ──────────────────────────────────────────────────

model Deck {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  title       String
  description String?
  subject     String?  // Display/metadata only — engine never reads this
  color       String?  @default("#6366f1")
  isArchived  Boolean  @default(false) @map("is_archived")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  lessons        Lesson[]
  cards          Card[]
  deckTags       DeckTag[]
  reviewSessions ReviewSession[]

  @@index([userId])
  @@index([userId, isArchived])
  @@map("decks")
}

model Lesson {
  id        String   @id @default(uuid())
  deckId    String   @map("deck_id")
  title     String
  sortOrder Int      @default(0) @map("sort_order")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  deck  Deck   @relation(fields: [deckId], references: [id], onDelete: Cascade)
  cards Card[]

  @@index([deckId, sortOrder])
  @@map("lessons")
}

model Card {
  id              String   @id @default(uuid())
  deckId          String   @map("deck_id")
  lessonId        String?  @map("lesson_id")
  front           String
  back            String
  pronunciation   String?
  exampleSentence String?  @map("example_sentence")
  notes           String?
  imageUrl        String?  @map("image_url")
  audioUrl        String?  @map("audio_url")
  isSuspended     Boolean  @default(false) @map("is_suspended")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  deck            Deck                 @relation(fields: [deckId], references: [id], onDelete: Cascade)
  lesson          Lesson?              @relation(fields: [lessonId], references: [id], onDelete: SetNull)
  schedulingState CardSchedulingState?
  reviewLogs      ReviewLog[]
  cardTags        CardTag[]

  @@index([deckId])
  @@index([lessonId])
  @@index([deckId, isSuspended])
  @@map("cards")
}

model Tag {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  name      String
  color     String?  @default("#94a3b8")
  createdAt DateTime @default(now()) @map("created_at")

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  cardTags CardTag[]
  deckTags DeckTag[]

  @@unique([userId, name])
  @@map("tags")
}

model CardTag {
  cardId String @map("card_id")
  tagId  String @map("tag_id")

  card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([cardId, tagId])
  @@map("card_tags")
}

model DeckTag {
  deckId String @map("deck_id")
  tagId  String @map("tag_id")

  deck Deck @relation(fields: [deckId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([deckId, tagId])
  @@map("deck_tags")
}

// ─── Scheduling (engine-facing tables) ──────────────────────

model CardSchedulingState {
  id               String    @id @default(uuid())
  cardId           String    @unique @map("card_id")
  dueAt            DateTime  @map("due_at")
  intervalDays     Int       @default(0) @map("interval_days")
  easeFactor       Float     @default(2.5) @map("ease_factor")
  repetitions      Int       @default(0)
  lapses           Int       @default(0)
  lastReviewedAt   DateTime? @map("last_reviewed_at")
  algorithmVersion String    @default("simple-v1") @map("algorithm_version")
  algorithmState   Json?     @map("algorithm_state") // Opaque blob for FSRS etc.
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@index([dueAt])
  @@index([cardId, dueAt])
  @@map("card_scheduling_states")
}

model ReviewLog {
  id               String   @id @default(uuid())
  cardId           String   @map("card_id")
  userId           String   @map("user_id")
  sessionId        String?  @map("session_id")
  rating           Int      // 1–5
  intervalBefore   Int      @map("interval_before")
  intervalAfter    Int      @map("interval_after")
  easeBefore       Float    @map("ease_before")
  easeAfter        Float    @map("ease_after")
  reviewedAt       DateTime @default(now()) @map("reviewed_at")
  durationMs       Int?     @map("duration_ms")
  algorithmVersion String   @map("algorithm_version")

  card    Card           @relation(fields: [cardId], references: [id], onDelete: Cascade)
  user    User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  session ReviewSession? @relation(fields: [sessionId], references: [id], onDelete: SetNull)

  @@index([cardId, reviewedAt])
  @@index([userId, reviewedAt])
  @@index([sessionId])
  @@map("review_logs")
}

model ReviewSession {
  id            String    @id @default(uuid())
  userId        String    @map("user_id")
  deckId        String?   @map("deck_id") // null = mixed/cross-deck session
  startedAt     DateTime  @default(now()) @map("started_at")
  completedAt   DateTime? @map("completed_at")
  cardsReviewed Int       @default(0) @map("cards_reviewed")
  newCards      Int       @default(0) @map("new_cards")
  reviewCards   Int       @default(0) @map("review_cards")

  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  deck       Deck?       @relation(fields: [deckId], references: [id], onDelete: SetNull)
  reviewLogs ReviewLog[]

  @@index([userId, startedAt])
  @@map("review_sessions")
}
```

---

## Key Schema Decisions

### 1. `CardSchedulingState` is a separate 1:1 table

**Why:** Scheduling data is queried differently from content (due-date scans vs. full-text search). Separating tables keeps due-card queries fast and prevents the engine from needing card content columns.

### 2. `algorithmState` JSON column

**Why:** FSRS and future algorithms need opaque per-card state (stability, difficulty, etc.) that doesn't fit fixed columns. The engine owns serialization; repositories store/retrieve the blob unchanged.

### 3. `ReviewLog` captures before/after snapshots

**Why:** Enables statistics, algorithm debugging, and audit without recomputing history. The scheduling engine never reads logs — only writes via use case.

### 4. `subject` on Deck is metadata only

**Why:** UI grouping and future marketplace filtering. Documented constraint: no scheduling query joins on `subject`.

### 5. `isSuspended` on Card

**Why:** Learners can pause cards without deleting. Due-queue queries filter `isSuspended = false`.

### 6. Composite indexes on due queries

Critical query pattern:

```sql
SELECT css.* FROM card_scheduling_states css
JOIN cards c ON c.id = css.card_id
WHERE c.deck_id = $1
  AND c.is_suspended = false
  AND css.due_at <= NOW()
ORDER BY css.due_at ASC
LIMIT $2;
```

Indexes: `card_scheduling_states(due_at)`, `cards(deck_id, is_suspended)`.

---

## Search Strategy (MVP)

Add generated tsvector column via raw migration (future implementation):

```sql
ALTER TABLE cards ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(front,'') || ' ' ||
      coalesce(back,'') || ' ' ||
      coalesce(notes,'') || ' ' ||
      coalesce(example_sentence,'')
    )
  ) STORED;

CREATE INDEX cards_search_idx ON cards USING GIN(search_vector);
```

Search is a Content context concern — never touches scheduling tables.

---

## Future Schema Hooks (Not in MVP)

| Feature | Hook |
|---------|------|
| Public deck sharing | `Deck.visibility`, `Deck.shareSlug`, `DeckFork` table |
| Import/Export | `ImportJob` table with status |
| Offline sync | `clientUpdatedAt`, `syncVersion` on Card |
| Multiplayer | `StudyRoom`, `StudyRoomParticipant` |
| AI generation | `AiGenerationJob` referencing cardId |
| Markdown | `Card.contentFormat` enum (`plain`, `markdown`) |

These are documented for forward compatibility; tables are not created until needed.
