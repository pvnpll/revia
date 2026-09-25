import { AIProvider, AIProviderError } from "./ai-provider";
import { GeminiProvider, GeminiProviderOptions } from "./gemini-provider";
import { OpenRouterProvider, OpenRouterProviderOptions } from "./openrouter-provider";
import { OllamaCloudProvider, OllamaCloudProviderOptions } from "./ollama-cloud-provider";

export interface ProviderFactoryOptions {
  providerName?: string;
  geminiOptions?: GeminiProviderOptions;
  openrouterOptions?: OpenRouterProviderOptions;
  ollamaOptions?: OllamaCloudProviderOptions;
}

export function createAIProvider(options: ProviderFactoryOptions = {}): AIProvider {
  let providerName =
    options.providerName || process.env.AI_PROVIDER?.toLowerCase();

  if (!providerName) {
    if (process.env.OLLAMA_API_KEY) {
      providerName = "ollama";
    } else if (process.env.OPENROUTER_API_KEY) {
      providerName = "openrouter";
    } else {
      providerName = "ollama";
    }
  }


  switch (providerName) {
    case "gemini":
      return new GeminiProvider(options.geminiOptions);
    case "openrouter":
      return new OpenRouterProvider(options.openrouterOptions);
    case "ollama":
      return new OllamaCloudProvider(options.ollamaOptions);
    default:
      throw new AIProviderError(
        `Unsupported AI provider: ${providerName}`,
        "PROVIDER_UNAVAILABLE",
        503,
      );
  }
}
