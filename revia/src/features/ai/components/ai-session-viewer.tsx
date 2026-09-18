"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, BookPlus, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StudyCardViewer } from "@/features/study/components/study-card-viewer";
import { StudyCardItem } from "@/features/study/types";
import { RatingValue } from "@/lib/scheduler";
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
      id: `ai-card-${idx}-${card.front}`,
      front: card.front,
      back: card.back,
      pronunciation: card.pronunciation,
      exampleSentence: card.example,
      notes: card.notes,
      lessonTitle: session.topic,
    }));
  }, [session.cards, session.topic]);

  function handleRate(rating: RatingValue) {
    const currentCard = session.cards[session.currentIndex];
    if (!currentCard) return;

    onUpdateSession((prev) => {
      const known = new Set(prev.context.known || []);
      const struggled = new Set(prev.context.struggled || []);
      const recentlySeen = new Set(prev.context.recentlySeen || []);

      // Track recently seen
      recentlySeen.add(currentCard.front);

      // Rating 1 (Forgot) or 2 (Hard) -> struggled
      if (rating <= 2) {
        struggled.add(currentCard.front);
        known.delete(currentCard.front);
      } else if (rating >= 4) {
        // Rating 4 (Good) or 5 (Perfect) -> known
        known.add(currentCard.front);
        struggled.delete(currentCard.front);
      }

      const nextIndex = (prev.currentIndex + 1) % prev.cards.length;

      return {
        ...prev,
        currentIndex: nextIndex,
        context: {
          ...prev.context,
          known: Array.from(known),
          struggled: Array.from(struggled),
          recentlySeen: Array.from(recentlySeen),
        },
      };
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Action Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-card/50 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            New Goal
          </Button>
          <span className="text-xs font-semibold text-primary">
            Level: {session.level}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveModal(true)}
            className="gap-1.5 text-xs"
            disabled={deckSaved}
          >
            <BookPlus className="h-4 w-4" />
            {deckSaved ? "Saved to Library" : "Save Deck"}
          </Button>

          <Button
            size="sm"
            onClick={onRequestNextBatch}
            disabled={isGeneratingNextBatch}
            className="gap-1.5 text-xs font-semibold"
          >
            {isGeneratingNextBatch ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Next Batch
              </>
            )}
          </Button>
        </div>
      </div>

      {nextBatchError && (
        <div className="bg-destructive/10 px-4 py-2 text-center text-xs text-destructive border-b border-destructive/20">
          Failed to load next batch: {nextBatchError.message}
        </div>
      )}

      {/* Main Interactive Card Viewer */}
      <div className="flex-1">
        <StudyCardViewer
          cards={studyCards}
          currentIndex={session.currentIndex}
          title={session.topic}
          subtitle={`AI Batch • ${session.cards.length} cards`}
          mode="practice"
          navigationMode="ratings"
          fullscreen={false}
          onIndexChange={(index) =>
            onUpdateSession((prev) => ({ ...prev, currentIndex: index }))
          }
          onRate={handleRate}
          onClose={onReset}
        />
      </div>

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
