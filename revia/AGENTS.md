# Revia AI Agent Instructions & Guidelines

**CRITICAL RULES FOR ALL AI AGENTS / MODELS WORKING ON REVIA**

Every time an AI-related change is made, follow this exact versioning, logging, and provider policy. Do not skip steps.

---

## 1. AI Release Versioning & Logging Protocol (MANDATORY ON EVERY RELEASE)

All AI-related development (card generation, providers, learner context, AI mode) is maintained on `developAI` and deployed from `mainAI`.

**IMPORTANT**: Maintain AI releases **ONLY** in `revia-ai` (`docs/revia-ai/`). Do NOT update root `package.json`, root `CHANGELOG.md`, or root `docs/releases/`. Do NOT maintain releases in both places.

Never restart versions from the beginning; continue the release version sequence as-is (e.g. `v1.8.2` → `v1.8.3` for patch, `v1.9.0` for minor):

1. **Bump Version in `docs/revia-ai/VERSION`**:
   - Follow Semantic Versioning: `MAJOR.MINOR.PATCH`.
   - Bug fixes / resilience / polish = PATCH (`1.8.2` → `1.8.3`).
   - New features / capabilities = MINOR (`1.8.x` → `1.9.0`).
   - Breaking changes = MAJOR (`1.x` → `2.0.0`).
2. **Update `docs/revia-ai/CHANGELOG.md`**:
   - Add a new section at the top formatted as:
     ```markdown
     ## [vX.Y.Z] — YYYY-MM-DD (Published)
     **One-line summary** — Brief list of changes.
     → [Full release notes](releases/vX.Y.Z.md)
     ### Changed / Fixed / Added
     - Bullet points of all changes in this version
     ```
3. **Create Release Notes in `docs/revia-ai/releases/vX.Y.Z.md`**:
   - Document Summary, Changes in detail, and Migration/Verification notes.
4. **Run Verification Before Pushing**:
   - Run `npm run check` (runs `typecheck`, `test`, and `build`). All 38+ tests and page generation must pass with zero errors.
5. **Git Commit & Tag**:
   - Commit message: `release(ai): vX.Y.Z — <summary>` (or `fix(ai): ...`, `feat(ai): ...`).
   - Create git tag: `git tag ai-vX.Y.Z` (e.g. `git tag ai-v1.8.2`).
6. **Strict Deployment Pipeline (NO DIRECT PUSHES TO PROD)**:
   - **NEVER** push directly to `mainAI`. **NEVER** merge unversioned/undocumented features to `mainAI`. 
   - Even small tweaks (like a batch size change) must get a patch version (e.g. `v1.9.8`), a `CHANGELOG.md` update, and a release `.md` file on `developAI` first.
   - Once fully documented and committed on `developAI`, push to origin: `git push origin developAI --tags`
   - Only then, fast-forward merge to production:
     `git checkout mainAI && git merge developAI --ff-only && git push origin mainAI --tags && git checkout developAI`

*(Note: Root `package.json`, root `CHANGELOG.md`, and root `docs/releases/` are reserved strictly for Core Web App releases on `develop` → `main`.)*

---

## 2. AI Card Generation & Provider Architecture

- **Model Choices**: Never downgrade models or switch to old or failing models (e.g., do NOT switch to `gemini-2.0-flash` or `gemini-2.5-flash`). Default model for Gemini is `gemini-3.6-flash` (or `process.env.GEMINI_MODEL`).
- **OpenRouter Free Model Cascade**: Always prioritize `"openrouter/free"` as the leading model, followed by the complete candidate cascade:
  1. `openrouter/free`
  2. `google/gemma-4-31b-it:free`
  3. `google/gemma-4-26b-a4b-it:free`
  4. `deepseek/deepseek-v4-flash-0731:free`
  5. `qwen/qwen3.8-27b:free`
  6. `liquid/lfm-2.5-2.6b:free`
  7. `nvidia/nemotron-3.5-lightning:free`
- **Timeouts**: AI providers must have at least 25s timeout (`timeoutMs: 25000`) so free model pools do not prematurely abort.
- **Provider Fallback & Error Transparency**: Never mask a primary provider's error with a fallback provider's error. If a user selects OpenRouter in the UI and both OpenRouter and fallback Gemini fail, the error message must clearly report both failures rather than only blaming the fallback:
  `OPENROUTER failed: <primaryError>. (Fallback gemini also failed: <fallbackError>)`
- **SSE Streaming**: AI card generation route (`/api/v1/generate/cards`) must stream cards via Server-Sent Events (SSE) so cards render progressively in UI and avoid serverless execution timeouts (`FUNCTION_INVOCATION_TIMEOUT`).
- **Avoid Repetitive Analysis**: Do what is asked directly. Do not repeatedly re-analyze or churn working files like `gemini-provider.ts` when addressing orthogonal issues.

