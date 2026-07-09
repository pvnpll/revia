import { fetchJson } from "@/lib/utils/fetch-json";
import type { CreateDeckInput } from "@/lib/validators/deck.schema";
import type { Deck, DeckWithStats } from "@/types/deck";

export const deckApi = {
  list(): Promise<DeckWithStats[]> {
    return fetchJson<DeckWithStats[]>("/api/decks");
  },

  getById(id: string): Promise<Deck> {
    return fetchJson<Deck>(`/api/decks/${id}`);
  },

  create(input: CreateDeckInput): Promise<Deck> {
    return fetchJson<Deck>("/api/decks", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  delete(id: string): Promise<void> {
    return fetchJson<void>(`/api/decks/${id}`, { method: "DELETE" });
  },
};
