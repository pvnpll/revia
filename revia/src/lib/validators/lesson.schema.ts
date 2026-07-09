import { z } from "zod";

export const createLessonSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateLessonSchema = createLessonSchema.partial();

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
