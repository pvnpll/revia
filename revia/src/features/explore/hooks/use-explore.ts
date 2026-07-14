"use client";

import { useQuery } from "@tanstack/react-query";

import { exploreApi } from "@/features/explore/services/explore-api";

export const exploreQueryKeys = {
  all: ["explore"] as const,
  list: (query: string) => ["explore", query] as const,
};

export function useExplore(query: string) {
  const normalized = query.trim();

  return useQuery({
    queryKey: exploreQueryKeys.list(normalized),
    queryFn: () => exploreApi.list(normalized),
    staleTime: 2 * 60_000,
  });
}
