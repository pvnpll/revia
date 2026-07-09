"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cardQueryKeys } from "@/features/cards/hooks/use-cards";
import { dashboardQueryKeys } from "@/features/dashboard/hooks/use-dashboard";
import { deckQueryKeys } from "@/features/decks/hooks/use-decks";
import { reviewApi } from "@/features/review/services/review-api";
import type { RatingValue } from "@/lib/scheduler";

export const reviewQueryKeys = {
  due: (deckId?: string) => ["review", "due", deckId ?? "all"] as const,
};

export function useDueReviewCards(deckId?: string) {
  return useQuery({
    queryKey: reviewQueryKeys.due(deckId),
    queryFn: () => reviewApi.getDueCards({ deckId, limit: 20 }),
  });
}

export function useSubmitReview(deckId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { cardId: string; rating: RatingValue; durationMs?: number }) =>
      reviewApi.submitReview(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.due(deckId) });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary });
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.all });
      if (deckId) {
        queryClient.invalidateQueries({ queryKey: deckQueryKeys.detail(deckId) });
        queryClient.invalidateQueries({ queryKey: cardQueryKeys.all(deckId) });
      }
    },
  });
}
