import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { LearnerContext, learnerContextSchema } from "@/lib/validators/ai";

export class AiContextService {
  async getContext(userId: string, topic: string): Promise<LearnerContext> {
    const record = await prisma.aiLearnerContext.findUnique({
      where: {
        userId_topic: {
          userId,
          topic,
        },
      },
    });

    if (!record) {
      return learnerContextSchema.parse({}); // return defaults
    }

    // Safely parse the DB record into our validated schema type
    return learnerContextSchema.parse({
      known: record.known,
      struggled: record.struggled,
      recentlySeen: record.recentlySeen,
      preferences: record.preferences || {},
    });
  }

  async updateContext(
    userId: string,
    topic: string,
    updates: Partial<LearnerContext>,
  ): Promise<LearnerContext> {
    const existing = await this.getContext(userId, topic);
    
    // We assume the caller provides the full array if they want to update it.
    // If an array is provided, we use it (maintaining limits). If not, we keep the existing.
    let newRecentlySeen = updates.recentlySeen ?? existing.recentlySeen;
    if (newRecentlySeen.length > 50) {
      newRecentlySeen = newRecentlySeen.slice(newRecentlySeen.length - 50);
    }
    
    let newKnown = updates.known ?? existing.known;
    if (newKnown.length > 100) {
      newKnown = newKnown.slice(newKnown.length - 100);
    }
    
    let newStruggled = updates.struggled ?? existing.struggled;
    if (newStruggled.length > 50) {
      newStruggled = newStruggled.slice(newStruggled.length - 50);
    }

    const record = await prisma.aiLearnerContext.upsert({
      where: {
        userId_topic: {
          userId,
          topic,
        },
      },
      update: {
        known: newKnown,
        struggled: newStruggled,
        recentlySeen: newRecentlySeen,
        preferences: updates.preferences 
          ? (updates.preferences as Prisma.InputJsonValue) 
          : undefined,
      },
      create: {
        userId,
        topic,
        known: newKnown,
        struggled: newStruggled,
        recentlySeen: newRecentlySeen,
        preferences: updates.preferences 
          ? (updates.preferences as Prisma.InputJsonValue) 
          : {},
      },
    });

    return learnerContextSchema.parse({
      known: record.known,
      struggled: record.struggled,
      recentlySeen: record.recentlySeen,
      preferences: record.preferences || {},
    });
  }
}

export const aiContextService = new AiContextService();
