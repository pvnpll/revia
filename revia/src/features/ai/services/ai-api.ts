import { fetchJson } from "@/lib/utils/fetch-json";
import { GenerateCardsApiParams, GenerateCardsApiResponse } from "../types/ai-session";

export const aiApi = {
  generateCards(params: GenerateCardsApiParams): Promise<GenerateCardsApiResponse> {
    return fetchJson<GenerateCardsApiResponse>("/api/v1/generate/cards", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },
};
