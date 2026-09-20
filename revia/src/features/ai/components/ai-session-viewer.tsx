"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, BookPlus, Loader2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StudyCardViewer } from "@/features/study/components/study-card-viewer";
import { StudyCardItem } from "@/features/study/types";
import { RatingValue } from "@/lib/scheduler";
import { useUpdateAIContext } from "../hooks/use-ai-context";
import { AISessionState } from "../types/ai-session";
import { SaveDeckModal } from "./save-deck-modal";

interface AISessionViewerProps {
  session: AISessionState;
  onUpdateSession: (updater: (prev: AISessionState) => AISessionState) => void;
  onRequestNextBatch: () => void;
  onReset: () => void;
  isGeneratingNextBatch: boolean;
  nextBatchError?: Error | null;
}

export function AISessionViewer({
  session,
  onUpdateSession,
  onRequestNextBatch,
  onReset,
  isGeneratingNextBatch,
  nextBatchError,
}: AISessionViewerProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [deckSaved, setDeckSaved] = useState(false);

  const studyCards: StudyCardItem[] = useMemo(() => {
    return session.cards.map((card, idx) => ({
      id: `ai-card-${session.topic}-${session.level}-${idx}`,
      front: card.front,
      back: card.back,
      pronunciation: card.pronunciation,
      exampleSentence: card.example,
      notes: card.notes,
      lessonTitle: session.topic,
    }));
  }, [session.cards, session.topic, session.level]);

  const updateContextMutation = useUpdateAIContext();

  function handleRate(rating: RatingValue) {
    const currentCard = session.cards[session.currentIndex];
    if (!currentCard) return;

    // 1. Calculate the new full context state locally
    const known = new Set(session.context.known || []);
    const struggled = new Set(session.context.struggled || []);
    const recentlySeen = new Set(session.context.recentlySeen || []);

    recentlySeen.add(currentCard.front);

    if (rating <= 2) {
      struggled.add(currentCard.front);
      known.delete(currentCard.front);
    } else if (rating >= 4) {
      known.add(currentCard.front);
      struggled.delete(currentCard.front);
    }

    const fullUpdatedContext = {
      ...session.context,
      known: Array.from(known),
      struggled: Array.from(struggled),
      recentlySeen: Array.from(recentlySeen),
    };

    // 2. Dispatch asynchronous DB update with the full state
    updateContextMutation.mutate({ topic: session.topic, updates: fullUpdatedContext });

    // 3. Advance without wrapping: last card stays put until the next
    // batch arrives (matches review clamping instead of looping forever).
    onUpdateSession((prev) => {
      const nextIndex = Math.min(prev.currentIndex + 1, Math.max(prev.cards.length - 1, 0));
      return {
        ...prev,
        currentIndex: nextIndex,
        context: fullUpdatedContext,
      };
    });
  }

  const progress = `${Math.min(session.currentIndex + 1, session.cards.length)} / ${session.cards.length}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          New goal
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold tracking-tight">{session.topic}</h1>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{session.goal}</p>
        </div>
      </div>

      <Card className="flex flex-wrap items-center gap-2 px-3 py-2.5">
        <Badge variant="secondary" className="capitalize">
          {session.level}
        </Badge>
        <Badge variant="outline" className="tabular-nums">
          {progress}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {session.cards.length} cards
          {session.provider ? ` · ${session.provider === "gemini" ? "Gemini" : "OpenRouter"}` : ""}
        </span>
        <span className="ms-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveModal(true)}
            className="gap-1.5"
            disabled={deckSaved}
          >
            <BookPlus className="h-4 w-4" aria-hidden />
            {deckSaved ? "Saved" : "Save deck"}
          </Button>

          <Button
            size="sm"
            onClick={onRequestNextBatch}
            disabled={isGeneratingNextBatch}
            className="gap-1.5 font-semibold"
          >
            {isGeneratingNextBatch ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Next batch
              </>
            )}
          </Button>
        </span>
      </Card>

      {nextBatchError && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          Failed to load next batch: {nextBatchError.message}
        </div>
      )}

      <StudyCardViewer
        cards={studyCards}
        currentIndex={session.currentIndex}
        title={session.topic}
        subtitle={`${progress} · AI batch`}
        mode="practice"
        navigationMode="ratings"
        fullscreen={false}
        noLoop
        onIndexChange={(index) =>
          onUpdateSession((prev) => ({ ...prev, currentIndex: index }))
        }
        onRate={handleRate}
        onClose={onReset}
      />

      {showSaveModal && (
        <SaveDeckModal
          topic={session.topic}
          cards={session.cards}
          onClose={() => setShowSaveModal(false)}
          onSaved={() => setDeckSaved(true)}
        />
      )}
    </div>
  );
}
