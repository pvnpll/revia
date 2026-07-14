import { fetchJson } from "@/lib/utils/fetch-json";
import type { CreateDeckInput, UpdateDeckInput } from "@/lib/validators/deck.schema";
import type { Deck, DeckDetail, DeckWithStats } from "@/types/deck";

export const deckApi = {
  list(): Promise<DeckWithStats[]> {
    return fetchJson<DeckWithStats[]>("/api/decks");
  },

  getById(id: string): Promise<DeckDetail> {
    return fetchJson<DeckDetail>(`/api/decks/${id}`);
  },

  create(input: CreateDeckInput): Promise<Deck> {
    return fetchJson<Deck>("/api/decks", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(id: string, input: UpdateDeckInput): Promise<DeckDetail> {
    return fetchJson<DeckDetail>(`/api/decks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  importPublic(id: string): Promise<DeckDetail> {
    return fetchJson<DeckDetail>(`/api/decks/${id}/import`, { method: "POST" });
  },

  delete(id: string): Promise<void> {
    return fetchJson<void>(`/api/decks/${id}`, { method: "DELETE" });
  },
};
