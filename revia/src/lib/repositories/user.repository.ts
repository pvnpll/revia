import { prisma } from "@/lib/db/prisma";

export const userRepository = {
  async ensureUser(input: { id: string; email: string; name?: string | null }) {
    await prisma.user.upsert({
      where: { id: input.id },
      update: {
        email: input.email,
        ...(input.name !== undefined ? { name: input.name } : {}),
      },
      create: {
        id: input.id,
        email: input.email,
        name: input.name ?? undefined,
      },
    });
  },
};
