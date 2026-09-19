# Revia AI — Changelog

All notable releases of the Revia AI Learning Engine follow [Semantic Versioning](https://semver.org/).
Every release maintains detailed logs and versioning to prevent regressions.

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
