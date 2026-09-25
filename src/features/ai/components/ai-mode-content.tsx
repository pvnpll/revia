"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAIGenerate } from "../hooks/use-ai-generate";
import { AISessionState, GenerateCardsApiParams } from "../types/ai-session";
import { AIGeneratorForm } from "./ai-generator-form";
import { AISessionViewer } from "./ai-session-viewer";

export function AIModeContent({ isGuest = false }: { isGuest?: boolean }) {
  const [session, setSession] = useState<AISessionState | null>(null);
  const ai = useAIGenerate();
  // Tracks the total card count for which a next-batch request has already been issued.
  // Prevents consecutive duplicate calls: next request is only allowed once cards.length grows.
  const lastPrefetchIndexRef = useRef(-1);

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
        lastModel: ai.meta?.model ?? prev.lastModel,
      };
    });
  }, [ai.cards, ai.context, ai.meta, hasSession]);

  function handleInitialGenerate(params: GenerateCardsApiParams) {
    lastPrefetchIndexRef.current = -1;
    const newSession: AISessionState = {
      goal: params.goal,
      topic: params.topic,
      subjectKey: params.subjectKey || params.topic,
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
        subjectKey: session.subjectKey,
        level: session.level,
        batchSize: 5, // Generate 5 cards at a time to optimize TTFT latency vs throughput
        provider: session.provider,
        context: session.context,
      },
      true, // appendMode — accumulate on top of existing cards
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.goal, session?.topic, session?.subjectKey, session?.level, session?.batchSize, session?.provider, session?.context, ai.isStreaming, ai.generate]);

  // Background prefetch: triggers when user has started studying (currentIndex > 0)
  // and reaches ≤6 remaining cards. Only fires once per index to prevent duplicate fetches.
  useEffect(() => {
    if (!session || ai.isStreaming) return;
    if (session.currentIndex === 0) return;
    if (session.currentIndex === lastPrefetchIndexRef.current) return;

    const cardsRemaining = session.cards.length - 1 - session.currentIndex;
    if (cardsRemaining <= 6 && cardsRemaining >= 0) {
      lastPrefetchIndexRef.current = session.currentIndex;
      handleNextBatch();
    }
  }, [session, ai.isStreaming, handleNextBatch]);



  function handleStartNewTopic(topic: string) {
    if (!session) return;
    
    // Reset AI state but reuse the session context (subjectKey, preferences, etc.)
    ai.reset();

    handleInitialGenerate({
      goal: session.goal,
      topic: topic,
      subjectKey: session.subjectKey,
      level: session.level,
      batchSize: 10,
      provider: session.provider,
      context: session.context,
    });
  }

  if (session && (session.cards.length > 0 || ai.isStreaming)) {
    // While the first batch is still streaming, show progress instead of
    // dropping back to the form (which looks like a stuck submit).
    if (session.cards.length === 0) {
      return (
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{session.topic}</h1>
            <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
              Generating cards for &ldquo;{session.goal}&rdquo;...
            </p>
          </div>
          <Card aria-busy="true">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
              <p className="text-sm text-muted-foreground">
                Revia AI is drafting your first batch. This can take a few seconds.
              </p>
              <Button variant="ghost" size="sm" onClick={() => {
                setSession(null);
                ai.reset();
              }}>
                Cancel
              </Button>
            </CardContent>
          </Card>
          {ai.error && (
            <div
              role="alert"
              className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <p className="font-semibold">Generation failed</p>
              <p className="mt-1 text-xs">{ai.error.message}</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <AISessionViewer isGuest={isGuest}
        session={session}
        onUpdateSession={(updater) => setSession((prev) => (prev ? updater(prev) : null))}
        onRequestNextBatch={handleNextBatch}
        onReset={() => {
          setSession(null);
          ai.reset();
        }}
        isGeneratingNextBatch={ai.isStreaming}
        nextBatchError={ai.error}
        onStartNewTopic={handleStartNewTopic}
      />
    );
  }

  return (
    <AIGeneratorForm
      onGenerate={handleInitialGenerate}
      isLoading={ai.isStreaming}
      error={ai.error}
    />
  );
}
