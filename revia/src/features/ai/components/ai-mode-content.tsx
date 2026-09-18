"use client";

import { useState } from "react";

import { useAIGenerate } from "../hooks/use-ai-generate";
import { AISessionState, GenerateCardsApiParams } from "../types/ai-session";
import { AIGeneratorForm } from "./ai-generator-form";
import { AISessionViewer } from "./ai-session-viewer";

export function AIModeContent() {
  const [session, setSession] = useState<AISessionState | null>(null);
  const generateMutation = useAIGenerate();

  function handleInitialGenerate(params: GenerateCardsApiParams) {
    generateMutation.mutate(params, {
      onSuccess: (data) => {
        setSession({
          goal: params.goal,
          topic: params.topic,
          level: params.level,
          batchSize: params.batchSize || 10,
          provider: params.provider,
          cards: data.cards,
          context: params.context || {
            known: [],
            struggled: [],
            recentlySeen: [],
            preferences: {
              romanization: true,
              examples: true,
            },
          },
          currentIndex: 0,
        });
      },
    });
  }

  function handleNextBatch() {
    if (!session) return;

    generateMutation.mutate(
      {
        goal: session.goal,
        topic: session.topic,
        level: session.level,
        batchSize: session.batchSize,
        provider: session.provider,
        context: session.context,
      },
      {
        onSuccess: (data) => {
          setSession((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              cards: data.cards,
              currentIndex: 0,
            };
          });
        },
      },
    );
  }

  if (session && session.cards.length > 0) {
    return (
      <AISessionViewer
        session={session}
        onUpdateSession={(updater) => setSession((prev) => (prev ? updater(prev) : null))}
        onRequestNextBatch={handleNextBatch}
        onReset={() => setSession(null)}
        isGeneratingNextBatch={generateMutation.isPending}
        nextBatchError={generateMutation.error}
      />
    );
  }

  return (
    <div className="container max-w-lg py-6 px-4 pb-24">
      <AIGeneratorForm
        onGenerate={handleInitialGenerate}
        isLoading={generateMutation.isPending}
        error={generateMutation.error}
      />
    </div>
  );
}
