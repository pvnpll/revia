"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { dashboardQueryKeys } from "@/features/dashboard/hooks/use-dashboard";
import { deckQueryKeys } from "@/features/decks/hooks/use-decks";
import { importApi } from "@/features/import/services/import-api";
import type { ImportDeckResult } from "@/features/import/services/import-api";
import { lessonQueryKeys } from "@/features/lessons/hooks/use-lessons";
import type { ImportDeckRequest } from "@/lib/validators/import.schema";

export function useImportDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ImportDeckRequest) => importApi.importDeck(input),
    onSuccess: (result: ImportDeckResult) => {
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: deckQueryKeys.detail(result.deckId) });
      queryClient.invalidateQueries({ queryKey: lessonQueryKeys.all(result.deckId) });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary });
    },
  });
}
