#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  echo "Run setup first: npm run setup"
  exit 1
fi

echo "==> Production build"
npm run build

echo "==> Starting production server at http://localhost:3000"
npm run start
