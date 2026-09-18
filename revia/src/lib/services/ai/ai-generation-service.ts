import {
  AIProvider,
  AIProviderError,
  createAIProvider,
  ProviderGenerateCardsResult,
  ProviderTokenUsage,
} from "@/lib/providers/ai";
import {
  GeneratedCard,
  generatedCardsResultSchema,
  GenerationRequestInput,
  generationRequestSchema,
} from "@/lib/validators/ai";
import { filterDuplicateCards } from "./dedup-filter";
import { buildGenerationPrompts } from "./prompt-builder";

export interface AIGenerationServiceOptions {
  provider?: AIProvider;
  maxRetries?: number;
}

export interface GenerationServiceMeta {
  provider: string;
  model: string;
  batchSize: number;
  generatedAt: string;
  duplicatesFiltered?: number;
  usage?: ProviderTokenUsage;
}

export interface GenerationServiceResult {
  cards: GeneratedCard[];
  meta: GenerationServiceMeta;
}

export class AIGenerationService {
  private readonly provider?: AIProvider;
  private readonly maxRetries: number;

  constructor(options: AIGenerationServiceOptions = {}) {
    this.provider = options.provider;
    this.maxRetries = options.maxRetries ?? 2;
  }

  async generate(rawInput: unknown): Promise<GenerationServiceResult> {
    const input: GenerationRequestInput = generationRequestSchema.parse(rawInput);
    let provider = this.provider ?? createAIProvider({ providerName: input.provider });

    // Prepare fallback provider if available and not explicitly locked
    let fallbackProvider: AIProvider | null = null;
    if (!this.provider && !input.provider) {
      if (provider.name === "gemini" && process.env.OPENROUTER_API_KEY) {
        try {
          fallbackProvider = createAIProvider({ providerName: "openrouter" });
        } catch {
          // ignore
        }
      } else if (provider.name === "openrouter" && process.env.GEMINI_API_KEY) {
        try {
          fallbackProvider = createAIProvider({ providerName: "gemini" });
        } catch {
          // ignore
        }
      }
    }

    const prompts = buildGenerationPrompts(input);
    let userPrompt = prompts.userPrompt;
    const systemPrompt = prompts.systemPrompt;

    let lastResult: ProviderGenerateCardsResult | null = null;
    let validatedCards: GeneratedCard[] | null = null;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        lastResult = await provider.generateCards({
          goal: input.goal,
          topic: input.topic,
          level: input.level,
          batchSize: input.batchSize,
          context: input.context,
          systemPrompt,
          userPrompt,
        });

        const parseResult = generatedCardsResultSchema.safeParse({
          cards: lastResult.cards,
        });

        if (parseResult.success) {
          validatedCards = parseResult.data.cards;
          break;
        }

        lastError = new Error(
          `Validation failed: ${parseResult.error.errors.map((e) => e.message).join(", ")}`,
        );

        // Adjust prompt for next retry
        userPrompt += `\n\nNOTE: The previous generation failed schema validation (${parseResult.error.errors[0]?.message}). Please strictly return valid JSON according to the schema.`;
      } catch (err) {
        if (err instanceof AIProviderError && err.code === "RATE_LIMITED") {
          // Do not retry on rate limits
          throw err;
        }
        if (err instanceof AIProviderError && err.code === "PROVIDER_AUTH_FAILED") {
          // Do not retry on auth failures
          throw err;
        }

        // If primary provider is unavailable (503 / high demand) and fallback exists, switch!
        if (
          fallbackProvider &&
          err instanceof AIProviderError &&
          (err.status === 503 || err.code === "PROVIDER_UNAVAILABLE")
        ) {
          console.warn(
            `Primary provider (${provider.name}) returned 503, switching to fallback provider (${fallbackProvider.name})`,
          );
          provider = fallbackProvider;
          fallbackProvider = null;
          continue;
        }

        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    if (!validatedCards || validatedCards.length === 0) {
      if (lastError instanceof AIProviderError) {
        throw lastError;
      }
      throw new AIProviderError(
        `AI card generation failed after ${this.maxRetries + 1} attempts: ${lastError?.message || "Invalid output"}`,
        "GENERATION_FAILED",
        502,
        lastError,
      );
    }

    // Apply programmatic deduplication
    const dedupResult = filterDuplicateCards(validatedCards, {
      known: input.context.known,
      recentlySeen: input.context.recentlySeen,
    });

    if (dedupResult.cards.length === 0) {
      throw new AIProviderError(
        "All generated cards were duplicates of existing known or recently seen content",
        "EMPTY_GENERATION",
        502,
      );
    }

    const modelName =
      lastResult?.usage?.model ||
      (provider.name === "openrouter"
        ? "meta-llama/llama-3.3-70b-instruct:free"
        : "gemini-3.6-flash");

    return {
      cards: dedupResult.cards,
      meta: {
        provider: provider.name,
        model: modelName,
        batchSize: dedupResult.cards.length,
        generatedAt: new Date().toISOString(),
        duplicatesFiltered: dedupResult.duplicatesRemoved,
        usage: lastResult?.usage,
      },
    };
  }
}

export const aiGenerationService = new AIGenerationService();

