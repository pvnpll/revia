
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

    const [stats, reviewDays] = await Promise.all([
      prisma.$queryRaw<
        Array<{
          deck_count: bigint;
          total_cards: bigint;
          due_today: bigint;
          reviewed_today: bigint;
          mature_cards: bigint;
        }>
      >`
        SELECT 
          (SELECT COUNT(*) FROM decks WHERE user_id = ${userId} AND is_archived = false) as deck_count,
          (SELECT COUNT(*) FROM cards c JOIN decks d ON c.deck_id = d.id WHERE d.user_id = ${userId} AND d.is_archived = false AND c.is_suspended = false) as total_cards,
          (SELECT COUNT(*) FROM card_scheduling_states css JOIN cards c ON css.card_id = c.id JOIN decks d ON c.deck_id = d.id WHERE d.user_id = ${userId} AND d.is_archived = false AND c.is_suspended = false AND css.due_at <= ${now}) as due_today,
          (SELECT COUNT(*) FROM review_logs WHERE user_id = ${userId} AND reviewed_at >= ${todayStart}) as reviewed_today,
          (SELECT COUNT(*) FROM card_scheduling_states css JOIN cards c ON css.card_id = c.id JOIN decks d ON c.deck_id = d.id WHERE d.user_id = ${userId} AND d.is_archived = false AND c.is_suspended = false AND css.interval_days > ${MATURE_INTERVAL_DAYS}) as mature_cards
      `,
      prisma.$queryRaw<Array<{ day: Date }>>`
        SELECT DISTINCT DATE(reviewed_at) AS day
        FROM review_logs
        WHERE user_id = ${userId}
          AND reviewed_at >= ${streakLookback}
        ORDER BY day DESC
      `
    ]);

    const row = stats[0] ?? {
      deck_count: BigInt(0),
      total_cards: BigInt(0),
      due_today: BigInt(0),
      reviewed_today: BigInt(0),
      mature_cards: BigInt(0),
    };

    const streak = calculateStreak(reviewDays.map((r) => r.day));

    return {
      dueToday: Number(row.due_today),
      reviewedToday: Number(row.reviewed_today),
      totalCards: Number(row.total_cards),
      matureCards: Number(row.mature_cards),
      deckCount: Number(row.deck_count),
      streak,
    };
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
