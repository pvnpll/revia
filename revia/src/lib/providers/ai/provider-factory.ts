import { AIProvider, AIProviderError } from "./ai-provider";
import { GeminiProvider, GeminiProviderOptions } from "./gemini-provider";
import { OpenRouterProvider, OpenRouterProviderOptions } from "./openrouter-provider";

export interface ProviderFactoryOptions {
  providerName?: string;
  geminiOptions?: GeminiProviderOptions;
  openrouterOptions?: OpenRouterProviderOptions;
}

export function createAIProvider(options: ProviderFactoryOptions = {}): AIProvider {
  let providerName =
    options.providerName || process.env.AI_PROVIDER?.toLowerCase();

  if (!providerName) {
    // If user has OPENROUTER_API_KEY set and GEMINI_API_KEY not set, prefer openrouter
    if (process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY) {
      providerName = "openrouter";
    } else {
      providerName = "gemini";
    }
  }

  switch (providerName) {
    case "gemini":
      return new GeminiProvider(options.geminiOptions);
    case "openrouter":
      return new OpenRouterProvider(options.openrouterOptions);
    default:
      throw new AIProviderError(
        `Unsupported AI provider: ${providerName}`,
        "PROVIDER_UNAVAILABLE",
        503,
      );
  }
}
