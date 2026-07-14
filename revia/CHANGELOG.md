# Changelog

All notable releases of Revia follow [Semantic Versioning](https://semver.org/) and [release-versioning.md](docs/application/release-versioning.md).

Release notes are **drafted** on each `main` merge; **published** only when explicitly requested.

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
| v1.2.0 | Content editing UI (deck/lesson/card) |
| v1.3.0 | JSON export |
| v1.4.0 | Statistics page |
| v1.5.0 | Tags |
| v1.6.0 | Media on cards |

See [progress-and-roadmap.md](docs/application/progress-and-roadmap.md) for details.
