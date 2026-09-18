import { z } from "zod";

export const generatedCardSchema = z.object({
  front: z.string().trim().min(1, "Front is required").max(1000),
  back: z.string().trim().min(1, "Back is required").max(2000),
  pronunciation: z.string().trim().max(500).nullable().optional(),
  example: z.string().trim().max(2000).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const generatedCardsResultSchema = z.object({
  cards: z.array(generatedCardSchema).min(1, "At least one card must be generated"),
});

export type GeneratedCard = z.infer<typeof generatedCardSchema>;
export type GeneratedCardsResult = z.infer<typeof generatedCardsResultSchema>;
