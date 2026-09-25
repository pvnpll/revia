import { cardRepository } from "@/lib/repositories/card.repository";
import { lessonRepository } from "@/lib/repositories/lesson.repository";
import { deckRepository } from "@/lib/repositories/deck.repository";
import { RECENT_DECK_LIMIT, PRACTICE_CARD_LIMIT } from "@/lib/constants/deck-limits";
import { deckService } from "@/lib/services/deck.service";
import { ApiError } from "@/types/api";
import type { CardWithScheduling } from "@/types/card";

async function ensureLessonBelongsToDeck(deckId: string, lessonId: string) {
  const lesson = await lessonRepository.findByIdForDeck(lessonId, deckId);
  if (!lesson) {
    throw new ApiError(404, "NOT_FOUND", "Lesson not found");
  }
}

function deckIdsWithCards(decks: { id: string; cardCount: number }[]): string[] {
  return decks.filter((deck) => deck.cardCount > 0).map((deck) => deck.id);
}

async function getRecentPracticeDeckIds(userId: string): Promise<string[]> {
  const recentDecks = await deckRepository.findRecentByUser(userId, RECENT_DECK_LIMIT);
  const recentWithCards = deckIdsWithCards(recentDecks);
  if (recentWithCards.length > 0) {
    return recentWithCards;
  }

  const allDecks = await deckRepository.findByUser(userId);
  return deckIdsWithCards(allDecks).slice(0, RECENT_DECK_LIMIT);
}

export const practiceService = {
  async getCards(
    userId: string | null,
    options?: { deckId?: string; lessonId?: string },
  ): Promise<CardWithScheduling[]> {
    if (options?.deckId) {
      await deckService.getReadable(userId, options.deckId);

      if (options.lessonId) {
        await ensureLessonBelongsToDeck(options.deckId, options.lessonId);
        return cardRepository.findForPractice(options.deckId, {
          lessonId: options.lessonId,
        });
      }

      return cardRepository.findForPractice(options.deckId);
    }

    if (!userId) {
      throw new ApiError(401, "UNAUTHORIZED", "Sign in to practice your library");
    }

    const deckIds = await getRecentPracticeDeckIds(userId);
    return cardRepository.findForPracticeByDeckIds(deckIds, {
      limit: PRACTICE_CARD_LIMIT,
    });
  },
};
