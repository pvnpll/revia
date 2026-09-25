"use client";

import { useQuery } from "@tanstack/react-query";

import { practiceApi } from "@/features/practice/services/practice-api";

export const practiceQueryKeys = {
  cards: (options?: { deckId?: string; lessonId?: string }) =>
    ["practice", "cards", options?.deckId ?? "recent", options?.lessonId ?? "all"] as const,
};

export function usePracticeCards(
  options?: { deckId?: string; lessonId?: string },
  enabled = true,
) {
  return useQuery({
    queryKey: practiceQueryKeys.cards(options),
    queryFn: () => practiceApi.getCards(options),
    select: (data) => data.cards,
    enabled,
  });
}
