import { fetchJson } from "@/lib/utils/fetch-json";
import type { FeedbackInput } from "@/lib/validators/feedback.schema";

export interface FeedbackResult {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export const feedbackApi = {
  submit(input: FeedbackInput): Promise<FeedbackResult> {
    return fetchJson<FeedbackResult>("/api/feedback", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
