import { z } from "zod";

function optionalNullableText(maxLength: number) {
  return z.string().trim().max(maxLength).nullable().optional();
}

export const createCardSchema = z.object({
  lessonId: z.string().uuid().nullable().optional(),
  front: z.string().trim().min(1, "Front is required").max(4000),
  back: z.string().trim().min(1, "Back is required").max(4000),
  pronunciation: optionalNullableText(500),
  exampleSentence: optionalNullableText(2000),
  notes: optionalNullableText(4000),
  imageUrl: optionalNullableText(2048),
  audioUrl: optionalNullableText(2048),
});

export const updateCardSchema = createCardSchema.partial().extend({
  isSuspended: z.boolean().optional(),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
