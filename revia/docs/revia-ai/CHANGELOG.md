# Revia AI — Changelog

All notable releases of the Revia AI Learning Engine follow [Semantic Versioning](https://semver.org/).
Every release maintains detailed logs and versioning to prevent regressions.

---

## [v1.8.3] — 2026-09-20 (Published)

**Revia AI UI Consistency & Session UX Fixes** — Aligned the Revia AI section with the regular app UI (page headers, cards, segmented controls, dialogs, overlays) and fixed session-viewer issues (double scroll, infinite wrap, unstable card ids, missing first-batch loading state, save-modal layering).

→ [Full release notes](releases/v1.8.3.md)

### Fixed
- Removed double-padded `container max-w-lg` wrapper in `ai-mode-content.tsx` that conflicted with `AppShell` (`max-w-md px-4 py-5`)
- Replaced `min-h-screen` session viewer + custom action bar with standard page title and `Card` toolbar (matches Practice/Review/Decks)
- Rating advance no longer wraps with modulo; session clamps on last card (`noLoop`) so appended batches and reveal state stay stable
- Stable study-card ids (`ai-card-{topic}-{level}-{idx}`) instead of embedding card front text
- First-batch streaming no longer drops back to the form; shows topic/goal progress card with Cancel and error
- Fixed background prefetch loop from unstable `handleNextBatch` deps; now uses granular deps
- Save-deck modal raised to `z-[100]`, bottom-sheet on mobile, with `role=dialog`, Escape/backdrop close, autofocus, and theme-aware success color
- Generator form uses Lucide icons (no emoji), shared segmented-control style, `aria-pressed` groups, responsive `sm:grid-cols-2`, and standard `rounded-xl role=alert` errors

---

## [v1.8.2] — 2026-09-19 (Published)

**Streaming Generation, Resilient Provider Cascade & Error Transparency** — Converted card generation to Server-Sent Events (SSE) streaming to eliminate serverless execution timeouts, fixed provider error masking so primary provider errors (OpenRouter) are never hidden behind fallback errors (Gemini), restored the full candidate cascade (`openrouter/free`), restored 25s timeouts, and established persistent AI versioning and agent protocols.

→ [Full release notes](releases/v1.8.2.md)

### Changed
- Card generation API converted to Server-Sent Events (SSE) streaming for progressive UI display
- Clear provider error reporting: failures on primary provider (e.g. OpenRouter) no longer masked by fallback provider (Gemini) errors
- Restored `openrouter/free` router and complete high-availability candidate model cascade
- Provider timeout defaults restored to 25s across providers to prevent premature aborts
- Documented automated agent release & versioning protocol in `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`

---

## [v1.8.1] — 2026-09-18 (Published)

**Learner Context & Context API** — Implemented server-side learner context storage, context API route, and adaptive prompt integration.

