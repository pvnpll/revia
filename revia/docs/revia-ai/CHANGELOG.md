# Revia AI — Changelog

All notable releases of the Revia AI Learning Engine follow [Semantic Versioning](https://semver.org/).
Every release maintains detailed logs and versioning to prevent regressions.

## [v1.9.10] — 2026-09-25 (Published)

**Out-of-Bounds Swiping Fix** — Fixed a bug where fast swiping would outpace the background generator, causing `StudyCardViewer` to render a blank page. Added a graceful "Generating next batch" fallback screen and error recovery UI.

→ [Full release notes](releases/v1.9.10.md)

### Fixed
- `ai-session-viewer`: Safely intercepts `currentIndex >= cards.length` to render a loading spinner or error UI instead of passing an out-of-bounds index to the swipe viewer.

---

## [v1.9.9] — 2026-09-25 (Published)

**Phase 4: Persistent DB Context & Normalization** — Connected the AI Learner Context to the Prisma database so the AI remembers progress across sessions. Implemented a hidden AI topic normalizer to map varied user prompts (e.g. "Kannada" vs "kannada beginner") to a single persistent database key.

→ [Full release notes](releases/v1.9.9.md)

### Added
- `topic-normalizer.ts`: Runs a fast `gemma-2-9b` API call to extract the universal `subjectKey` from raw user prompts.
- `api/v1/generate/context`: Added `POST` route to initialize normalized context from the database before generating.

### Changed
- `ai-generator-form`: Awaits context initialization before triggering the generation stream.
- `ai-session-viewer`: Syncs ratings back to the database using the persistent `subjectKey` instead of the raw topic string.
- `prd.md`: Documented Option B (Subject Dropdowns) for future exploration.

---

## [v1.9.8] — 2026-09-25 (Published)

**Performance Optimization (TTFT)** — Reduced the default generation batch size to cut the AI wait time in half, adjusting the background prefetch threshold to maintain a seamless swipe experience without loading screens.

→ [Full release notes](releases/v1.9.8.md)

### Changed
- `ai-mode-content`: Reduced default `batchSize` from `10` to `5`.
- `ai-mode-content`: Adjusted background prefetch threshold from `<= 6` remaining cards to `<= 3` remaining cards.

---

## [v1.9.7] — 2026-09-24 (Published)

**Hybrid Loop & Endless Session UI** — Implemented the Hybrid Loop mechanic to re-queue struggled cards to the back of the active session. Updated AI numbering to reflect an endless session (`N practiced`), dynamically displayed the generative model used, and cleaned up redundant UI buttons.

→ [Full release notes](releases/v1.9.7.md)

### Added
- `ai-session-viewer`: Hybrid Loop mechanic instantly re-queues failed cards (`rating <= 2`) to the end of the `session.cards` queue for immediate spaced-repetition loop practice.
- `ai-mode-content`: Syncs `ai.meta.model` into `AISessionState` on batch completion to expose actual generation model used.

### Changed
- `ai-session-viewer`: Removed the "Next batch" button from the banner to favor background prefetching.
- `ai-session-viewer`: Progress text changed from fractional (`4 / 10`) to endless (`4 practiced`), matching Core App Practice mode.
- `ai-session-viewer`: Subtitle now dynamically displays the actual generation model (`google/gemma-4-31b-it:free`) instead of generic `ai`.

---

## [v1.9.6] — 2026-09-24 (Published)

**Revia AI UI Consistency Pass** — Aligned the whole `/ai` flow (page header, settings card, streaming state, session banner, save-deck modal) with regular app UI, and fixed the shared swipe-viewer overlap/scroll issues (slimmer safe-area footers, opacity-only card entry, scroll-safe `m-auto` centering for unrevealed fronts).

→ [Full release notes](releases/v1.9.6.md)

### Fixed
- `StudyCardViewer`: footers use `pb-6 + env(safe-area-inset-bottom)` instead of fixed `pb-10`, freeing ~32px of card height on small phones
- `StudyCardViewer`: `study-card-in` animation is opacity-only (no `translateY`), so revealed cards never slide under the rating footer on entry
- `StudyCardViewer`: unrevealed fronts use `m-auto` inner wrapper instead of `justify-center + overflow`, so long text no longer clips at the top and scrolls correctly
- `AISessionViewer`: subtitle providers collapsed to `ai` (no misleading model label); banner uses solid `bg-card border-border`
- `AIGeneratorForm`: level/batch stack vertically (`grid gap-3`) so labels never crush inside the 428px app column
- `ai-mode-content`: streaming state uses `space-y-6`, `text-3xl` title, and `PageSkeleton`-style skeleton rows — matches Decks/Settings/Explore page rhythm

---

## [v1.9.2] — 2026-09-24 (Published)

**Fix Double Prefetch & Remove Provider UI** — Fixed consecutive duplicate batch API calls caused by the prefetch effect re-firing on session object changes. Removed the AI provider selector from the UI; Ollama Cloud is now always the default with OpenRouter (Gemma 4) as the only silent fallback. Gemini disabled from all fallback paths.

→ [Full release notes](releases/v1.9.2.md)

### Fixed
- Background prefetch effect now fires exactly once per batch threshold crossing via `prefetchQueuedRef` guard
- Simplified server-side fallback cascade: Ollama → OpenRouter(Gemma) only; Gemini removed

### Changed
- Removed AI Provider segmented control from generation form — always uses Ollama
- OpenRouter model cascade reordered to try `google/gemma-4-31b-it:free` first

---

## [v1.9.1] — 2026-09-21 (Published)

**Fix Double Batch Generation & Random Card Quantities** — Fixed a bug where automatic background prefetching (when reaching the end of a session) would make multiple rapid consecutive generation requests and yield a random number of cards.

→ [Full release notes](releases/v1.9.1.md)

### Fixed
- `AIGenerationService.generateStream`: Added a retry loop (mirroring the old `generate` method) to iteratively request more cards if deduplication or LLM truncation yields fewer cards than requested for the batch size. This guarantees consistent batch sizes and prevents the UI from instantly re-requesting missing cards.
- `useAIGenerate` Hook: Added a synchronous `useRef` flag to prevent rapid concurrent API calls caused by React 18 state batching delays, which were previously aborting in-flight requests and causing partial (random) JSON card sets.

---


## [v1.9.0] — 2026-09-21 (Published)

**Ollama Cloud Provider Integration** — Added `OllamaCloudProvider` connecting to the official Ollama Cloud API (`https://ollama.com/api/chat`) with Bearer token authentication, native structured output (`format: "json"`), verified free cloud model cascade led by `gemma4:31b`, and full integration into the provider factory and UI via `AI_PROVIDER=ollama`.

→ [Full release notes](releases/v1.9.0.md)

### Added
- `OllamaCloudProvider` implementing `AIProvider` for hosted Ollama Cloud models
- Factory support for `AI_PROVIDER=ollama` in `createAIProvider()`
- Environment variables `OLLAMA_API_KEY`, `OLLAMA_BASE_URL`, and `OLLAMA_MODEL` in `.env.example`
- Unit test suites in `tests/unit/lib/ai/ollama-cloud-provider.test.ts` and `tests/unit/lib/ai/provider-factory.test.ts`

---

## [v1.8.5] — 2026-09-20 (Published)

**Card Scroll & Footer Overlap Fix** — Revealed cards scroll natively again (swipe gestures no longer hijack vertical scrolls) and only one footer shows at a time, so the rating section never overlaps the card; long text wraps and scrolls inside the card.

→ [Full release notes](releases/v1.8.5.md)

### Fixed
- `handleSwipePointerDown` skips pointer capture when the touch starts inside a scrollable answer pane; `handleSwipePointerMove` releases the drag once a revealed card's gesture turns vertical
- Wired `answerScrollRef` to the swipe revealed pane (was only attached in ratings mode) and added `touch-pan-y overscroll-contain` so vertical scroll stays native
- Hint footer renders only when not revealed; card bodies use `min-h-0 flex-1 overflow-y-auto` with responsive text and `break-words + overflow-wrap:anywhere`

---

## [v1.8.4] — 2026-09-20 (Published)

**AI Session Uses Shared Fullscreen Swipe UI** — The AI card session now renders in the exact same fullscreen swipe viewer as Practice/Review (portal overlay, shared `h-14` header, drag deck, hint + rating footers) instead of an embedded ratings-mode panel.

→ [Full release notes](releases/v1.8.4.md)

### Fixed
- Switched `AISessionViewer` from embedded `navigationMode="ratings" fullscreen={false}` to `navigationMode="swipe" fullscreen noLoop allowFreeNavigation` in a `document.body` portal, matching Practice/Review DOM and gestures
- Removed the duplicate page-level `New goal` title and `Card` toolbar; Save deck / Next batch now live in a slim banner row under the shared viewer header with the next-batch error as a second banner row
- Added optional `banner` slot to `StudyCardViewer` (rendered below the header, header itself unchanged); Practice/Review output is byte-identical
- Subtitle now carries live progress (`progress · level · provider`); swiping moves index-only while 1–5 ratings update learner context and clamp advance

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

