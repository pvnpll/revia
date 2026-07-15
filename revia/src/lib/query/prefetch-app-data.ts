import type { QueryClient } from "@tanstack/react-query";

import { dashboardQueryKeys } from "@/features/dashboard/hooks/use-dashboard";
import { dashboardApi } from "@/features/dashboard/services/dashboard-api";
import { deckQueryKeys } from "@/features/decks/hooks/use-decks";
import { deckApi } from "@/features/decks/services/deck-api";
import { practiceQueryKeys } from "@/features/practice/hooks/use-practice";
import { practiceApi } from "@/features/practice/services/practice-api";

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
    queryKey: practiceQueryKeys.cards(),
    queryFn: () => practiceApi.getCards(),
    staleTime: 60_000,
  });
}
