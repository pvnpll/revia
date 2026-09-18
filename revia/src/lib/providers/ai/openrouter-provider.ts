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
  "qwen/qwen3.8-27b:free",
  "deepseek/deepseek-v4-flash-0731:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3.5-lightning:free",
];

function extractJsonSubstring(text: string): string {
  let cleaned = text.trim();
  // Strip code block markers
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  // Find outermost JSON object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

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
          // If model is not found (404), unavailable (503), or upstream rate-limited (429), try next model candidate!
          if (err.status === 404 || err.status === 503 || err.status === 429) {
            console.warn(
              `OpenRouter model ${model} failed (${err.status}), trying next free model candidate...`,
            );
            lastError = err;
            continue;
          }
          // Do not retry on auth errors (401/403)
          if (err.status === 401 || err.status === 403) {
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

    throw (
      lastError ||
      new AIProviderError(
        "All OpenRouter candidate models failed or were rate-limited",
        "PROVIDER_UNAVAILABLE",
        503,
      )
    );
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
      stream: false,
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

    let rawResponseBody = "";
    try {
      rawResponseBody = await response.text();
    } catch (err) {
      throw new AIProviderError(
        "Failed to read OpenRouter response body",
        "GENERATION_FAILED",
        502,
        err,
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
    } | null = null;

    try {
      json = JSON.parse(rawResponseBody);
    } catch {
      // Check if response was returned as Server-Sent Events (SSE) lines
      if (rawResponseBody.includes("data: ")) {
        try {
          const lines = rawResponseBody.split("\n");
          let accumulatedContent = "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
              const chunk = JSON.parse(trimmed.slice(6));
              const delta =
                chunk.choices?.[0]?.delta?.content ||
                chunk.choices?.[0]?.message?.content ||
                "";
              accumulatedContent += delta;
            }
          }
          if (accumulatedContent) {
            json = {
              choices: [{ message: { content: accumulatedContent } }],
            };
          }
        } catch {
          // fallback
        }
      }
    }

    if (!json) {
      throw new AIProviderError(
        `Failed to parse OpenRouter response as JSON: ${rawResponseBody.slice(0, 300)}`,
        "GENERATION_FAILED",
        502,
        rawResponseBody,
      );
    }

    const rawText = json.choices?.[0]?.message?.content?.trim() || "";
    if (!rawText) {
      throw new AIProviderError(
        "OpenRouter returned an empty generation response",
        "EMPTY_GENERATION",
        502,
        json,
      );
    }

    const jsonText = extractJsonSubstring(rawText);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
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
