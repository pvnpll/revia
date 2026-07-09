import { fetchJson } from "@/lib/utils/fetch-json";
import type { ImportDeckRequest } from "@/lib/validators/import.schema";

export interface ImportDeckResult {
  deckId: string;
  deckTitle: string;
  lessonCount: number;
  cardCount: number;
  tagCount: number;
}

export const importApi = {
  importDeck(input: ImportDeckRequest): Promise<ImportDeckResult> {
    return fetchJson<ImportDeckResult>("/api/import/deck", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
