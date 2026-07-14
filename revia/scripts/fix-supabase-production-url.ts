/**
 * Fix Supabase Auth Site URL + redirect allow list for Revia production.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN="sbp_..." \
 *   SUPABASE_PROJECT_REF="ophrrajusdwhuxvnsjrr" \
 *   npx tsx scripts/fix-supabase-production-url.ts
 *
 * Optional override:
 *   APP_URL="https://revialearn.vercel.app"
 */

const API_BASE = "https://api.supabase.com/v1";
const DEFAULT_APP_URL = "https://revialearn.vercel.app";

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF;
const appUrl = (process.env.APP_URL ?? DEFAULT_APP_URL).replace(/\/$/, "");
const autoConfirm = process.env.SUPABASE_AUTO_CONFIRM !== "false";

if (!token || !projectRef) {
  console.error("Required:");
  console.error("  SUPABASE_ACCESS_TOKEN  — https://supabase.com/dashboard/account/tokens");
  console.error("  SUPABASE_PROJECT_REF   — e.g. ophrrajusdwhuxvnsjrr");
  process.exit(1);
}

async function main() {
  const redirectUrls = [
    "http://localhost:3000/auth/callback",
    "http://localhost:3000/**",
    `${appUrl}/auth/callback`,
    `${appUrl}/**`,
    "https://*-*.vercel.app/auth/callback",
    "https://*-*.vercel.app/**",
  ];

  console.log(`==> Setting Supabase Site URL to ${appUrl}`);

  const res = await fetch(`${API_BASE}/projects/${projectRef}/config/auth`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      site_url: appUrl,
      uri_allow_list: redirectUrls.join(","),
      external_email_enabled: true,
      mailer_autoconfirm: autoConfirm,
    }),
  });

  if (!res.ok) {
    throw new Error(`Auth config update failed (${res.status}): ${await res.text()}`);
  }

  console.log("==> Done. Confirmation emails will now link to:");
  console.log(`    ${appUrl}/auth/callback`);
  console.log(`==> Auto-confirm email: ${autoConfirm ? "ON (no confirmation email on signup)" : "OFF"}`);
  console.log("");
  console.log("To keep email confirmation, run with SUPABASE_AUTO_CONFIRM=false");
  console.log("");
  console.log("Also set in Vercel → Environment Variables (Production + Preview):");
  console.log(`    NEXT_PUBLIC_APP_URL=${appUrl}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
