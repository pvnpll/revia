import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$queryRaw`SELECT 1`;
  process.exit(0);
}

main().catch(() => process.exit(1)).finally(() => prisma.$disconnect());
