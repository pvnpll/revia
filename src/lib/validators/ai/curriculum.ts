import { z } from "zod";

export const curriculumRequestSchema = z.object({
  goal: z.string().trim().min(3),
  currentTopic: z.string().trim().min(2),
  knownConcepts: z.array(z.string()).default([]),
});

export const curriculumResponseSchema = z.object({
  nextTopic: z.string().describe("A short 1-4 word title for the next logical topic to study"),
  reasoning: z.string().describe("A brief 1-2 sentence explanation of why this topic is the next logical step"),
});

export type CurriculumRequestInput = z.infer<typeof curriculumRequestSchema>;
export type CurriculumResponse = z.infer<typeof curriculumResponseSchema>;

