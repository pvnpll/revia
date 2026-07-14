import { z } from "zod";

export const feedbackSchema = z.object({
  type: z.enum(["suggestion", "bug"]),
  message: z.string().trim().min(10, "Please enter at least 10 characters").max(4000),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
