import { z } from "zod";

const importCardSchema = z.object({
  front: z.string().trim().min(1, "Card front is required"),
  back: z.string().trim().min(1, "Card back is required"),
  pronunciation: z.string().trim().optional().nullable(),
  example: z.string().trim().optional().nullable(),
  exampleSentence: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
});

const importLessonSchema = z.object({
  title: z.string().trim().min(1, "Lesson title is required"),
  description: z.string().trim().optional().nullable(),
  cards: z.array(importCardSchema).default([]),
});

export const importDeckSchema = z.object({
  deck: z.object({
    title: z.string().trim().min(1, "Deck title is required"),
    description: z.string().trim().optional().nullable(),
    tags: z.array(z.string().trim().min(1)).optional().default([]),
  }),
  lessons: z.array(importLessonSchema).min(1, "At least one lesson is required"),
});

export const importDeckRequestSchema = importDeckSchema.extend({
  targetDeckId: z.string().uuid().nullable().optional(),
});

export type ImportDeckInput = z.infer<typeof importDeckSchema>;
export type ImportDeckRequest = z.infer<typeof importDeckRequestSchema>;
