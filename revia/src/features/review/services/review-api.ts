import { fetchJson } from "@/lib/utils/fetch-json";
import type { RatingValue } from "@/lib/scheduler";
import type { ReviewQueue, SubmitReviewResult } from "@/types/review";

export const reviewApi = {
  getDueCards(input?: { deckId?: string; limit?: number }): Promise<ReviewQueue> {
    const params = new URLSearchParams();
    if (input?.deckId) params.set("deckId", input.deckId);
    if (input?.limit) params.set("limit", String(input.limit));
    const query = params.toString();
    return fetchJson<ReviewQueue>(`/api/review/due${query ? `?${query}` : ""}`);
  },

  submitReview(input: {
    cardId: string;
    rating: RatingValue;
    durationMs?: number;
  }): Promise<SubmitReviewResult> {
    return fetchJson<SubmitReviewResult>("/api/review", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
