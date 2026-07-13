import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

const ROOT = resolve(process.cwd());
const envContent = readFileSync(resolve(ROOT, ".env"), "utf8");
const projectRef = envContent.match(/^SUPABASE_PROJECT_REF="([^"]+)"/m)?.[1];
const password = envContent.match(/^DATABASE_URL="postgresql:\/\/postgres\.[^:]+:([^@]+)@/m)?.[1];

if (!projectRef || !password) {
  console.error("Missing SUPABASE_PROJECT_REF or DATABASE_URL password in .env");
  process.exit(1);
}

const regions = [
  "ap-south-1",
  "ap-southeast-1",
  "eu-west-1",
  "eu-central-1",
  "us-east-1",
  "us-west-1",
];

const prefixes = ["aws-0", "aws-1"];

for (const prefix of prefixes) {
  for (const region of regions) {
    const url = `postgresql://postgres.${projectRef}:${password}@${prefix}-${region}.pooler.supabase.com:5432/postgres?sslmode=require`;
    process.stdout.write(`Trying ${prefix}-${region}... `);
    try {
      execSync(`npx prisma db execute --url "${url}" --stdin`, {
        input: "SELECT 1",
        stdio: ["pipe", "pipe", "pipe"],
        cwd: ROOT,
      });
      console.log("OK");
      console.log(`${prefix}-${region}`);
      process.exit(0);
    } catch (error) {
      const message = error instanceof Error && "stderr" in error ? String((error as { stderr?: Buffer }).stderr ?? "") : "";
      console.log(message.trim().split("\n").pop() ?? "failed");
    }
  }
}

console.error("No working region found");
process.exit(1);
