import { fetchJson } from "@/lib/utils/fetch-json";
import { GenerateCardsApiParams, GenerateCardsApiResponse } from "../types/ai-session";

import { LearnerContext } from "@/lib/validators/ai";

export const aiApi = {
  generateCards(params: GenerateCardsApiParams): Promise<GenerateCardsApiResponse> {
    return fetchJson<GenerateCardsApiResponse>("/api/v1/generate/cards", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },
  
  getContext(topic: string): Promise<LearnerContext> {
    return fetchJson<LearnerContext>(`/api/v1/generate/context?topic=${encodeURIComponent(topic)}`);
  },
  
  updateContext(topic: string, updates: Partial<LearnerContext>): Promise<LearnerContext> {
    return fetchJson<LearnerContext>("/api/v1/generate/context", {
      method: "PUT",
      body: JSON.stringify({ topic, updates }),
    });
  },
};

