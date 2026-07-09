import { reviewRepository } from "@/lib/repositories/review.repository";
import { schedulingEngine } from "@/lib/scheduler";
import type { GetDueReviewCardsInput, SubmitReviewInput } from "@/lib/validators/review.schema";
import { ApiError } from "@/types/api";
import type { ReviewQueue, SubmitReviewResult } from "@/types/review";

export const reviewService = {
  async getDueCards(userId: string, input: GetDueReviewCardsInput): Promise<ReviewQueue> {
    return reviewRepository.findDueCards({
      userId,
      deckId: input.deckId,
      limit: input.limit,
      now: new Date(),
    });
  },

  async submitReview(userId: string, input: SubmitReviewInput): Promise<SubmitReviewResult> {
    const now = new Date();
    const result = await reviewRepository.submitReview({
      userId,
      cardId: input.cardId,
      rating: input.rating,
      durationMs: input.durationMs,
      now,
      calculateNext: (state, reviewHistory) =>
        schedulingEngine.submitReview({
          state,
          rating: input.rating,
          reviewHistory,
          now,
        }),
    });

    if (!result) {
      throw new ApiError(404, "NOT_FOUND", "Review card not found");
    }

    return result;
  },
};
