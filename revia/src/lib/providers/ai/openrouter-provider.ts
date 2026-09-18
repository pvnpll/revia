import {
  AIProvider,
  AIProviderError,
  ProviderGenerateCardsRequest,
  ProviderGenerateCardsResult,
} from "./ai-provider";

export interface OpenRouterProviderOptions {
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
}

const DEFAULT_FREE_MODELS = [
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "qwen/qwen3.8-27b:free",
  "deepseek/deepseek-v4-flash-0731:free",
];

export class OpenRouterProvider implements AIProvider {
  readonly name = "openrouter";
  private readonly apiKey: string;
  private readonly initialModel: string;
  private readonly timeoutMs: number;

  constructor(options: OpenRouterProviderOptions = {}) {
    const apiKey = options.apiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new AIProviderError(
        "OPENROUTER_API_KEY is not configured",
        "PROVIDER_AUTH_FAILED",
        502,
      );
    }
    this.apiKey = apiKey;
    this.initialModel =
      options.model ||
      process.env.OPENROUTER_MODEL ||
      DEFAULT_FREE_MODELS[0];
    this.timeoutMs = options.timeoutMs || 30000;
  }

  async generateCards(
    request: ProviderGenerateCardsRequest,
  ): Promise<ProviderGenerateCardsResult> {
    const modelsToTry = [
      this.initialModel,
      ...DEFAULT_FREE_MODELS.filter((m) => m !== this.initialModel),
    ];

    let lastError: AIProviderError | null = null;

    for (const model of modelsToTry) {
      try {
        return await this.generateWithModel(model, request);
      } catch (err) {
        if (err instanceof AIProviderError) {
          // If model is not found (404) or unavailable (503), try next model candidate
          if (err.status === 404 || err.status === 503) {
            console.warn(`OpenRouter model ${model} failed (${err.status}), trying next free model candidate...`);
            lastError = err;
            continue;
          }
          // Do not retry on rate limits (429) or auth errors (401/403)
          if (err.status === 429 || err.status === 401 || err.status === 403) {
            throw err;
          }
        }
        lastError =
          err instanceof AIProviderError
            ? err
            : new AIProviderError(
                `OpenRouter error with ${model}: ${err instanceof Error ? err.message : String(err)}`,
                "GENERATION_FAILED",
                502,
                err,
              );
      }
    }

    throw lastError || new AIProviderError("All OpenRouter candidate models failed", "PROVIDER_UNAVAILABLE", 503);
  }

  private async generateWithModel(
    model: string,
    request: ProviderGenerateCardsRequest,
  ): Promise<ProviderGenerateCardsResult> {
    const url = "https://openrouter.ai/api/v1/chat/completions";

    const systemInstruction = `${request.systemPrompt}\n\nIMPORTANT: You must respond ONLY with a valid JSON object matching this schema:
{
  "cards": [
    {
      "front": "string",
      "back": "string",
      "pronunciation": "string (optional)",
      "example": "string (optional)",
      "notes": "string (optional)"
    }
  ]
}
Do not include markdown code block formatting (e.g. \`\`\`json). Return raw JSON only.`;

    const payload = {
      model,
      messages: [
        {
          role: "system",
          content: systemInstruction,
        },
        {
          role: "user",
          content: request.userPrompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://revialearn-ai.vercel.app",
          "X-Title": "Revia AI",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "TimeoutError") {
        throw new AIProviderError("OpenRouter API request timed out", "TIMEOUT", 504, err);
      }
      throw new AIProviderError(
        `Failed to reach OpenRouter API: ${err instanceof Error ? err.message : String(err)}`,
        "PROVIDER_UNAVAILABLE",
        503,
        err,
      );
    }

    if (!response.ok) {
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch {
        // ignore
      }

      if (response.status === 429) {
        throw new AIProviderError(
          `OpenRouter rate limit exceeded (429): ${errorBody}`,
          "RATE_LIMITED",
          429,
          errorBody,
        );
      }
      if (response.status === 401 || response.status === 403) {
        throw new AIProviderError(
          `OpenRouter API key is invalid or unauthorized (${response.status}): ${errorBody}`,
          "PROVIDER_AUTH_FAILED",
          502,
          errorBody,
        );
      }
      if (response.status === 404) {
        throw new AIProviderError(
          `OpenRouter model unavailable (404): ${errorBody}`,
          "PROVIDER_UNAVAILABLE",
          404,
          errorBody,
        );
      }
      if (response.status >= 500) {
        throw new AIProviderError(
          `OpenRouter service error (${response.status}): ${errorBody || "Service unavailable"}`,
          "PROVIDER_UNAVAILABLE",
          503,
          errorBody,
        );
      }

      throw new AIProviderError(
        `OpenRouter API error (${response.status}): ${errorBody}`,
        "GENERATION_FAILED",
        502,
        errorBody,
      );
    }

    let json: {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      };
    };

    try {
      json = (await response.json()) as typeof json;
    } catch (err) {
      throw new AIProviderError(
        "Failed to parse OpenRouter response as JSON",
        "GENERATION_FAILED",
        502,
        err,
      );
    }

    let rawText = json.choices?.[0]?.message?.content?.trim() || "";
    if (!rawText) {
      throw new AIProviderError(
        "OpenRouter returned an empty generation response",
        "EMPTY_GENERATION",
        502,
        json,
      );
    }

    // Strip markdown code block wrappers if present (e.g. ```json ... ```)
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      throw new AIProviderError(
        `Failed to parse generated JSON from OpenRouter: ${err instanceof Error ? err.message : String(err)}`,
        "GENERATION_FAILED",
        502,
        rawText,
      );
    }

    const cards = Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" &&
          parsed !== null &&
          "cards" in parsed &&
          Array.isArray((parsed as { cards: unknown }).cards)
        ? (parsed as { cards: unknown[] }).cards
        : null;

    if (!cards) {
      throw new AIProviderError(
        "OpenRouter response did not contain a valid cards array",
        "GENERATION_FAILED",
        502,
        parsed,
      );
    }

    const usage = json.usage;

    return {
      cards,
      rawText,
      usage: usage
        ? {
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens,
            model,
          }
        : undefined,
    };
  }
}
