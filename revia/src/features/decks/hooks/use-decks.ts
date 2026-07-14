"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { deckApi } from "@/features/decks/services/deck-api";
import type { CreateDeckInput, UpdateDeckInput } from "@/lib/validators/deck.schema";

export const deckQueryKeys = {
  all: ["decks"] as const,
  detail: (id: string) => ["decks", id] as const,
};

export function useDecks() {
  return useQuery({
    queryKey: deckQueryKeys.all,
    queryFn: () => deckApi.list(),
    staleTime: 5 * 60_000,
  });
}

export function useDeck(deckId: string) {
  return useQuery({
    queryKey: deckQueryKeys.detail(deckId),
    queryFn: () => deckApi.getById(deckId),
    enabled: Boolean(deckId),
    staleTime: 2 * 60_000,
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

export function useUpdateDeck(deckId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateDeckInput) => deckApi.update(deckId, input),
    onSuccess: (deck) => {
      queryClient.setQueryData(deckQueryKeys.detail(deckId), deck);
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["explore"] });
    },
  });
}

export function useImportPublicDeck(sourceDeckId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => deckApi.importPublic(sourceDeckId),
    onSuccess: (deck) => {
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.detail(sourceDeckId) });
      queryClient.setQueryData(deckQueryKeys.detail(deck.id), deck);
      router.push(`/decks/${deck.id}`);
      router.refresh();
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
