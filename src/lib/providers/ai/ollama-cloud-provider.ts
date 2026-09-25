import {
  AIProvider,
  AIProviderError,
  ProviderGenerateCardsRequest,
  ProviderGenerateCardsResult,
} from "./ai-provider";

export interface OllamaCloudProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
}

const DEFAULT_FREE_MODELS = [
  "gemma4:31b",
  "gpt-oss:120b",
  "gpt-oss:20b",
  "nemotron-3-nano:30b",
  "nemotron-3-super",
  "nemotron-3-ultra",
];

function extractJsonSubstring(text: string): string {
  let cleaned = text.trim();
  // Strip markdown code block markers if present
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

export class OllamaCloudProvider implements AIProvider {
  readonly name = "ollama";
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly initialModel: string;
  private readonly timeoutMs: number;

  constructor(options: OllamaCloudProviderOptions = {}) {
    const apiKey = options.apiKey || process.env.OLLAMA_API_KEY;
    if (!apiKey) {
      throw new AIProviderError(
        "OLLAMA_API_KEY is not configured",
        "PROVIDER_AUTH_FAILED",
        502,
      );
    }
    this.apiKey = apiKey;

    const rawBaseUrl =
      options.baseUrl ||
      process.env.OLLAMA_BASE_URL ||
      process.env.OLLAMA_HOST ||
      "https://ollama.com";
    this.baseUrl = rawBaseUrl.replace(/\/+$/, "");

    this.initialModel =
      options.model ||
      process.env.OLLAMA_MODEL ||
      DEFAULT_FREE_MODELS[0];
    this.timeoutMs = options.timeoutMs || 25000;
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
            `Ollama Cloud model ${model} failed (${err.code}: ${err.message}), trying next candidate...`,
          );
          lastError = err;
          continue;
        }

        console.warn(
          `Ollama Cloud unexpected error with ${model} (${err instanceof Error ? err.message : String(err)}), trying next candidate...`,
        );
        lastError = new AIProviderError(
          `Ollama Cloud error with ${model}: ${err instanceof Error ? err.message : String(err)}`,
          "GENERATION_FAILED",
          502,
          err,
        );
      }
    }

    throw (
      lastError ||
      new AIProviderError(
        "All Ollama Cloud candidate models failed or were rate-limited",
        "PROVIDER_UNAVAILABLE",
        503,
      )
    );
  }

  private async generateWithModel(
    model: string,
    request: ProviderGenerateCardsRequest,
  ): Promise<ProviderGenerateCardsResult> {
    // Official Ollama Cloud chat endpoint: /api/chat
    const url = this.baseUrl.endsWith("/api")
      ? `${this.baseUrl}/chat`
      : `${this.baseUrl}/api/chat`;

    const systemInstruction = `${request.systemPrompt}\n\nIMPORTANT: You must respond ONLY with a valid JSON object matching this schema:
{
  "cards": [
    {
      "front": "string",
      "back": "string",
      "pronunciation": "string (optional)",
      "example": "string (optional)",
      "notes": "string (optional)",
      "nuance": "string (optional)"
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
      stream: false,
      format: "json",
      options: {
        temperature: 0.3,
      },
    };

    let response: Response;
    let rawResponseBody = "";
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
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
            `Ollama Cloud rate limit exceeded (429): ${errorBody}`,
            "RATE_LIMITED",
            429,
            errorBody,
          );
        }
        if (response.status === 401 || response.status === 403) {
          throw new AIProviderError(
            `Ollama Cloud API key is invalid or unauthorized (${response.status}): ${errorBody}`,
            "PROVIDER_AUTH_FAILED",
            502,
            errorBody,
          );
        }
        if (response.status === 404) {
          throw new AIProviderError(
            `Ollama Cloud model unavailable (404): ${errorBody}`,
            "PROVIDER_UNAVAILABLE",
            404,
            errorBody,
          );
        }
        if (response.status >= 500) {
          throw new AIProviderError(
            `Ollama Cloud service error (${response.status}): ${errorBody || "Service unavailable"}`,
            "PROVIDER_UNAVAILABLE",
            503,
            errorBody,
          );
        }

        throw new AIProviderError(
          `Ollama Cloud API error (${response.status}): ${errorBody}`,
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
          `Ollama Cloud request timed out for model ${model}`,
          "TIMEOUT",
          504,
          err,
        );
      }
      throw new AIProviderError(
        `Failed to reach Ollama Cloud API or read response for ${model}: ${err instanceof Error ? err.message : String(err)}`,
        "PROVIDER_UNAVAILABLE",
        503,
        err,
      );
    }

    interface OllamaChatResponse {
      model?: string;
      message?: {
        content?: string;
      };
      prompt_eval_count?: number;
      eval_count?: number;
    }

    let json: OllamaChatResponse | null = null;
    try {
      json = JSON.parse(rawResponseBody) as OllamaChatResponse;
    } catch {
      throw new AIProviderError(
        `Failed to parse Ollama Cloud response as JSON for ${model}: ${rawResponseBody.slice(0, 300)}`,
        "GENERATION_FAILED",
        502,
        rawResponseBody,
      );
    }

    const rawText = json?.message?.content?.trim() || "";
    if (!rawText) {
      throw new AIProviderError(
        `Ollama Cloud returned an empty generation response for ${model}`,
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
        `Failed to parse generated JSON from Ollama Cloud for ${model}: ${err instanceof Error ? err.message : String(err)}`,
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
        `Ollama Cloud output did not match expected { cards: [...] } structure for ${model}`,
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
      rawText,
      usage:
        json.prompt_eval_count !== undefined || json.eval_count !== undefined
          ? {
              promptTokens: json.prompt_eval_count,
              completionTokens: json.eval_count,
              totalTokens:
                (json.prompt_eval_count || 0) + (json.eval_count || 0),
              model: json.model || model,
            }
          : undefined,
    };
  }
}

