import { randomUUID } from "crypto";

import { cardRepository } from "@/lib/repositories/card.repository";
import { lessonRepository } from "@/lib/repositories/lesson.repository";
import { deckService } from "@/lib/services/deck.service";
import { schedulingEngine } from "@/lib/scheduler";
import type { CreateCardInput, UpdateCardInput } from "@/lib/validators/card.schema";
import { ApiError } from "@/types/api";
import type { CardWithScheduling } from "@/types/card";

async function ensureLessonBelongsToDeck(deckId: string, lessonId: string) {
  const lesson = await lessonRepository.findByIdForDeck(lessonId, deckId);
  if (!lesson) {
    throw new ApiError(404, "NOT_FOUND", "Lesson not found");
  }
}

export const cardService = {
  async list(
    userId: string,
    deckId: string,
    options?: { lessonId?: string },
  ): Promise<CardWithScheduling[]> {
    await deckService.getReadable(userId, deckId);
    return cardRepository.findByDeck(deckId, options?.lessonId);
  },

  async getById(userId: string, deckId: string, cardId: string): Promise<CardWithScheduling> {
    await deckService.getReadable(userId, deckId);
    const card = await cardRepository.findByIdForDeck(cardId, deckId);
    if (!card) {
      throw new ApiError(404, "NOT_FOUND", "Card not found");
    }
    return card;
  },

  async create(
    userId: string,
    deckId: string,
    input: CreateCardInput,
  ): Promise<CardWithScheduling> {
    await deckService.assertOwner(userId, deckId);
    if (input.lessonId) {
      await ensureLessonBelongsToDeck(deckId, input.lessonId);
    }

    const cardId = randomUUID();
    const initialState = schedulingEngine.createInitialState(cardId, new Date());

    return cardRepository.create(
      {
        id: cardId,
        deckId,
        ...input,
      },
      initialState,
    );
  },

  async update(
    userId: string,
    deckId: string,
    cardId: string,
    input: UpdateCardInput,
  ): Promise<CardWithScheduling> {
    await deckService.assertOwner(userId, deckId);
    const card = await cardRepository.findByIdForDeck(cardId, deckId);
    if (!card) {
      throw new ApiError(404, "NOT_FOUND", "Card not found");
    }
    if (input.lessonId) {
      await ensureLessonBelongsToDeck(deckId, input.lessonId);
    }

    return cardRepository.update(cardId, input);
  },

  async delete(userId: string, deckId: string, cardId: string): Promise<void> {
    await deckService.assertOwner(userId, deckId);
    const card = await cardRepository.findByIdForDeck(cardId, deckId);
    if (!card) {
      throw new ApiError(404, "NOT_FOUND", "Card not found");
    }
    await cardRepository.delete(cardId);
  },
};
