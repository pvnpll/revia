import { z } from "zod";

export const getDueReviewCardsSchema = z.object({
  deckId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const submitReviewSchema = z.object({
  cardId: z.string().uuid(),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  durationMs: z.number().int().min(0).max(60 * 60 * 1000).optional(),
});

export type GetDueReviewCardsInput = z.infer<typeof getDueReviewCardsSchema>;
export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
