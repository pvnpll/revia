# Progress and Roadmap

## Purpose

This file tracks the current application progress and describes the next phases in enough detail to guide implementation.

It should be updated after each feature phase is completed.

## Current Summary

Revia has the core content-management foundation in place:

- Dashboard
- Decks
- Lessons
- Cards
- JSON/text import
- Mobile-first shell
- Scheduler foundation
- Database schema for reviews, sessions, scheduling state, and tags

The main missing product loop is Review. Without Review, users can create study material, but they cannot yet complete a full spaced repetition session inside the app.

The current product direction is mobile-first personal learning. Desktop is not a primary interface for V1.

## Phase Status Table

| Phase | Feature | Status | Summary |
|---|---|---|---|
| 0 | Architecture docs | Complete | v2 API-first, feature-based architecture documented. |
| 1 | Project scaffold | Complete | Next.js app, Prisma, PostgreSQL, layout, seed data, scheduler tests. |
| 2 | Architecture v2 migration | Complete | Moved to `app/`, `features/`, `lib/`, `types/`; removed old Server Action architecture. |
| 3 | Decks | Complete | Deck API and UI foundation. |
| 4 | Dashboard | Partial | Dashboard works, but review-dependent metrics need Review. |
| 5 | Lessons | Partial | Lesson API and basic UI exist; edit/reorder UI remains. |
| 6 | Cards | Partial | Card API and CRUD UI exist; tags/media upload remain. |
| 7 | Revia branding and mobile-first shell | Complete | App is branded as Revia and desktop shows a mobile guidance message. |
| 8 | JSON/text import | Partial | Import creates decks, lessons, cards, tags, and initial scheduling state. Export remains planned. |
| 9 | Review | Planned | Next major phase. |
| 10 | Progress and Statistics | Planned | Needs review logs for meaningful charts. |
| 11 | Settings and admin owner tools | Planned | User preferences, sample content, and app-owner controls. |
| 12 | Search | Planned | Search page exists, functionality not implemented. |
| 13 | Tags UI | Planned | Database and import support exist; management UI/API remains. |
| 14 | Export | Planned | Export decks as portable JSON and future `.revia` packages. |
| 15 | Real auth and roles | Planned | Replace mock user and prepare for future roles. |

## Completed Phases

### Phase 0: Architecture Documentation

Status: Complete

The architecture documentation defines the app as a subject-agnostic spaced repetition learning platform.

Important decisions:

- All business operations go through Route Handlers under `src/app/api`.
- Business rules live in `src/lib/services`.
- Database access lives in `src/lib/repositories`.
- Zod schemas live in `src/lib/validators`.
- UI is organized by feature under `src/features`.
- The scheduler is pure TypeScript and remains independent of React, Next.js, Prisma, and subject-specific content.

Key docs:

- `docs/architecture/01-overview.md`
- `docs/architecture/02-folder-structure.md`
- `docs/architecture/03-database-schema.md`
- `docs/architecture/06-review-scheduling.md`
- `docs/architecture/08-architectural-decisions.md`

### Phase 1: Project Scaffold

Status: Complete

The project was scaffolded with Next.js, TypeScript, Tailwind, Prisma, PostgreSQL setup, and a reusable app shell.

Included:

- App Router pages.
- Shared layout and sidebar.
- shadcn/ui-style shared components.
- Prisma schema and seed data.
- Scheduler unit tests.
- Setup and testing docs.

Current seeded data:

- Demo user.
- "Getting Started" deck.
- One "Basics" lesson.
- Three cards due immediately.

### Phase 2: Architecture v2 Migration

Status: Complete

The app was migrated to the v2 architecture:

```text
Pages and Components -> Feature Hooks -> API Route Handlers -> Services -> Repositories -> Prisma
```

Old folders from the earlier layered architecture were removed, and business logic moved behind HTTP APIs to support future mobile clients.

### Phase 3: Decks

Status: Complete

Implemented:

- `GET /api/decks`
- `POST /api/decks`
- `GET /api/decks/:deckId`
- `PATCH /api/decks/:deckId`
- `DELETE /api/decks/:deckId`
- Deck service and repository.
- Deck Zod validation.
- Deck list UI.
- Create deck form.
- Delete deck button.
- Deck detail page shell.
- TanStack Query hooks and HTTP client.

Remaining polish:

- Add deck edit UI for the existing PATCH endpoint.
- Consider archive/restore UI if archived decks become user-facing.
- Invalidate dashboard data after deck creation/deletion if dashboard needs immediate live updates.

### Phase 4: Dashboard

Status: Partial

Implemented:

- `GET /api/dashboard`
- Dashboard service.
- Stats repository.
- Dashboard TanStack Query hook.
- Dashboard content UI.
- Recent deck display.
- Due count, reviewed today, total cards, mature cards, deck count, and streak fields.

Limitations:

- Review does not exist yet, so reviewed-today and streak values are not meaningful in real use.
- Statistics are mostly aggregate counts, not chart-ready history.
- Dashboard will become more useful after Review creates `ReviewLog` records.

### Phase 5: Lessons

Status: Partial

Implemented:

- `GET /api/decks/:deckId/lessons`
- `POST /api/decks/:deckId/lessons`
- `GET /api/decks/:deckId/lessons/:lessonId`
- `PATCH /api/decks/:deckId/lessons/:lessonId`
- `DELETE /api/decks/:deckId/lessons/:lessonId`
- Lesson service and repository.
- Lesson validation.
- Lesson list on deck detail page.
- Create lesson form.
- Delete lesson button.
- Lesson card counts.
- Query hooks and HTTP client.

Remaining polish:

- Add edit lesson UI for the existing PATCH endpoint.
- Add reorder UI using `sortOrder`.
- Consider a dedicated lesson detail view when card volume grows.

### Phase 6: Cards

Status: Partial

Implemented:

- `GET /api/decks/:deckId/cards`
- `POST /api/decks/:deckId/cards`
- `GET /api/decks/:deckId/cards/:cardId`
- `PATCH /api/decks/:deckId/cards/:cardId`
- `DELETE /api/decks/:deckId/cards/:cardId`
- Card service and repository.
- Card validation.
- Card list on deck detail page.
- Create card form.
- Edit card form.
- Delete card button.
- Lesson assignment.
- Card suspension field.
- Initial `CardSchedulingState` creation on card create.
- Query invalidation for deck, lesson, and dashboard counts.

Remaining polish:

- Add richer media handling for `imageUrl` and `audioUrl`.
- Add tag assignment once Tags are implemented.
- Add card filtering by lesson, due status, and suspension status.
- Add bulk card import/export.
- Add API integration tests for card creation and scheduling-state creation.

### Phase 7: Revia Branding and Mobile-First Shell

Status: Complete

Product direction from `docs/application/product-doc`:

- The application name is Revia.
- Version 1 is primarily for personal use.
- The interface should be designed mobile-first.
- Desktop is not required as a full experience right now.

Implemented:

- App metadata and visible navigation use Revia branding.
- Mobile screens show the application shell with a compact top bar and bottom navigation.
- Desktop-sized screens show: "Please switch to Mobile for better experience."
- Main content uses phone-first spacing and avoids desktop-only layout requirements.

Remaining polish:

- Design dedicated mobile review cards with one-handed controls.
- Add mobile safe-area padding for devices with notches/home indicators if needed.
- Add installable PWA behavior later if Revia should feel app-like on phones.

### Phase 8: JSON/Text Import

Status: Partial

Version 1 requires JSON import for generic learning content.

Implemented:

- `POST /api/import/deck`
- `src/lib/validators/import.schema.ts`
- `src/lib/services/import.service.ts`
- File upload for `.json` and `.txt` files containing JSON.
- Pasted JSON text import.
- Imported deck creation.
- Imported lesson creation.
- Imported card creation.
- Initial scheduling state for imported cards.
- Tag persistence for imported deck and card tags.

Supported JSON shape:

```json
{
  "deck": {
    "title": "Kannada Basics",
    "description": "Beginner vocabulary and phrases",
    "tags": ["language", "beginner"]
  },
  "lessons": [
    {
      "title": "Greetings",
      "description": "Basic greetings",
      "cards": [
        {
          "front": "Hello",
          "back": "ನಮಸ್ಕಾರ",
          "pronunciation": "Namaskara",
          "example": "ನಮಸ್ಕಾರ, ಹೇಗಿದ್ದೀರ?",
          "notes": "Formal greeting",
          "tags": ["greeting", "beginner"]
        }
      ]
    }
  ]
}
```

Required fields:

- Deck title
- Lesson title
- Card front
- Card back

Remaining work:

- Add import preview before saving.
- Add better duplicate detection.
- Add import history.
- Add validation summary with row/card-level errors.
- Add CSV, Excel, Markdown, PDF-assisted import, and `.revia` package support in later versions.

## Next Phases

### Phase 9: Review

Status: Planned

This is the next major milestone because it completes the learning loop.

#### Goal

Let users review due cards, rate how well they remembered each card, and update the scheduling state so the app knows when to show each card again.

#### User Experience

The user should be able to:

1. Open `/review`.
2. Choose a deck or start reviewing all due cards.
3. See one card at a time.
4. Read the front side.
5. Reveal the back side.
6. Rate recall from 1 to 5.
7. Move to the next due card.
8. Finish the session and see a summary.

Suggested rating labels:

- 1: Forgot Completely
- 2: Hard
- 3: Okay
- 4: Good
- 5: Perfect

#### API Scope

Likely endpoints:

- `GET /api/review/due`
- `POST /api/review/sessions`
- `GET /api/review/sessions/:sessionId`
- `POST /api/review/sessions/:sessionId/ratings`
- `POST /api/review`

The exact endpoint shape can be simplified for the first version. A minimal MVP can start with:

- Load due cards.
- Submit a rating for one card.
- Persist review log and updated scheduling state.

#### Backend Scope

Add:

- `src/lib/validators/review.schema.ts`
- `src/lib/repositories/review.repository.ts`
- `src/lib/repositories/scheduling-state.repository.ts` if scheduling writes are split out.
- `src/lib/services/review.service.ts`
- `src/app/api/review/route.ts` or nested review session routes.

Important service responsibilities:

- Verify user owns the card through its deck.
- Load current `CardSchedulingState`.
- Load recent review history if needed by the scheduler.
- Call `schedulingEngine.submitReview()`.
- Persist the new scheduling state.
- Create a `ReviewLog`.
- Update or complete a `ReviewSession`.
- Use a database transaction so state and logs stay consistent.

#### UI Scope

Add:

- Review page content component.
- Due-card queue hook.
- Review session hook.
- Card flip UI.
- Rating buttons.
- Keyboard shortcuts, especially Space to reveal and number keys for rating.
- Session summary.

#### Data Impact

Review will populate:

- `ReviewLog`
- `ReviewSession`
- Updated `CardSchedulingState`

This unlocks meaningful dashboard values:

- Reviewed today.
- Streak.
- Mature cards.
- Due count changes after reviews.

#### Tests

Add tests for:

- Scheduler submit behavior through service.
- Review API rating submission.
- Transaction behavior for review log and scheduling state.
- Dashboard count changes after reviews.

### Phase 10: Progress and Statistics

Status: Planned

#### Goal

Help users understand learning progress over time.

#### User Experience

The Statistics page should show:

- Cards reviewed per day.
- Rating distribution.
- Due cards over time.
- Mature cards over time.
- Deck-level progress.
- Hardest cards or lessons.
- Review streak.

#### Backend Scope

Likely endpoint:

- `GET /api/statistics`

Possible query parameters:

- `deckId`
- `from`
- `to`
- `groupBy=day|week|month`

Add or extend:

- `src/lib/services/statistics.service.ts`
- `src/lib/repositories/stats.repository.ts`
- `src/features/statistics/`

#### Data Sources

Statistics should primarily use:

- `ReviewLog`
- `ReviewSession`
- `CardSchedulingState`
- `Deck`
- `Lesson`
- `Card`

#### Tests

Add repository tests or integration tests for date-window aggregation and rating distribution.

### Phase 11: Settings and Admin Owner Tools

Status: Planned

#### Goal

Let users control app preferences and future learning behavior.

#### Possible Settings

- Daily review limit.
- New cards per day.
- Preferred deck ordering.
- Theme or display preferences.
- Default card options.
- Review keyboard shortcuts.
- Future scheduler algorithm selection.

#### Backend Scope

The current Prisma schema does not include a user settings model. This phase likely needs a migration or schema update.

Possible model:

```prisma
model UserSettings {
  userId         String @id
  dailyCardLimit Int?
  newCardsPerDay Int?
  schedulerAlgorithm String @default("simple-v1")
}
```

Keep scheduler algorithm selection carefully bounded. The scheduler implementation should remain isolated in `src/lib/scheduler`.

### Phase 12: Search

Status: Planned

#### Goal

Let users quickly find decks, lessons, and cards.

#### User Experience

Users should be able to:

- Search card fronts and backs.
- Search deck titles and subjects.
- Search lesson titles.
- Filter by deck.
- Open a matching deck or card.

#### Backend Scope

Likely endpoint:

- `GET /api/search?q=...`

Initial implementation can use Prisma `contains` filters. Later versions can use PostgreSQL full-text search.

#### UI Scope

The `/search` route already exists as a placeholder. Add:

- Search input.
- Results grouped by type.
- Empty state.
- Loading and error states.

### Phase 13: Tags UI

Status: Planned

#### Goal

Use existing schema support to organize decks and cards with reusable labels.

#### Existing Schema

The database already has:

- `Tag`
- `CardTag`
- `DeckTag`

#### User Experience

Users should be able to:

- Create tags.
- Assign tags to decks.
- Assign tags to cards.
- Filter decks/cards by tag.
- Use colors for visual grouping.

#### Backend Scope

Likely endpoints:

- `GET /api/tags`
- `POST /api/tags`
- `PATCH /api/tags/:tagId`
- `DELETE /api/tags/:tagId`
- `POST /api/decks/:deckId/tags`
- `DELETE /api/decks/:deckId/tags/:tagId`
- `POST /api/decks/:deckId/cards/:cardId/tags`
- `DELETE /api/decks/:deckId/cards/:cardId/tags/:tagId`

### Phase 14: Export

Status: Planned

#### Goal

Let users back up and move their learning content out of Revia.

#### User Experience

Users should be able to:

- Export one deck as JSON.
- Export all personal decks as JSON.
- Re-import exported files later.
- Share the exported file manually outside the app if they choose.

#### Backend Scope

Likely endpoints:

- `GET /api/export/decks/:deckId`
- `GET /api/export/decks`

The export shape should match the import shape as closely as possible:

- Deck title, description, tags.
- Lessons and lesson order.
- Cards, optional pronunciation/example/notes/tags.

Scheduling state and review history should be optional export sections, not required for content-only portability.

#### Future Format

Later versions may add a custom `.revia` package format containing:

- Content JSON.
- Media references or bundled media.
- Export metadata.
- Optional review/scheduling backup.

### Phase 15: Real Auth and Roles

Status: Planned

#### Goal

Replace mock user auth and make the API ready for real users and future mobile clients.

#### Current State

The app uses a mock user from environment variables.

#### Required Work

- Choose an auth provider or implement session auth.
- Replace `getUserId()` mock behavior.
- Add authorization checks everywhere user-owned data is accessed.
- Add login/logout UI.
- Add user profile handling.
- Ensure API responses remain stable for future mobile clients.
- Add tests for cross-user access denial.

## Suggested Implementation Order From Here

1. Review MVP.
2. Dashboard updates based on review data.
3. Statistics MVP.
4. Settings MVP.
5. Search.
6. Tags.
7. Real auth.
8. Mobile-specific API hardening.

## Definition Of Done For Future Phases

Each phase should include:

- Route handlers.
- Zod validators.
- Service layer.
- Repository layer.
- Feature API client.
- TanStack Query hooks.
- UI components.
- Loading and error states.
- Query invalidation where needed.
- Focused tests for high-risk logic.
- Documentation update in this file.

## Known Documentation Drift

Some older docs still describe Lessons, Cards, and Dashboard as planned. Current code has moved beyond those status tables.

Docs that may need status updates:

- `README.md`
- `docs/architecture/README.md`
- `docs/architecture/02-folder-structure.md`
- `docs/TESTING.md`

The app documentation in `docs/application/` should be treated as the current user-facing progress summary unless older docs are updated.
