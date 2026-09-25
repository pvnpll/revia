"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cardApi } from "@/features/cards/services/card-api";
import { dashboardQueryKeys } from "@/features/dashboard/hooks/use-dashboard";
import { deckQueryKeys } from "@/features/decks/hooks/use-decks";
import { lessonQueryKeys } from "@/features/lessons/hooks/use-lessons";
import type { CreateCardInput, UpdateCardInput } from "@/lib/validators/card.schema";

export const cardQueryKeys = {
  all: (deckId: string) => ["decks", deckId, "cards"] as const,
  detail: (deckId: string, cardId: string) => ["decks", deckId, "cards", cardId] as const,
};

function useInvalidateCardDependencies(deckId: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: cardQueryKeys.all(deckId) });
    queryClient.invalidateQueries({ queryKey: deckQueryKeys.all });
    queryClient.invalidateQueries({ queryKey: deckQueryKeys.detail(deckId) });
    queryClient.invalidateQueries({ queryKey: lessonQueryKeys.all(deckId) });
    queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary });
  };
}

export function useCards(deckId: string, options?: { lessonId?: string }) {
  const lessonId = options?.lessonId;

  return useQuery({
    queryKey: lessonId
      ? [...cardQueryKeys.all(deckId), "lesson", lessonId]
      : cardQueryKeys.all(deckId),
    queryFn: () => cardApi.list(deckId, lessonId ? { lessonId } : undefined),
    enabled: Boolean(deckId),
  });
}

export function useCard(deckId: string, cardId: string) {
  return useQuery({
    queryKey: cardQueryKeys.detail(deckId, cardId),
    queryFn: () => cardApi.getById(deckId, cardId),
    enabled: Boolean(deckId) && Boolean(cardId),
  });
}

export function useCreateCard(deckId: string) {
  const invalidate = useInvalidateCardDependencies(deckId);

  return useMutation({
    mutationFn: (input: CreateCardInput) => cardApi.create(deckId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateCard(deckId: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateCardDependencies(deckId);

  return useMutation({
    mutationFn: ({ cardId, input }: { cardId: string; input: UpdateCardInput }) =>
      cardApi.update(deckId, cardId, input),
    onSuccess: (_data, { cardId }) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: cardQueryKeys.detail(deckId, cardId) });
    },
  });
}

export function useDeleteCard(deckId: string) {
  const invalidate = useInvalidateCardDependencies(deckId);

  return useMutation({
    mutationFn: (cardId: string) => cardApi.delete(deckId, cardId),
    onSuccess: invalidate,
  });
}
