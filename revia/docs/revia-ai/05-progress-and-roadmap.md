# Revia AI — Progress and Roadmap

**Last updated:** September 2026
**Branch:** `developAI` → `mainAI`
**Policy:** Plan features by target phase. Implement after approval. Independent from main app versioning.

---

## Phase Map

| Phase | Status | Scope |
|-------|--------|-------|
| Phase 1: Core Generation | Planned | Gemini provider, card generation API, Zod validation, learner context |
| Phase 2: Second Provider | Planned | OpenRouter integration, provider fallback |
| Phase 3: AI Mode UX | Planned | AI Mode UI in the app, session management, background prefetch |
| Phase 4: Server-Side Context | Planned | Persist learner context, per-user per-topic storage |
| Phase 5: Advanced Generation | Future | Quizzes, explanations, difficulty adjustment, curriculum |
| Phase 6: Learning Intelligence | Future | Spaced repetition integration, analytics, personalization |

---

## Phase 1: Core Generation

**Goal:** Accept a learning goal and generate valid, structured learning cards through a versioned API.

| Item | Effort | Value |
|------|--------|-------|
| AIProvider interface + GeminiProvider | Medium | High |
| POST /api/v1/generate/cards route handler | Small | High |
| AI generation service (orchestration, retry) | Medium | High |
| Zod schemas (request, card output, context) | Small | High |
| Learner context support in prompt | Medium | High |
| Duplicate avoidance (prompt + programmatic) | Medium | Medium |
| Error handling (provider errors, invalid output) | Small | High |
| Cost controls (batch limits, rate limits) | Small | Medium |

**Depends on:** Nothing. Can start immediately.

---

## Phase 2: Second Provider

**Goal:** Add OpenRouter as an alternative/fallback provider.

| Item | Effort | Value |
|------|--------|-------|
| OpenRouterProvider implementation | Medium | Medium |
| Provider fallback logic | Small | Medium |
| Model quality testing | Medium | High |
| Token usage logging | Small | Medium |

**Depends on:** Phase 1.

---

## Phase 3: AI Mode UX

**Goal:** Integrate AI generation into the Revia app UI.

| Item | Effort | Value |
|------|--------|-------|
| AI Mode entry point (goal input UI) | Medium | High |
| AI-generated card display (reuse StudyCardViewer) | Small | High |
| Background batch prefetch | Medium | Medium |
| Feedback UI (rate AI cards) | Medium | High |
| Session state management | Medium | Medium |

**Depends on:** Phase 1. Can start before Phase 2.

---

## Phase 4: Server-Side Context

**Goal:** Persist learner context server-side.

**Items:** AiLearnerContext DB table, context API endpoints, migrate from client-sent to server-managed.

**Depends on:** Phase 1 + Phase 3.

---

## Phase 5: Advanced Generation (Future)

**Goal:** Expand generative capabilities beyond flashcards.

**Possible Items:** 
- AI-generated quizzes
- AI explanations
- AI difficulty adjustment
- Personalized curriculum
- Topic progression

---

## Phase 6: Learning Intelligence (Future)

**Goal:** Provide deeper learning insights and autonomous behavior.

**Possible Items:**
- Spaced-repetition integration
- Learning analytics
- RAG over user documents
- PDF/website learning
- Voice-based learning
- Multiple AI providers / Paid premium AI providers

---

## Success Criteria

1. Accept a learning goal
2. Generate 10 valid cards
3. Validate the response (Zod)
4. Return cards through an API
5. Support Gemini
6. Support a second provider
7. Accept learner context
8. Avoid obvious repetitions
9. Generate next batch using updated context
10. Run independently from Revia Web
11. Be consumable by a future mobile application

---

## Related Docs

- [PRD](./prd.md)
- [Architecture](./01-architecture.md)
- [API Reference](./02-api-reference.md)
- [Main app roadmap](../application/progress-and-roadmap.md)
