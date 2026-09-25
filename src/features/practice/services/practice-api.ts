import { fetchJson } from "@/lib/utils/fetch-json";
import type { CardWithScheduling } from "@/types/card";

export interface PracticeCardsResponse {
  cards: CardWithScheduling[];
}

export const practiceApi = {
  getCards(options?: { deckId?: string; lessonId?: string }) {
    const params = new URLSearchParams();
    if (options?.deckId) {
      params.set("deckId", options.deckId);
    }
    if (options?.lessonId) {
      params.set("lessonId", options.lessonId);
    }

    const query = params.toString();
    return fetchJson<PracticeCardsResponse>(`/api/practice/cards${query ? `?${query}` : ""}`);
  },
};
