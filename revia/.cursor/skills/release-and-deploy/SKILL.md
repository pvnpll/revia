---
name: release-and-deploy
description: Ships a new Revia semver release from develop to production on Vercel. Use when the user asks to release, ship, tag, push to production, deploy, or publish a new version (e.g. v1.6.0).
---

# Release and Deploy Revia

## When to use

- User says "ship release", "push to production", "deploy", "tag vX.Y.Z", or "publish release"
- After a feature batch on `develop` is ready for production

## Prerequisites

- Changes committed on `develop`
- `npm run check` passes (typecheck, test, build)
- Classify bump: **PATCH** (fixes), **MINOR** (features), **MAJOR** (breaking)

## Workflow

### 1. Prepare release docs

1. Bump `revia/package.json` `"version"` to match tag (e.g. `1.6.0`)
2. Create `revia/docs/releases/vX.Y.Z.md` (Summary, Added/Changed/Fixed, production URL, tag)
3. Prepend entry to `revia/CHANGELOG.md`
4. Update `revia/docs/README.md`, `docs/application/release-versioning.md`, `docs/application/progress-and-roadmap.md` — current version and release map
5. Update `docs/application/layman-guide.md` if user-facing behavior changed

Production URL: **https://revialearn.vercel.app**

### 2. Verify

```bash
cd revia && npm run check
```

### 3. Commit on develop

```bash
cd /Users/pavan/Build
git add revia/
git commit -m "$(cat <<'EOF'
Ship Revia vX.Y.Z: short summary.

EOF
)"
```

### 4. Tag and push develop

```bash
git tag -a vX.Y.Z -m "vX.Y.Z: short summary"
git push origin develop
git push origin vX.Y.Z
```

### 5. Deploy to production (main → Vercel)

Production deploys from **`main`**. Merge develop and push:

```bash
git checkout main
git pull origin main
git merge develop -m "Merge develop: vX.Y.Z"
git push origin main
git checkout develop
```

Vercel auto-deploys `main` to production. Preview deploys use `develop`.

### 6. Confirm with user

- Production: https://revialearn.vercel.app
- Tag: `vX.Y.Z`
- Release notes: `revia/docs/releases/vX.Y.Z.md`

## Version examples (Revia)

| Change | Bump |
|--------|------|
| Guest mode, new page | MINOR |
| Bug fix, copy tweak | PATCH |
| Breaking API/auth migration | MAJOR |

## Do not

- Force-push `main`
- Skip `npm run check` before tagging
- Publish GitHub Release unless user asks (draft notes in repo are enough unless requested)

## Related skill

- [restart-dev-server](../restart-dev-server/SKILL.md) — local testing before release
