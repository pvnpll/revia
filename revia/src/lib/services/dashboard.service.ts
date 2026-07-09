import { deckRepository } from "@/lib/repositories/deck.repository";
import { statsRepository } from "@/lib/repositories/stats.repository";
import type { DeckWithStats } from "@/types/deck";

export interface DashboardSummary {
  dueToday: number;
  reviewedToday: number;
  totalCards: number;
  matureCards: number;
  deckCount: number;
  streak: number;
  recentDecks: DeckWithStats[];
}

export const dashboardService = {
  async getSummary(userId: string): Promise<DashboardSummary> {
    const [summary, decks] = await Promise.all([
      statsRepository.getDailySummary(userId),
      deckRepository.findByUser(userId),
    ]);

    return {
      ...summary,
      recentDecks: decks.slice(0, 5),
    };
  },
};
