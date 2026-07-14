import { feedbackRepository } from "@/lib/repositories/feedback.repository";
import type { FeedbackInput } from "@/lib/validators/feedback.schema";

export const feedbackService = {
  async submit(userId: string, input: FeedbackInput) {
    return feedbackRepository.create(userId, input);
  },
};
