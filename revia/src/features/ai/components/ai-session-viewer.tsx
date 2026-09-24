"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { BookPlus, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StudyCardViewer } from "@/features/study/components/study-card-viewer";
import { StudyCardItem } from "@/features/study/types";
import { RatingValue } from "@/lib/scheduler";
import { useUpdateAIContext } from "../hooks/use-ai-context";
import { AISessionState } from "../types/ai-session";
import { SaveDeckModal } from "./save-deck-modal";

function AISessionOverlay({ children }: { children: React.ReactNode }) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setPortalTarget(document.body);
  }, []);

  if (portalTarget) {
    return createPortal(children, portalTarget);
  }

  return <>{children}</>;
}

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

  function handleSwipeMove(index: number) {
    // Swipe navigation moves within the batch without rating — the viewer
    // clamps to the batch bounds (noLoop), so nothing extra is needed here.
    onUpdateSession((prev) => ({ ...prev, currentIndex: index }));
  }

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
    <AISessionOverlay>
      <StudyCardViewer
        cards={studyCards}
        currentIndex={session.currentIndex}
        title={session.topic}
        subtitle={`${progress} · ${session.level} · ai`}
        mode="practice"
        navigationMode="swipe"
        fullscreen
        noLoop
        allowFreeNavigation
        onIndexChange={handleSwipeMove}
        onRate={handleRate}
        onClose={onReset}
        banner={
          <>
            <div className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-4 py-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveModal(true)}
                className="h-8 flex-1 gap-1.5 text-xs"
                disabled={deckSaved}
              >
                <BookPlus className="h-3.5 w-3.5" aria-hidden />
                {deckSaved ? "Saved" : "Save deck"}
              </Button>
              <Button
                size="sm"
                onClick={onRequestNextBatch}
                disabled={isGeneratingNextBatch}
                className="h-8 flex-1 gap-1.5 text-xs font-semibold"
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
            </div>
            {nextBatchError ? (
              <div
                role="alert"
                className="shrink-0 border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-center text-xs text-destructive"
              >
                Failed to load next batch: {nextBatchError.message}
              </div>
            ) : null}
          </>
        }
      />

      {showSaveModal && (
        <SaveDeckModal
          topic={session.topic}
          cards={session.cards}
          onClose={() => setShowSaveModal(false)}
          onSaved={() => setDeckSaved(true)}
        />
      )}
    </AISessionOverlay>
  );
}
