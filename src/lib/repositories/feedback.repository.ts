import { prisma } from "@/lib/db/prisma";
import type { FeedbackInput } from "@/lib/validators/feedback.schema";

export const feedbackRepository = {
  async create(userId: string, input: FeedbackInput) {
    const row = await prisma.feedback.create({
      data: {
        userId,
        type: input.type,
        message: input.message,
      },
    });

    return {
      id: row.id,
      type: row.type,
      message: row.message,
      createdAt: row.createdAt.toISOString(),
    };
  },
};
