import { z } from "zod";

export const searchSchema = z.object({
  q: z.string().trim().max(100).default(""),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type SearchInput = z.infer<typeof searchSchema>;
