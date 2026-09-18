import { AIProvider, AIProviderError } from "./ai-provider";
import { GeminiProvider, GeminiProviderOptions } from "./gemini-provider";

export interface ProviderFactoryOptions {
  providerName?: string;
  geminiOptions?: GeminiProviderOptions;
}

export function createAIProvider(options: ProviderFactoryOptions = {}): AIProvider {
  const providerName =
    options.providerName || process.env.AI_PROVIDER?.toLowerCase() || "gemini";

  switch (providerName) {
    case "gemini":
      return new GeminiProvider(options.geminiOptions);
    case "openrouter":
      throw new AIProviderError(
        "OpenRouter provider is scheduled for Phase 2",
        "PROVIDER_UNAVAILABLE",
        503,
      );
    default:
      throw new AIProviderError(
        `Unsupported AI provider: ${providerName}`,
        "PROVIDER_UNAVAILABLE",
        503,
      );
  }
}

