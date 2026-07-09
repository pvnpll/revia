import { lessonRepository } from "@/lib/repositories/lesson.repository";
import { deckService } from "@/lib/services/deck.service";
import type { CreateLessonInput, UpdateLessonInput } from "@/lib/validators/lesson.schema";
import { ApiError } from "@/types/api";
import type { Lesson, LessonWithStats } from "@/types/lesson";

export const lessonService = {
  async list(userId: string, deckId: string): Promise<LessonWithStats[]> {
    await deckService.getById(userId, deckId);
    return lessonRepository.findByDeck(deckId);
  },

  async getById(userId: string, deckId: string, lessonId: string): Promise<Lesson> {
    await deckService.getById(userId, deckId);
    const lesson = await lessonRepository.findByIdForDeck(lessonId, deckId);
    if (!lesson) {
      throw new ApiError(404, "NOT_FOUND", "Lesson not found");
    }
    return lesson;
  },

  async create(userId: string, deckId: string, input: CreateLessonInput): Promise<Lesson> {
    await deckService.getById(userId, deckId);
    return lessonRepository.create(deckId, input);
  },

  async update(
    userId: string,
    deckId: string,
    lessonId: string,
    input: UpdateLessonInput,
  ): Promise<Lesson> {
    await lessonService.getById(userId, deckId, lessonId);
    return lessonRepository.update(lessonId, input);
  },

  async delete(userId: string, deckId: string, lessonId: string): Promise<void> {
    await lessonService.getById(userId, deckId, lessonId);
    await lessonRepository.delete(lessonId);
  },
};
