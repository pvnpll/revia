import type { QueryClient } from "@tanstack/react-query";

import { dashboardQueryKeys } from "@/features/dashboard/hooks/use-dashboard";
import { dashboardApi } from "@/features/dashboard/services/dashboard-api";
import { deckQueryKeys } from "@/features/decks/hooks/use-decks";
import { deckApi } from "@/features/decks/services/deck-api";
import { reviewQueryKeys } from "@/features/review/hooks/use-review";
import { reviewApi } from "@/features/review/services/review-api";

export function prefetchAppData(queryClient: QueryClient) {
  void queryClient.prefetchQuery({
    queryKey: dashboardQueryKeys.summary,
    queryFn: () => dashboardApi.getSummary(),
    staleTime: 2 * 60_000,
  });

  void queryClient.prefetchQuery({
    queryKey: deckQueryKeys.all,
    queryFn: () => deckApi.list(),
    staleTime: 5 * 60_000,
  });

  void queryClient.prefetchQuery({
    queryKey: reviewQueryKeys.due(),
    queryFn: () => reviewApi.getDueCards(),
    staleTime: 30_000,
  });
}
