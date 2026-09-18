import {
  AIProvider,
  AIProviderError,
  ProviderGenerateCardsRequest,
  ProviderGenerateCardsResult,
} from "./ai-provider";

export interface GeminiProviderOptions {
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
}

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private readonly apiKey: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(options: GeminiProviderOptions = {}) {
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AIProviderError(
        "GEMINI_API_KEY is not configured",
        "PROVIDER_AUTH_FAILED",
        502,
      );
    }
    this.apiKey = apiKey;
    this.model = options.model || process.env.GEMINI_MODEL || "gemini-3.6-flash";
    this.timeoutMs = options.timeoutMs || 30000;
  }

  async generateCards(
    request: ProviderGenerateCardsRequest,
  ): Promise<ProviderGenerateCardsResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      this.model,
    )}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    const payload = {
      systemInstruction: {
        parts: [{ text: request.systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: request.userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            cards: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  front: { type: "STRING" },
                  back: { type: "STRING" },
                  pronunciation: { type: "STRING" },
                  example: { type: "STRING" },
                  notes: { type: "STRING" },
                },
                required: ["front", "back"],
              },
            },
          },
          required: ["cards"],
        },
      },
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "TimeoutError") {
        throw new AIProviderError("Gemini API request timed out", "TIMEOUT", 504, err);
      }
      throw new AIProviderError(
        `Failed to reach Gemini API: ${err instanceof Error ? err.message : String(err)}`,
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
          "Gemini rate limit exceeded",
          "RATE_LIMITED",
          429,
          errorBody,
        );
      }
      if (response.status === 401 || response.status === 403) {
        throw new AIProviderError(
          "Gemini API key is invalid or unauthorized",
          "PROVIDER_AUTH_FAILED",
          502,
          errorBody,
        );
      }
      if (response.status >= 500) {
        throw new AIProviderError(
          `Gemini service error (${response.status})`,
          "PROVIDER_UNAVAILABLE",
          503,
          errorBody,
        );
      }

      throw new AIProviderError(
        `Gemini API error (${response.status}): ${errorBody}`,
        "GENERATION_FAILED",
        502,
        errorBody,
      );
    }

    let jsonResponse: {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
      };
    };
    let rawText = "";
    try {
      jsonResponse = (await response.json()) as typeof jsonResponse;
      rawText = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    } catch (err) {
      throw new AIProviderError(
        "Failed to read Gemini JSON response",
        "GENERATION_FAILED",
        502,
        err,
      );
    }

    if (!rawText) {
      throw new AIProviderError(
        "Gemini returned an empty generation response",
        "EMPTY_GENERATION",
        502,
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      throw new AIProviderError(
        `Failed to parse generated JSON from Gemini: ${err instanceof Error ? err.message : String(err)}`,
        "GENERATION_FAILED",
        502,
        err,
      );
    }

    const cards = Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" && parsed !== null && "cards" in parsed && Array.isArray((parsed as { cards: unknown }).cards)
        ? (parsed as { cards: unknown[] }).cards
        : null;

    if (!cards) {
      throw new AIProviderError(
        "Gemini response did not contain a valid cards array",
        "GENERATION_FAILED",
        502,
      );
    }

    const usageMetadata = jsonResponse.usageMetadata;

    return {
      cards,
      rawText,
      usage: usageMetadata
        ? {
            promptTokens: usageMetadata.promptTokenCount,
            completionTokens: usageMetadata.candidatesTokenCount,
            totalTokens: usageMetadata.totalTokenCount,
            model: this.model,
          }
        : undefined,
    };
  }
}
