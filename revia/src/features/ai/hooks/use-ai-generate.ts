"use client";

import { useCallback, useRef, useState } from "react";
import { aiApi, StreamGenerateResult } from "../services/ai-api";
import { GenerateCardsApiParams } from "../types/ai-session";
import { GeneratedCard, LearnerContext } from "@/lib/validators/ai";

export interface AIGenerateStreamState {
  /** Cards accumulated so far (grows during streaming) */
  cards: GeneratedCard[];
  /** Whether the stream is currently active */
  isStreaming: boolean;
  /** Error from the last generation attempt */
  error: Error | null;
  /** Final metadata from generation (available after stream completes) */
  meta: StreamGenerateResult["meta"] | null;
  /** Final merged context (available after stream completes) */
  context: LearnerContext | null;
  /** Start a new generation. Appends to existing cards if appendMode is true. */
  generate: (params: GenerateCardsApiParams, appendMode?: boolean) => void;
  /** Reset all state */
  reset: () => void;
}

export function useAIGenerate(): AIGenerateStreamState {
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [meta, setMeta] = useState<StreamGenerateResult["meta"] | null>(null);
  const [context, setContext] = useState<LearnerContext | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback((params: GenerateCardsApiParams, appendMode = false) => {
    // Abort any in-flight stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsStreaming(true);
    setError(null);
    setMeta(null);

    if (!appendMode) {
      setCards([]);
      setContext(null);
    }

    aiApi
      .generateCardsStream(
        params,
        (card) => {
          setCards((prev) => [...prev, card]);
        },
        controller.signal,
      )
      .then((result) => {
        setMeta(result.meta);
        setContext(result.context);
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        setIsStreaming(false);
      });
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setCards([]);
    setIsStreaming(false);
    setError(null);
    setMeta(null);
    setContext(null);
  }, []);

  return { cards, isStreaming, error, meta, context, generate, reset };
}
