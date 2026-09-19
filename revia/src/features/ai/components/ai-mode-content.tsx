"use client";

import { useCallback, useEffect, useState } from "react";

import { useAIGenerate } from "../hooks/use-ai-generate";
import { AISessionState, GenerateCardsApiParams } from "../types/ai-session";
import { AIGeneratorForm } from "./ai-generator-form";
import { AISessionViewer } from "./ai-session-viewer";

export function AIModeContent() {
  const [session, setSession] = useState<AISessionState | null>(null);
  const ai = useAIGenerate();

  const hasSession = Boolean(session);

  // Sync streamed cards into session state
  useEffect(() => {
    if (!hasSession) return;
    if (ai.cards.length === 0) return;

    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        cards: ai.cards,
        context: ai.context ?? prev.context,
      };
    });
  }, [ai.cards, ai.context, hasSession]);

  function handleInitialGenerate(params: GenerateCardsApiParams) {
    const newSession: AISessionState = {
      goal: params.goal,
      topic: params.topic,
      level: params.level,
      batchSize: params.batchSize || 10,
      provider: params.provider,
      cards: [],
      context: params.context || { known: [], struggled: [], recentlySeen: [], preferences: { romanization: false, examples: false } },
      currentIndex: 0,
    };
    setSession(newSession);
    ai.generate(params);
  }

  const handleNextBatch = useCallback(() => {
    if (!session || ai.isStreaming) return;

    ai.generate(
      {
        goal: session.goal,
        topic: session.topic,
        level: session.level,
        batchSize: session.batchSize,
        provider: session.provider,
        context: session.context,
      },
      true, // appendMode — accumulate on top of existing cards
    );
  }, [session, ai]);

  // Background prefetch when getting close to the end of the current queue
  useEffect(() => {
    if (!session || ai.isStreaming) return;

    const cardsRemaining = session.cards.length - 1 - session.currentIndex;
    if (cardsRemaining <= 4 && cardsRemaining >= 0) {
      handleNextBatch();
    }
  }, [session, ai.isStreaming, handleNextBatch]);

  if (session && session.cards.length > 0) {
    return (
      <AISessionViewer
        session={session}
        onUpdateSession={(updater) => setSession((prev) => (prev ? updater(prev) : null))}
        onRequestNextBatch={handleNextBatch}
        onReset={() => {
          setSession(null);
          ai.reset();
        }}
        isGeneratingNextBatch={ai.isStreaming}
        nextBatchError={ai.error}
      />
    );
  }

  return (
    <div className="container max-w-lg py-6 px-4 pb-24">
      <AIGeneratorForm
        onGenerate={handleInitialGenerate}
        isLoading={ai.isStreaming}
        error={ai.error}
      />
    </div>
  );
}
