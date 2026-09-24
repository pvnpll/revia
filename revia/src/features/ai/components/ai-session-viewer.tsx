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
      nuance: card.nuance,
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
    updateContextMutation.mutate({ topic: session.subjectKey, updates: fullUpdatedContext });

    // 3. Advance without wrapping, and implement Hybrid Loop Mechanic
    onUpdateSession((prev) => {
      let updatedCards = prev.cards;
      
      // Hybrid Loop Mechanic: If the user struggled (rating 1 or 2), 
      // push the exact card to the end of the active queue for immediate review loop
      if (rating <= 2) {
        updatedCards = [...prev.cards, currentCard];
      }

      const nextIndex = Math.min(prev.currentIndex + 1, Math.max(updatedCards.length - 1, 0));
      return {
        ...prev,
        cards: updatedCards,
        currentIndex: nextIndex,
        context: fullUpdatedContext,
      };
    });
  }

  const progress = `${session.currentIndex + 1} practiced`;
  const displayModel = session.lastModel || "ai";

  const isWaitingForCards = session.currentIndex >= studyCards.length;

  if (isWaitingForCards) {
    return (
      <AISessionOverlay>
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background p-4 text-center">
          {nextBatchError ? (
            <div className="flex max-w-sm flex-col items-center gap-4">
              <div className="rounded-full bg-destructive/10 p-4 text-destructive">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Failed to load more cards</h2>
              <p className="text-sm text-muted-foreground">{nextBatchError.message}</p>
              <div className="mt-4 flex gap-3">
                <Button variant="outline" onClick={onReset}>End Session</Button>
                <Button onClick={onRequestNextBatch}>Try Again</Button>
              </div>
            </div>
          ) : (
            <div className="flex max-w-sm flex-col items-center gap-6">
              <div className="flex items-center justify-center rounded-full bg-primary/10 p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">Generating next batch...</h2>
                <p className="text-sm text-muted-foreground">
                  You're swiping fast! The AI is drafting more cards for you.
                </p>
              </div>
              <Button variant="ghost" onClick={onReset} className="mt-4">
                End Session
              </Button>
            </div>
          )}
        </div>
      </AISessionOverlay>
    );
  }

  return (
    <AISessionOverlay>
      <StudyCardViewer
        cards={studyCards}
        currentIndex={session.currentIndex}
        title={session.topic}
        subtitle={isGeneratingNextBatch ? `generating more... · ${displayModel}` : `${progress} · ${session.level} · ${displayModel}`}
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
            <div className="flex shrink-0 items-center justify-center border-b border-border bg-card px-4 py-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveModal(true)}
                className="h-8 max-w-[200px] flex-1 gap-1.5 text-xs"
                disabled={deckSaved}
              >
                <BookPlus className="h-3.5 w-3.5" aria-hidden />
                {deckSaved ? "Saved" : "Save deck"}
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
