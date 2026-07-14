# Changelog

All notable releases of Revia follow [Semantic Versioning](https://semver.org/) and [release-versioning.md](docs/application/release-versioning.md).

Release notes are **drafted** on each `main` merge; **published** only when explicitly requested.

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
| v1.0.1 | Patch fixes and polish (if needed) |
| v1.4.0 | Content editing UI (deck/lesson/card) |
| v1.5.0 | JSON export |
| v1.6.0 | Statistics page |
| v1.7.0 | Tags |
| v1.8.0 | Media on cards |

See [progress-and-roadmap.md](docs/application/progress-and-roadmap.md) for details.
