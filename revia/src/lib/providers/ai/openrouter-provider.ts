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
  "deepseek/deepseek-v4-flash-0731:free",
  "qwen/qwen3.8-27b:free",
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
    this.timeoutMs = options.timeoutMs || 15000;
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
          // Fatal auth errors (401/403) cannot be solved by trying another model
          if (
            err.status === 401 ||
            err.status === 403 ||
            err.code === "PROVIDER_AUTH_FAILED"
          ) {
            throw err;
          }
          console.warn(
            `OpenRouter model ${model} failed (${err.code}: ${err.message}), trying next candidate...`,
          );
          lastError = err;
          continue;
        }

        console.warn(
          `OpenRouter unexpected error with ${model} (${err instanceof Error ? err.message : String(err)}), trying next candidate...`,
        );
        lastError = new AIProviderError(
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
      temperature: 0.3,
      stream: false,
    };

    let response: Response;
    let rawResponseBody = "";
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

      rawResponseBody = await response.text();
    } catch (err: unknown) {
      if (err instanceof AIProviderError) {
        throw err;
      }
      const isTimeout =
        (err instanceof DOMException && err.name === "TimeoutError") ||
        (err instanceof Error &&
          (err.name === "TimeoutError" ||
            err.name === "AbortError" ||
            err.message.toLowerCase().includes("timeout") ||
            err.message.toLowerCase().includes("aborted")));

      if (isTimeout) {
        throw new AIProviderError(
          `OpenRouter request timed out for model ${model}`,
          "TIMEOUT",
          504,
          err,
        );
      }
      throw new AIProviderError(
        `Failed to reach OpenRouter API or read response for ${model}: ${err instanceof Error ? err.message : String(err)}`,
        "PROVIDER_UNAVAILABLE",
        503,
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
        `Failed to parse OpenRouter response as JSON for ${model}: ${rawResponseBody.slice(0, 300)}`,
        "GENERATION_FAILED",
        502,
        rawResponseBody,
      );
    }

    const rawText = json.choices?.[0]?.message?.content?.trim() || "";
    if (!rawText) {
      throw new AIProviderError(
        `OpenRouter returned an empty generation response for ${model}`,
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
        `Failed to parse generated JSON from OpenRouter for ${model}: ${err instanceof Error ? err.message : String(err)}`,
        "GENERATION_FAILED",
        502,
        rawText,
      );
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("cards" in parsed) ||
      !Array.isArray((parsed as { cards: unknown[] }).cards)
    ) {
      throw new AIProviderError(
        `OpenRouter output did not match expected { cards: [...] } structure for ${model}`,
        "GENERATION_FAILED",
        502,
        parsed,
      );
    }

    const cards = (parsed as { cards: unknown[] }).cards.map((card) => {
      const c = card as Record<string, unknown>;
      return {
        front: String(c.front || "").trim(),
        back: String(c.back || "").trim(),
        pronunciation: c.pronunciation ? String(c.pronunciation).trim() : undefined,
        example: c.example ? String(c.example).trim() : undefined,
        notes: c.notes ? String(c.notes).trim() : undefined,
      };
    });

    return {
      cards,
      usage: json.usage
        ? {
            promptTokens: json.usage.prompt_tokens,
            completionTokens: json.usage.completion_tokens,
            totalTokens: json.usage.total_tokens,
            model,
          }
        : undefined,
    };
  }
}
