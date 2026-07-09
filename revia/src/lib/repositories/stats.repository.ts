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

    const [deckCount, totalCards, dueToday, reviewedToday, matureCards, reviewLogs] =
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
        prisma.reviewLog.findMany({
          where: { userId },
          select: { reviewedAt: true },
          orderBy: { reviewedAt: "desc" },
          take: 500,
        }),
      ]);

    const streak = calculateStreak(reviewLogs.map((l) => l.reviewedAt));

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
