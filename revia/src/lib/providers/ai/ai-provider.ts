import { GenerationLevel, LearnerContext } from "@/lib/validators/ai";

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "PROVIDER_UNAVAILABLE"
      | "RATE_LIMITED"
      | "PROVIDER_AUTH_FAILED"
      | "TIMEOUT"
      | "GENERATION_FAILED"
      | "EMPTY_GENERATION",
    public readonly status = 502,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

export interface ProviderGenerateCardsRequest {
  goal: string;
  topic: string;
  level: GenerationLevel;
  batchSize: number;
  context: LearnerContext;
  systemPrompt: string;
  userPrompt: string;
}

export interface ProviderTokenUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  model: string;
}

export interface ProviderGenerateCardsResult {
  cards: unknown[];
  rawText?: string;
  usage?: ProviderTokenUsage;
}

export interface AIProvider {
  readonly name: string;
  generateCards(request: ProviderGenerateCardsRequest): Promise<ProviderGenerateCardsResult>;
}

