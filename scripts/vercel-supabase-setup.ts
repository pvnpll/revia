/**
 * Configure Supabase auth for Vercel production and print Vercel env vars.
 *
 * Usage:
 *   VERCEL_URL="https://your-app.vercel.app" \
 *   SUPABASE_ACCESS_TOKEN="sbp_..." \
 *   SUPABASE_PROJECT_REF="ophrrajusdwhuxvnsjrr" \
 *   npx tsx scripts/vercel-supabase-setup.ts
 *
 * Optional: reads DATABASE_URL password from .env to build pooler URLs.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd());
const API_BASE = "https://api.supabase.com/v1";

const vercelUrlRaw = process.env.VERCEL_URL;
const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF;

if (!token || !projectRef || !vercelUrlRaw) {
  console.error("Required environment variables:");
  console.error("  VERCEL_URL              — e.g. https://revia.vercel.app");
  console.error("  SUPABASE_ACCESS_TOKEN   — https://supabase.com/dashboard/account/tokens");
  console.error("  SUPABASE_PROJECT_REF    — Supabase project ID");
  process.exit(1);
}

const vercelUrl = vercelUrlRaw.replace(/\/$/, "");

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

function readEnvValue(key: string): string | undefined {
  try {
    const content = readFileSync(resolve(ROOT, ".env"), "utf8");
    return content.match(new RegExp(`^${key}="([^"]+)"`, "m"))?.[1];
  } catch {
    return undefined;
  }
}

function parsePoolerUrl(url: string) {
  const match = url.match(
    /^postgresql:\/\/postgres\.([^:]+):([^@]+)@(aws-\d+-[^.]+\.pooler\.supabase\.com):(\d+)\/([^?]+)/,
  );
  if (!match) return null;
  const [, ref, password, host, , database] = match;
  return { ref, password, host, database };
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { ...headers, ...init?.headers } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${init?.method ?? "GET"} ${path} failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<T>;
}

type ApiKey = { name?: string; type?: string; api_key?: string };

async function main() {
  const productionOrigin = new URL(vercelUrl).origin;
  const redirectUrls = [
    "http://localhost:3000/auth/callback",
    "http://localhost:3000/**",
    `${productionOrigin}/auth/callback`,
    `${productionOrigin}/**`,
    "https://*-*.vercel.app/auth/callback",
    "https://*-*.vercel.app/**",
  ];

  console.log(`==> Updating Supabase auth for ${productionOrigin}`);
  await api(`/projects/${projectRef}/config/auth`, {
    method: "PATCH",
    body: JSON.stringify({
      site_url: productionOrigin,
      uri_allow_list: redirectUrls.join(","),
      mailer_autoconfirm: true,
      external_email_enabled: true,
    }),
  });
  console.log("==> Supabase auth redirect URLs updated");

  const keys = await api<ApiKey[]>(`/projects/${projectRef}/api-keys?reveal=true`);
  const anonKey =
    keys.find((key) => key.name === "anon" || key.type === "anon")?.api_key ??
    keys.find((key) => key.name?.toLowerCase().includes("anon"))?.api_key;

  if (!anonKey) {
    throw new Error("Could not find anon key");
  }

  const directUrl = readEnvValue("DIRECT_URL") ?? readEnvValue("DATABASE_URL");
  const pooler = directUrl ? parsePoolerUrl(directUrl) : null;

  let databaseUrl = directUrl ?? "";
  let directUrlOut = directUrl ?? "";

  if (pooler) {
    directUrlOut = `postgresql://postgres.${pooler.ref}:${pooler.password}@${pooler.host}:5432/${pooler.database}?sslmode=require`;
    databaseUrl = `postgresql://postgres.${pooler.ref}:${pooler.password}@${pooler.host}:6543/${pooler.database}?pgbouncer=true&connection_limit=1&sslmode=require`;
  }

  console.log("");
  console.log("==> Set these in Vercel → Project → Settings → Environment Variables");
  console.log("");
  console.log(`NEXT_PUBLIC_SUPABASE_URL=${`https://${projectRef}.supabase.co`}`);
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`);
  console.log(`DATABASE_URL=${databaseUrl}`);
  console.log(`DIRECT_URL=${directUrlOut}`);
  console.log(`SUPABASE_PROJECT_REF=${projectRef}`);
  console.log("");
  console.log("Vercel import settings:");
  console.log("  Root Directory: revia");
  console.log("  Framework: Next.js");
  console.log("");
  console.log("After first deploy:");
  console.log(`  Open ${productionOrigin} and sign up / sign in`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
