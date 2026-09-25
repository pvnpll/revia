import { z } from "zod";

export const exploreSchema = z.object({
  q: z.string().trim().default(""),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ExploreInput = z.infer<typeof exploreSchema>;
