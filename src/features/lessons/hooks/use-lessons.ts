"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { lessonApi } from "@/features/lessons/services/lesson-api";
import type { CreateLessonInput, UpdateLessonInput } from "@/lib/validators/lesson.schema";

export const lessonQueryKeys = {
  all: (deckId: string) => ["decks", deckId, "lessons"] as const,
  detail: (deckId: string, lessonId: string) =>
    ["decks", deckId, "lessons", lessonId] as const,
};

export function useLessons(deckId: string) {
  return useQuery({
    queryKey: lessonQueryKeys.all(deckId),
    queryFn: () => lessonApi.list(deckId),
    enabled: Boolean(deckId),
    staleTime: 2 * 60_000,
  });
}

export function useLesson(deckId: string, lessonId: string) {
  return useQuery({
    queryKey: lessonQueryKeys.detail(deckId, lessonId),
    queryFn: () => lessonApi.getById(deckId, lessonId),
    enabled: Boolean(deckId) && Boolean(lessonId),
  });
}

export function useCreateLesson(deckId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLessonInput) => lessonApi.create(deckId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonQueryKeys.all(deckId) });
    },
  });
}

export function useUpdateLesson(deckId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, input }: { lessonId: string; input: UpdateLessonInput }) =>
      lessonApi.update(deckId, lessonId, input),
    onSuccess: (_data, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: lessonQueryKeys.all(deckId) });
      queryClient.invalidateQueries({ queryKey: lessonQueryKeys.detail(deckId, lessonId) });
    },
  });
}

export function useDeleteLesson(deckId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => lessonApi.delete(deckId, lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonQueryKeys.all(deckId) });
    },
  });
}
