#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Revia setup"

if [ ! -f .env ]; then
  echo "==> Creating .env from .env.example"
  cp .env.example .env
fi

# shellcheck disable=SC1091
source .env 2>/dev/null || true

echo "==> Installing dependencies"
npm install

wait_for_db() {
  echo "==> Checking database connection..."
  for i in {1..30}; do
    if npx tsx scripts/wait-for-db.ts >/dev/null 2>&1; then
      echo "==> Database is reachable"
      return 0
    fi
    sleep 1
  done
  return 1
}

start_docker_postgres() {
  if ! command -v docker >/dev/null 2>&1; then
    return 1
  fi
  echo "==> Starting PostgreSQL via Docker Compose"
  docker compose up -d postgres
  for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U postgres -d revia >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

if ! wait_for_db; then
  if start_docker_postgres; then
    wait_for_db || true
  fi
fi

if ! wait_for_db; then
  echo ""
  echo "ERROR: Could not connect to PostgreSQL."
  echo ""
  echo "Option A — Install Docker Desktop, then re-run:"
  echo "  npm run setup"
  echo ""
  echo "Option B — Use your own Postgres and set DATABASE_URL in .env, then run:"
  echo "  npm run db:push && npm run db:seed && npm run dev"
  echo ""
  exit 1
fi

echo "==> Applying database schema"
npm run db:push

echo "==> Seeding demo data"
npm run db:seed

echo ""
echo "✓ Setup complete."
echo ""
echo "  npm run dev      → http://localhost:3000 (development)"
echo "  npm run prod     → http://localhost:3000 (production build)"
echo "  npm run check    → typecheck + tests + build"
echo ""
