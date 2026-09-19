import { fetchJson } from "@/lib/utils/fetch-json";
import { GenerateCardsApiParams } from "../types/ai-session";
import { GeneratedCard, LearnerContext } from "@/lib/validators/ai";
import { ApiError } from "@/types/api";

export interface StreamGenerateResult {
  cards: GeneratedCard[];
  meta: {
    provider: string;
    model: string;
    batchSize: number;
    generatedAt: string;
    duplicatesFiltered?: number;
  };
  context: LearnerContext;
}

export const aiApi = {
  /**
   * Streams card generation via SSE. Calls onCard for each card as it arrives.
   * Returns the full result once the stream completes.
   */
  async generateCardsStream(
    params: GenerateCardsApiParams,
    onCard: (card: GeneratedCard) => void,
    signal?: AbortSignal,
  ): Promise<StreamGenerateResult> {
    const response = await fetch("/api/v1/generate/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      signal,
    });

    // Non-streaming error responses (rate limit, validation) come as JSON
    if (!response.ok) {
      let errorData: { error?: { code?: string; message?: string } } = {};
      try {
        errorData = await response.json();
      } catch {
        // ignore
      }
      throw new ApiError(
        response.status,
        (errorData.error?.code as "INTERNAL") || "INTERNAL",
        errorData.error?.message || `Server error: ${response.statusText}`,
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new ApiError(500, "INTERNAL", "No response body");
    }

    const decoder = new TextDecoder();
    const cards: GeneratedCard[] = [];
    let meta: StreamGenerateResult["meta"] | null = null;
    let context: LearnerContext | null = null;
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last potentially incomplete line in the buffer
        buffer = lines.pop() || "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ") && currentEvent) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);

              if (currentEvent === "card") {
                cards.push(parsed as GeneratedCard);
                onCard(parsed as GeneratedCard);
              } else if (currentEvent === "done") {
                meta = parsed.meta;
                context = parsed.context;
              } else if (currentEvent === "error") {
                throw new ApiError(
                  502,
                  (parsed.code as "INTERNAL") || "INTERNAL",
                  parsed.message || "Card generation failed",
                );
              }
            } catch (err) {
              if (err instanceof ApiError) throw err;
              // Skip malformed SSE data lines
            }
            currentEvent = "";
          } else if (line.trim() === "") {
            currentEvent = "";
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (cards.length === 0 && !meta) {
      throw new ApiError(502, "INTERNAL", "No cards received from stream");
    }

    return {
      cards,
      meta: meta || {
        provider: "unknown",
        model: "unknown",
        batchSize: cards.length,
        generatedAt: new Date().toISOString(),
      },
      context: context || { known: [], struggled: [], recentlySeen: [], preferences: { romanization: false, examples: false } },
    };
  },

  getContext(topic: string): Promise<LearnerContext> {
    return fetchJson<LearnerContext>(`/api/v1/generate/context?topic=${encodeURIComponent(topic)}`);
  },

  updateContext(topic: string, updates: Partial<LearnerContext>): Promise<LearnerContext> {
    return fetchJson<LearnerContext>("/api/v1/generate/context", {
      method: "PUT",
      body: JSON.stringify({ topic, updates }),
    });
  },
};
