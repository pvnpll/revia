import { fetchJson } from "@/lib/utils/fetch-json";
import type { CreateLessonInput, UpdateLessonInput } from "@/lib/validators/lesson.schema";
import type { Lesson, LessonWithStats } from "@/types/lesson";

export const lessonApi = {
  list(deckId: string): Promise<LessonWithStats[]> {
    return fetchJson<LessonWithStats[]>(`/api/decks/${deckId}/lessons`);
  },

  getById(deckId: string, lessonId: string): Promise<Lesson> {
    return fetchJson<Lesson>(`/api/decks/${deckId}/lessons/${lessonId}`);
  },

  create(deckId: string, input: CreateLessonInput): Promise<Lesson> {
    return fetchJson<Lesson>(`/api/decks/${deckId}/lessons`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(deckId: string, lessonId: string, input: UpdateLessonInput): Promise<Lesson> {
    return fetchJson<Lesson>(`/api/decks/${deckId}/lessons/${lessonId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  delete(deckId: string, lessonId: string): Promise<void> {
    return fetchJson<void>(`/api/decks/${deckId}/lessons/${lessonId}`, { method: "DELETE" });
  },
};
