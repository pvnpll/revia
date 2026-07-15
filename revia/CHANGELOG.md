# Changelog

All notable releases of Revia follow [Semantic Versioning](https://semver.org/) and [release-versioning.md](docs/application/release-versioning.md).

Release notes are **drafted** on each `main` merge; **published** only when explicitly requested.

---

---

## [v1.6.1] — 2026-07-15 (Published)

**Touch UX & lesson navigation** — consistent lesson row taps, improved swipe/tap on practice cards, sign out returns to Explore.

→ [Full release notes](docs/releases/v1.6.1.md)

### Changed
- Full lesson row tap target for guest and signed-in users
- Signed-in practice uses tap-to-reveal touch handling (ratings unchanged)
- Guest swipe navigation thresholds and edge tap zones

### Fixed
- Sign out redirects to Explore instead of login

---

## [v1.6.0] — 2026-07-15 (Published)

**Guest mode & public browse** — use Explore and practice public decks without signing in; Daily Review and library require an account.

→ [Full release notes](docs/releases/v1.6.0.md)

### Added
- Guest access to Explore, public decks, and swipe-based practice
- Login prompts for account-only features
- App version footer on Explore page

### Changed
- Home redirect: guests → Explore, signed-in → Practice
- Guest shell header and reduced nav
- Separate practice vs review card viewer modes

### Fixed
- Guest practice session overlay and lesson navigation

---

## [v1.5.0] — 2026-07-15 (Published)

**Content editing & import improvements** — rename decks and lessons; confirm before import; reliable large deck imports.

→ [Full release notes](docs/releases/v1.5.0.md)

### Added
- Deck and lesson title editing with pencil icon on deck detail page
- Sample Kannada and Telugu deck JSON in `content/decks/`

### Changed
- Import requires Import JSON click after file upload (no auto-import)
- Large imports batched per lesson; import API timeout extended
- About and import settings copy updated for Practice + Daily Review

### Fixed
- Slow initial app load (removed global practice prefetch)
- Explore page stuck loading on refetch
- Import cache invalidation for deck detail and lessons after import

---

## [v1.4.0] — 2026-07-15 (Published)

**Practice mode & Daily Review split** — endless adaptive practice as primary experience; SRS daily review secondary.

→ [Full release notes](docs/releases/v1.4.0.md)

### Added
- Practice mode with `PracticeScheduler` (endless, queue-based, no due dates)
- `GET /api/practice/cards` and `PracticeSession` component
- Default practice from recently opened decks (all cards per deck)
- Distinct minimal rating button colors (1–5)

### Changed
- App opens directly into practice with a card loaded
- Nav order: Dashboard → Practice → Decks → Explore
- Lessons use Practice (lesson-scoped); deck practice includes all cards
- Daily Review demoted to dashboard secondary action
- Imported decks cannot change visibility; Explore shows author's own public decks

### Fixed
- Practice session infinite render loop on card load

---

## [v1.3.0] — 2026-07-15 (Published)

**Import public decks & feedback** — add Explore decks to your library, author credits, in-app feedback.

→ [Full release notes](docs/releases/v1.3.0.md)

### Added
- Import public decks to library with saved review progress
- Original author shown on imported decks
- Feedback page for suggestions and bug reports

### Changed
- Username settings merged into Account page

---

## [v1.2.1] — 2026-07-15 (Published)

**Settings hub & auth fixes** — cleaner Settings UI, signup rate-limit fixes, email URL config.

→ [Full release notes](docs/releases/v1.2.1.md)

### Added
- Settings hub with dedicated sub-pages per option
- Auth error messages for rate limits and email confirmation
- Supabase production URL fix script

### Fixed
- Signup double-request rate limiting
- Email confirmation redirect URL configuration

---

## [v1.2.0] — 2026-07-14 (Published)

**Usernames & dark default** — unique usernames, username login, dark mode by default.

→ [Full release notes](docs/releases/v1.2.0.md)

### Added
- Auto-assigned usernames with Settings customization
- `@username` shown on public decks in Explore
- Sign in with email or username

### Changed
- Default theme is now dark for new users

---

## [v1.1.0] — 2026-07-14 (Published)

**Public decks & Explore** — publish decks, discover public content, app version in Settings.

→ [Full release notes](docs/releases/v1.1.0.md)

### Added
- Public/private deck visibility toggle
- Explore page with personal search + public deck discovery
- Read-only browsing of others' public decks
- App version shown in Settings footer

### Changed
- Search nav renamed to Explore (`/explore`)

---

## [v1.0.0] — 2026-07-14 (Published)

**First stable release** — mobile-first spaced repetition app with auth, decks, lessons, review, dashboard, search, import, and production deploy.

→ [Full release notes](docs/releases/v1.0.0.md)

### Added
- Supabase auth, dashboard, decks, lessons, review, search, settings, JSON import
- Mobile shell with floating navigation and study/review viewers
- Vercel + Supabase production deployment

### Changed
- Mobile performance optimizations (optimistic review, prefetch, regional deploy)

---

## Upcoming (proposed — not released)

| Version | Scope |
|---------|--------|
| v1.6.0 | Deck description/color edit, lesson reorder, card UI on deck page |
| v1.7.0 | JSON export |
| v1.8.0 | Statistics page |
| v1.9.0 | Tags |
| v2.0.0 | Media on cards |

See [progress-and-roadmap.md](docs/application/progress-and-roadmap.md) for details.
