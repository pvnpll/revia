import { deckRepository } from "@/lib/repositories/deck.repository";
import type { CreateDeckInput, UpdateDeckInput } from "@/lib/validators/deck.schema";
import type { ExploreInput } from "@/lib/validators/explore.schema";
import { ApiError } from "@/types/api";
import type { Deck, DeckDetail, DeckWithStats } from "@/types/deck";
import type { ExploreResponse } from "@/types/explore";

export const deckService = {
  async list(userId: string): Promise<DeckWithStats[]> {
    return deckRepository.findByUser(userId);
  },

  async assertOwner(userId: string, deckId: string): Promise<Deck> {
    const deck = await deckRepository.findByIdForUser(deckId, userId);
    if (!deck) {
      throw new ApiError(404, "NOT_FOUND", "Deck not found");
    }
    return deck;
  },

  async getReadable(userId: string, deckId: string): Promise<DeckDetail> {
    const owned = await deckRepository.findByIdForUser(deckId, userId);
    if (owned) {
      void deckRepository.recordAccess(deckId, userId);
      return { ...owned, isOwner: true };
    }

    const publicDeck = await deckRepository.findPublicById(deckId);
    if (publicDeck) {
      const { authorUsername, ...deck } = publicDeck;
      const importedCopy = await deckRepository.findImportedCopy(userId, deckId);
      return {
        ...deck,
        authorUsername,
        isOwner: false,
        importedDeckId: importedCopy?.id ?? null,
      };
    }

    throw new ApiError(404, "NOT_FOUND", "Deck not found");
  },

  /** @deprecated Use assertOwner for mutations or getReadable for reads */
  async getById(userId: string, deckId: string): Promise<Deck> {
    return deckService.assertOwner(userId, deckId);
  },

  async explore(_userId: string, input: ExploreInput): Promise<ExploreResponse> {
    const decks = await deckRepository.findPublicDecks({
      query: input.q,
      limit: input.limit,
    });

    return {
      query: input.q,
      decks,
    };
  },

  async create(userId: string, input: CreateDeckInput): Promise<Deck> {
    return deckRepository.create(userId, input);
  },

  async update(userId: string, deckId: string, input: UpdateDeckInput): Promise<DeckDetail> {
    const owned = await deckService.assertOwner(userId, deckId);
    if (owned.sourceDeckId && input.isPublic !== undefined) {
      throw new ApiError(
        400,
        "VALIDATION",
        "Imported decks cannot change visibility. Only the original author controls public sharing.",
      );
    }
    const deck = await deckRepository.update(deckId, input);
    return { ...deck, isOwner: true };
  },

  async delete(userId: string, deckId: string): Promise<void> {
    await deckService.assertOwner(userId, deckId);
    await deckRepository.delete(deckId);
  },

  async importPublicDeck(userId: string, sourceDeckId: string): Promise<DeckDetail> {
    try {
      const deck = await deckRepository.clonePublicDeckToUser(userId, sourceDeckId);
      return { ...deck, isOwner: true };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "SOURCE_NOT_PUBLIC") {
          throw new ApiError(404, "NOT_FOUND", "Public deck not found");
        }
        if (error.message === "OWN_DECK") {
          throw new ApiError(400, "VALIDATION", "You already own this deck");
        }
      }
      throw error;
    }
  },
};
