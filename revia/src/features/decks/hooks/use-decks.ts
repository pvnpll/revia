"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deckApi } from "@/features/decks/services/deck-api";
import type { CreateDeckInput } from "@/lib/validators/deck.schema";

export const deckQueryKeys = {
  all: ["decks"] as const,
  detail: (id: string) => ["decks", id] as const,
};

export function useDecks() {
  return useQuery({
    queryKey: deckQueryKeys.all,
    queryFn: () => deckApi.list(),
  });
}

export function useDeck(deckId: string) {
  return useQuery({
    queryKey: deckQueryKeys.detail(deckId),
    queryFn: () => deckApi.getById(deckId),
    enabled: Boolean(deckId),
  });
}

export function useCreateDeck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDeckInput) => deckApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.all });
    },
  });
}

export function useDeleteDeck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deckId: string) => deckApi.delete(deckId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.all });
    },
  });
}
