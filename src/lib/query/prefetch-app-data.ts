import type { QueryClient } from "@tanstack/react-query";

import { dashboardQueryKeys } from "@/features/dashboard/hooks/use-dashboard";
import { dashboardApi } from "@/features/dashboard/services/dashboard-api";
import { deckQueryKeys } from "@/features/decks/hooks/use-decks";
import { deckApi } from "@/features/decks/services/deck-api";
import { exploreQueryKeys } from "@/features/explore/hooks/use-explore";
import { exploreApi } from "@/features/explore/services/explore-api";

export function prefetchAppData(queryClient: QueryClient, options?: { authenticated?: boolean }) {
  const authenticated = options?.authenticated ?? true;

  if (authenticated) {
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
    return;
  }

  void queryClient.prefetchQuery({
    queryKey: exploreQueryKeys.list(""),
    queryFn: () => exploreApi.list(""),
    staleTime: 2 * 60_000,
  });
}
