#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

read_env() {
  grep -E "^$1=" .env | head -1 | cut -d= -f2- | tr -d '"'
}

SUPABASE_URL=$(read_env NEXT_PUBLIC_SUPABASE_URL)
ANON_KEY=$(read_env NEXT_PUBLIC_SUPABASE_ANON_KEY)
PROJECT_REF=$(read_env SUPABASE_PROJECT_REF)
DIRECT_URL=$(read_env DIRECT_URL)

# Extract password from DIRECT_URL
DB_PASS=$(echo "$DIRECT_URL" | sed -E 's|.*postgres\.[^:]+:([^@]+)@.*|\1|')
DATABASE_URL="postgresql://postgres.${PROJECT_REF}:${DB_PASS}@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"

add_var() {
  local name="$1"
  local value="$2"
  local sensitive="${3:-}"
  for env in production preview development; do
    echo "==> $name ($env)"
    local flags=(--yes)
    if [[ "$sensitive" == "1" && "$env" != "development" ]]; then
      flags+=(--sensitive)
    fi
    npx vercel env add "$name" "$env" --value "$value" "${flags[@]}" 2>&1 || \
      npx vercel env add "$name" "$env" --value "$value" "${flags[@]}" --force 2>&1
  done
}

add_var NEXT_PUBLIC_SUPABASE_URL "$SUPABASE_URL"
add_var NEXT_PUBLIC_SUPABASE_ANON_KEY "$ANON_KEY" 1
add_var SUPABASE_PROJECT_REF "$PROJECT_REF"
add_var DIRECT_URL "$DIRECT_URL" 1
add_var DATABASE_URL "$DATABASE_URL" 1

echo ""
echo "✓ Environment variables added. Redeploy with: npx vercel --prod"
