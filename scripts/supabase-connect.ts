/**
 * Configure Supabase Auth for Revia and write keys to .env.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_... SUPABASE_PROJECT_REF=your-ref npx tsx scripts/supabase-connect.ts
 *
 * Or authenticate Supabase MCP in Cursor (OAuth), then ask the agent to run this
 * with keys fetched via MCP `get_publishable_keys` / `get_project_url`.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd());
const API_BASE = "https://api.supabase.com/v1";
const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF;

if (!token || !projectRef) {
  console.error("Missing required environment variables:");
  console.error("  SUPABASE_ACCESS_TOKEN  — from https://supabase.com/dashboard/account/tokens");
  console.error("  SUPABASE_PROJECT_REF   — Project ID from Supabase dashboard → Settings → General");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

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
  console.log(`==> Configuring Supabase project: ${projectRef}`);

  const redirectUrls = [
    "http://localhost:3000/auth/callback",
    "http://localhost:3000/**",
  ];

  await api(`/projects/${projectRef}/config/auth`, {
    method: "PATCH",
    body: JSON.stringify({
      site_url: "http://localhost:3000",
      uri_allow_list: redirectUrls.join(","),
      mailer_autoconfirm: true,
      external_email_enabled: true,
    }),
  });
  console.log("==> Auth config updated (site URL, redirect URLs, auto-confirm email)");

  const keys = await api<ApiKey[]>(`/projects/${projectRef}/api-keys?reveal=true`);
  const anonKey =
    keys.find((key) => key.name === "anon" || key.type === "anon")?.api_key ??
    keys.find((key) => key.name?.toLowerCase().includes("anon"))?.api_key;

  if (!anonKey) {
    throw new Error("Could not find anon/publishable key in project API keys response");
  }

  const projectUrl = `https://${projectRef}.supabase.co`;
  const envPath = resolve(ROOT, ".env");
  let envContent = "";

  try {
    envContent = readFileSync(envPath, "utf8");
  } catch {
    envContent = readFileSync(resolve(ROOT, ".env.example"), "utf8");
  }

  const updates: Record<string, string> = {
    NEXT_PUBLIC_SUPABASE_URL: projectUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
    SUPABASE_PROJECT_REF: projectRef!,
  };

  for (const [key, value] of Object.entries(updates)) {
    const pattern = new RegExp(`^${key}=.*$`, "m");
    const line = `${key}="${value}"`;
    envContent = pattern.test(envContent)
      ? envContent.replace(pattern, line)
      : `${envContent.trimEnd()}\n${line}\n`;
  }

  writeFileSync(envPath, envContent);
  console.log("==> Wrote Supabase keys to .env");
  console.log("");
  console.log("Next steps:");
  console.log("  1. Restart the dev server: npm run dev");
  console.log("  2. Open http://localhost:3000 — you should be redirected to /login");
  console.log("  3. Create an account at /signup");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
