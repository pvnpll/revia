import { useCallback } from "react";
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
    queryFn: () => reviewApi.getDueCards({ deckId, limit: 30 }),
    staleTime: 30_000,
  });
}

export function useSubmitReview(deckId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { cardId: string; rating: RatingValue; durationMs?: number }) =>
      reviewApi.submitReview(input),
    onSuccess: () => {
      // Mark stale without refetching — avoids competing network calls during review.
      queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.summary,
        refetchType: "none",
      });
      queryClient.invalidateQueries({
        queryKey: deckQueryKeys.all,
        refetchType: "none",
      });
      if (deckId) {
        queryClient.invalidateQueries({
          queryKey: deckQueryKeys.detail(deckId),
          refetchType: "none",
        });
        queryClient.invalidateQueries({
          queryKey: cardQueryKeys.all(deckId),
          refetchType: "none",
        });
      }
    },
  });
}

export function useRefreshReviewDependencies() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: reviewQueryKeys.due() });
    queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary });
    queryClient.invalidateQueries({ queryKey: deckQueryKeys.all });
  }, [queryClient]);
}
