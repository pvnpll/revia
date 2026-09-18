import { z } from "zod";

export const learnerPreferencesSchema = z.object({
  romanization: z.boolean().optional().default(true),
  examples: z.boolean().optional().default(true),
});

export const learnerContextSchema = z.object({
  known: z.array(z.string().trim().min(1).max(200)).max(100).optional().default([]),
  struggled: z.array(z.string().trim().min(1).max(200)).max(50).optional().default([]),
  recentlySeen: z.array(z.string().trim().min(1).max(200)).max(50).optional().default([]),
  preferences: learnerPreferencesSchema.optional().default({}),
});

export type LearnerPreferences = z.infer<typeof learnerPreferencesSchema>;
export type LearnerContext = z.infer<typeof learnerContextSchema>;
