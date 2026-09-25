---
name: restart-dev-server
description: Kills existing Revia Next.js dev server processes and starts a fresh instance. Use when the user asks to restart the dev server, kill and restart, or test locally after code changes.
---

# Restart Revia Dev Server

## When to use

- User says "restart dev server", "kill and restart", or wants to test locally
- Port 3000 is stuck or multiple dev instances are running
- After env or middleware changes that need a clean process

## Workflow

1. Kill anything on ports **3000** and **3001** (Next.js may fall back to 3001 if 3000 is busy)
2. Wait briefly so the port is released
3. Start dev from the **revia** app root

```bash
lsof -ti :3000,:3001 2>/dev/null | xargs kill -9 2>/dev/null
sleep 2
cd /Users/pavan/Build/revia && npm run dev
```

Run the dev server **in the background** (`block_until_ms: 0`) so the user can keep working.

4. Poll until output contains `Ready in` or `Local:        http://localhost:3000`
5. Tell the user the URL — prefer **http://localhost:3000**; if Next.js picked 3001, kill the stale 3000 holder and restart once more

## Verify

```bash
# Optional: confirm which port is listening
lsof -i :3000 -i :3001 2>/dev/null | head -5
```

Expected: single `next dev --turbopack` process on port 3000.

## Notes

- Dev command: `npm run dev` → `next dev --turbopack`
- App path: `/Users/pavan/Build/revia`
- Requires network permission for the dev server shell command
- Do not delete `.next` unless the user reports a corrupt build — restart is usually enough
