import { fetchJson } from "@/lib/utils/fetch-json";
import type { CreateCardInput, UpdateCardInput } from "@/lib/validators/card.schema";
import type { CardWithScheduling } from "@/types/card";

export const cardApi = {
  list(deckId: string): Promise<CardWithScheduling[]> {
    return fetchJson<CardWithScheduling[]>(`/api/decks/${deckId}/cards`);
  },

  getById(deckId: string, cardId: string): Promise<CardWithScheduling> {
    return fetchJson<CardWithScheduling>(`/api/decks/${deckId}/cards/${cardId}`);
  },

  create(deckId: string, input: CreateCardInput): Promise<CardWithScheduling> {
    return fetchJson<CardWithScheduling>(`/api/decks/${deckId}/cards`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(
    deckId: string,
    cardId: string,
    input: UpdateCardInput,
  ): Promise<CardWithScheduling> {
    return fetchJson<CardWithScheduling>(`/api/decks/${deckId}/cards/${cardId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  delete(deckId: string, cardId: string): Promise<void> {
    return fetchJson<void>(`/api/decks/${deckId}/cards/${cardId}`, { method: "DELETE" });
  },
};
