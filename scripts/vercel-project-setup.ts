/**
 * Configure Vercel project: root directory, production branch, preview branch.
 *
 * Usage:
 *   VERCEL_TOKEN="..." npx tsx scripts/vercel-project-setup.ts
 *
 * Create a token at https://vercel.com/account/tokens
 */

const PROJECT_ID = "prj_7vTPFWtSZHRVieJLKR3tku0BQuIx";
const PROJECT_NAME = "revia";
const ROOT_DIRECTORY = "revia";
const PRODUCTION_BRANCH = "main";
const PREVIEW_BRANCH = "develop";

const token = process.env.VERCEL_TOKEN;

if (!token) {
  console.error("Missing VERCEL_TOKEN.");
  console.error("Create one at https://vercel.com/account/tokens");
  console.error("");
  console.error("Then run:");
  console.error('  VERCEL_TOKEN="..." npx tsx scripts/vercel-project-setup.ts');
  process.exit(1);
}

type ProjectResponse = {
  id: string;
  name: string;
  rootDirectory?: string | null;
  link?: {
    type?: string;
    productionBranch?: string;
  };
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.vercel.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed (${res.status}): ${text}`);
  }

  return text ? (JSON.parse(text) as T) : ({} as T);
}

async function main() {
  console.log(`==> Fetching project ${PROJECT_NAME}`);
  const current = await api<ProjectResponse>(`/v9/projects/${PROJECT_ID}`);

  console.log(`    Current root directory: ${current.rootDirectory ?? "(repo root)"}`);
  console.log(`    Current production branch: ${current.link?.productionBranch ?? "(unknown)"}`);

  console.log(`==> Updating project settings`);
  const updated = await api<ProjectResponse>(`/v9/projects/${PROJECT_ID}`, {
    method: "PATCH",
    body: JSON.stringify({
      rootDirectory: ROOT_DIRECTORY,
      framework: "nextjs",
      buildCommand: "prisma generate && next build",
      installCommand: "npm install",
      link: {
        type: current.link?.type ?? "github",
        productionBranch: PRODUCTION_BRANCH,
      },
    }),
  });

  console.log("✓ Project updated");
  console.log(`  Root Directory: ${updated.rootDirectory ?? ROOT_DIRECTORY}`);
  console.log(`  Production branch: ${updated.link?.productionBranch ?? PRODUCTION_BRANCH}`);
  console.log("");
  console.log("Branch environments:");
  console.log(`  Production (${PRODUCTION_BRANCH}) -> https://revialearn.vercel.app`);
  console.log(`  Preview (${PREVIEW_BRANCH})     -> https://revia-git-${PREVIEW_BRANCH}-pvnplls-projects.vercel.app`);
  console.log("");
  console.log("Next steps in Vercel dashboard:");
  console.log("  1. Settings -> Environments -> Preview -> Branch Tracking");
  console.log("  2. Disable 'All unassigned branches' if shown");
  console.log(`  3. Add branch pattern: ${PREVIEW_BRANCH}`);
  console.log("  4. Redeploy production from main");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
