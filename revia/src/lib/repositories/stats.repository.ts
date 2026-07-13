import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

const MATURE_INTERVAL_DAYS = 21;

export interface DailySummary {
  dueToday: number;
  reviewedToday: number;
  totalCards: number;
  matureCards: number;
  deckCount: number;
  streak: number;
}

export const statsRepository = {
  async getDailySummary(userId: string): Promise<DailySummary> {
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const streakLookback = new Date(todayStart);
    streakLookback.setDate(streakLookback.getDate() - 90);

    const [deckCount, totalCards, dueToday, reviewedToday, matureCards, reviewDays] =
      await Promise.all([
        prisma.deck.count({ where: { userId, isArchived: false } }),
        prisma.card.count({
          where: { deck: { userId, isArchived: false }, isSuspended: false },
        }),
        prisma.cardSchedulingState.count({
          where: {
            dueAt: { lte: now },
            card: { isSuspended: false, deck: { userId, isArchived: false } },
          },
        }),
        prisma.reviewLog.count({
          where: { userId, reviewedAt: { gte: todayStart } },
        }),
        prisma.cardSchedulingState.count({
          where: {
            intervalDays: { gt: MATURE_INTERVAL_DAYS },
            card: { isSuspended: false, deck: { userId, isArchived: false } },
          },
        }),
        prisma.$queryRaw<Array<{ day: Date }>>(Prisma.sql`
          SELECT DISTINCT DATE(reviewed_at) AS day
          FROM review_logs
          WHERE user_id = ${userId}
            AND reviewed_at >= ${streakLookback}
          ORDER BY day DESC
        `),
      ]);

    const streak = calculateStreak(reviewDays.map((row) => row.day));

    return { dueToday, reviewedToday, totalCards, matureCards, deckCount, streak };
  },
};

function calculateStreak(reviewDates: Date[]): number {
  if (reviewDates.length === 0) return 0;

  const daySet = new Set(reviewDates.map((d) => d.toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (daySet.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
