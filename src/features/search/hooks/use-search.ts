"use client";

import { useQuery } from "@tanstack/react-query";

import { searchApi } from "@/features/search/services/search-api";

export const searchQueryKeys = {
  results: (query: string) => ["search", query] as const,
};

export function useSearch(query: string) {
  const normalized = query.trim();

  return useQuery({
    queryKey: searchQueryKeys.results(normalized),
    queryFn: () => searchApi.search(normalized),
    enabled: normalized.length >= 2,
  });
}
