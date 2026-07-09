import { deckRepository } from "@/lib/repositories/deck.repository";
import type { CreateDeckInput, UpdateDeckInput } from "@/lib/validators/deck.schema";
import { ApiError } from "@/types/api";
import type { Deck, DeckWithStats } from "@/types/deck";

export const deckService = {
  async list(userId: string): Promise<DeckWithStats[]> {
    return deckRepository.findByUser(userId);
  },

  async getById(userId: string, deckId: string): Promise<Deck> {
    const deck = await deckRepository.findByIdForUser(deckId, userId);
    if (!deck) {
      throw new ApiError(404, "NOT_FOUND", "Deck not found");
    }
    return deck;
  },

  async create(userId: string, input: CreateDeckInput): Promise<Deck> {
    return deckRepository.create(userId, input);
  },

  async update(userId: string, deckId: string, input: UpdateDeckInput): Promise<Deck> {
    await deckService.getById(userId, deckId);
    return deckRepository.update(deckId, input);
  },

  async delete(userId: string, deckId: string): Promise<void> {
    await deckService.getById(userId, deckId);
    await deckRepository.delete(deckId);
  },
};
