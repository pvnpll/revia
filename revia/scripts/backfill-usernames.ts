import { PrismaClient } from "@prisma/client";

import { generateUniqueUsername } from "../src/lib/username";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { username: null },
    select: { id: true },
  });

  for (const user of users) {
    const username = await generateUniqueUsername();
    await prisma.user.update({
      where: { id: user.id },
      data: { username },
    });
    console.log(`Assigned ${username} to ${user.id}`);
  }

  console.log(`Backfilled ${users.length} user(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
