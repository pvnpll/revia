import { lessonRepository } from "@/lib/repositories/lesson.repository";
import { deckService } from "@/lib/services/deck.service";
import type { CreateLessonInput, UpdateLessonInput } from "@/lib/validators/lesson.schema";
import { ApiError } from "@/types/api";
import type { Lesson, LessonWithStats } from "@/types/lesson";

export const lessonService = {
  async list(userId: string | null, deckId: string): Promise<LessonWithStats[]> {
    await deckService.getReadable(userId, deckId);
    return lessonRepository.findByDeck(deckId);
  },

  async getById(userId: string | null, deckId: string, lessonId: string): Promise<Lesson> {
    await deckService.getReadable(userId, deckId);
    const lesson = await lessonRepository.findByIdForDeck(lessonId, deckId);
    if (!lesson) {
      throw new ApiError(404, "NOT_FOUND", "Lesson not found");
    }
    return lesson;
  },

  async create(userId: string, deckId: string, input: CreateLessonInput): Promise<Lesson> {
    await deckService.assertOwner(userId, deckId);
    return lessonRepository.create(deckId, input);
  },

  async update(
    userId: string,
    deckId: string,
    lessonId: string,
    input: UpdateLessonInput,
  ): Promise<Lesson> {
    await deckService.assertOwner(userId, deckId);
    const lesson = await lessonRepository.findByIdForDeck(lessonId, deckId);
    if (!lesson) {
      throw new ApiError(404, "NOT_FOUND", "Lesson not found");
    }
    return lessonRepository.update(lessonId, input);
  },

  async delete(userId: string, deckId: string, lessonId: string): Promise<void> {
    await deckService.assertOwner(userId, deckId);
    const lesson = await lessonRepository.findByIdForDeck(lessonId, deckId);
    if (!lesson) {
      throw new ApiError(404, "NOT_FOUND", "Lesson not found");
    }
    await lessonRepository.delete(lessonId);
  },
};
