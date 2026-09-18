import { GeneratedCard, GenerationLevel, LearnerContext } from "@/lib/validators/ai";

export interface AISessionState {
  goal: string;
  topic: string;
  level: GenerationLevel;
  batchSize: number;
  cards: GeneratedCard[];
  context: LearnerContext;
  currentIndex: number;
}

export interface GenerateCardsApiParams {
  goal: string;
  topic: string;
  level: GenerationLevel;
  batchSize?: number;
  context?: LearnerContext;
}

export interface GenerateCardsApiResponse {
  cards: GeneratedCard[];
  meta: {
    provider: string;
    model: string;
    batchSize: number;
    generatedAt: string;
    duplicatesFiltered?: number;
  };
}
