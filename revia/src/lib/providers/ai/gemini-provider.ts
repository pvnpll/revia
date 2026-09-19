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
    this.timeoutMs = options.timeoutMs || 25000;
  }

  async generateCards(
    request: ProviderGenerateCardsRequest,
  ): Promise<ProviderGenerateCardsResult> {
    // Attempt with the new Interactions API first (standard for Gemini 3.x models)
    try {
      return await this.callInteractionsApi(request);
    } catch (err) {
      // If Interactions API is not available or rejected with 404, fallback to generateContent
      if (err instanceof AIProviderError && err.status === 404) {
        return await this.callGenerateContentApi(request);
      }
      throw err;
    }
  }

  private async callInteractionsApi(
    request: ProviderGenerateCardsRequest,
  ): Promise<ProviderGenerateCardsResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${encodeURIComponent(
      this.apiKey,
    )}`;

    const payload = {
      model: this.model,
      input: request.userPrompt,
      system_instruction: request.systemPrompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: {
          type: "object",
          properties: {
            cards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  front: { type: "string" },
                  back: { type: "string" },
                  pronunciation: { type: "string" },
                  example: { type: "string" },
                  notes: { type: "string" },
                },
                required: ["front", "back"],
              },
            },
          },
          required: ["cards"],
        },
      },
    };

    const response = await this.postJson(url, payload);
    const json = await response.json();

    // Extract text from standard Interactions response shapes
    let rawText = "";
    if (typeof json.output_text === "string") {
      rawText = json.output_text;
    } else if (Array.isArray(json.steps)) {
      for (const step of json.steps) {
        if (Array.isArray(step.content)) {
          for (const part of step.content) {
            if (part.type === "text" && typeof part.text === "string") {
              rawText += part.text;
            }
          }
        }
      }
    } else if (Array.isArray(json.outputs) && json.outputs.length > 0) {
      const last = json.outputs[json.outputs.length - 1];
      if (typeof last.text === "string") {
        rawText = last.text;
      }
    }

    if (!rawText) {
      throw new AIProviderError(
        "Gemini Interactions API returned empty text",
        "EMPTY_GENERATION",
        502,
        json,
      );
    }

    const cards = this.parseCardsJson(rawText);
    const usage = json.usage;

    return {
      cards,
      rawText,
      usage: usage
        ? {
            promptTokens: usage.total_input_tokens,
            completionTokens: usage.total_output_tokens,
            totalTokens: usage.total_tokens,
            model: this.model,
          }
        : undefined,
    };
  }

  private async callGenerateContentApi(
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

    const response = await this.postJson(url, payload);
    const json = await response.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!rawText) {
      throw new AIProviderError(
        "Gemini generateContent returned empty text",
        "EMPTY_GENERATION",
        502,
        json,
      );
    }

    const cards = this.parseCardsJson(rawText);
    const usageMetadata = json.usageMetadata;

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

  private async postJson(url: string, payload: unknown): Promise<Response> {
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
          `Gemini rate limit exceeded (429): ${errorBody}`,
          "RATE_LIMITED",
          429,
          errorBody,
        );
      }
      if (response.status === 401 || response.status === 403) {
        throw new AIProviderError(
          `Gemini API key is invalid or unauthorized (${response.status}): ${errorBody}`,
          "PROVIDER_AUTH_FAILED",
          502,
          errorBody,
        );
      }
      if (response.status === 404) {
        throw new AIProviderError(
          `Gemini endpoint/model not found (404): ${errorBody}`,
          "PROVIDER_UNAVAILABLE",
          404,
          errorBody,
        );
      }
      if (response.status >= 500) {
        throw new AIProviderError(
          `Gemini service error (${response.status}): ${errorBody || "Service temporarily unavailable"}`,
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

    return response;
  }

  private parseCardsJson(rawText: string): unknown[] {
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
      : typeof parsed === "object" &&
          parsed !== null &&
          "cards" in parsed &&
          Array.isArray((parsed as { cards: unknown }).cards)
        ? (parsed as { cards: unknown[] }).cards
        : null;

    if (!cards) {
      throw new AIProviderError(
        "Gemini response did not contain a valid cards array",
        "GENERATION_FAILED",
        502,
      );
    }

    return cards;
  }
}
