import { useMutation } from "@tanstack/react-query";
import { aiApi } from "../services/ai-api";
import { GenerateCardsApiParams, GenerateCardsApiResponse } from "../types/ai-session";

export function useAIGenerate() {
  return useMutation<GenerateCardsApiResponse, Error, GenerateCardsApiParams>({
    mutationFn: (params) => aiApi.generateCards(params),
  });
}

