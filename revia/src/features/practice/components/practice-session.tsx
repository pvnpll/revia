"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { usePracticeCards } from "@/features/practice/hooks/use-practice";
import { toPracticeStudyCard } from "@/features/practice/utils/to-practice-study-card";
import { StudyCardViewer } from "@/features/study/components/study-card-viewer";
import type { StudyCardItem } from "@/features/study/types";
import { PracticeScheduler } from "@/lib/scheduler/practice-scheduler";
import type { RatingValue } from "@/lib/scheduler";
import type { CardWithScheduling } from "@/types/card";
import { Button } from "@/components/ui/button";

interface PracticeSessionProps {
  title: string;
  deckId?: string;
  lessonId?: string;
  initialCards?: CardWithScheduling[];
  reverseMode?: boolean;
  readOnly?: boolean;
  onClose: () => void;
}

function buildStudyCards(
  cardIds: string[],
  cardMap: Map<string, CardWithScheduling>,
  reverseMode: boolean,
): StudyCardItem[] {
  return cardIds
    .map((cardId) => cardMap.get(cardId))
    .filter((card): card is CardWithScheduling => card !== undefined)
    .map((card) => toPracticeStudyCard(card, reverseMode));
}

function PracticeOverlay({ children }: { children: React.ReactNode }) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setPortalTarget(document.body);
  }, []);

  if (portalTarget) {
    return createPortal(children, portalTarget);
  }

  return <>{children}</>;
}

export function PracticeSession({
  title,
  deckId,
  lessonId,
  initialCards,
  reverseMode = false,
  readOnly = false,
  onClose,
}: PracticeSessionProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuthSession();
  const isGuestBrowse = !authLoading && !isAuthenticated && !readOnly;
  const shouldFetch = !initialCards;
  const canFetch = shouldFetch && Boolean(deckId || isAuthenticated);
  const {
    data: fetchedCards,
    isLoading,
    isError,
    error,
    isFetched,
  } = usePracticeCards({ deckId, lessonId }, canFetch);
  const sourceCards = initialCards ?? fetchedCards;

  const cardIdsKey =
    initialCards?.map((card) => card.id).join(",") ??
    fetchedCards?.map((card) => card.id).join(",") ??
    "";

  const cardMap = useMemo(() => {
    if (!sourceCards) {
      return new Map<string, CardWithScheduling>();
    }
    return new Map(sourceCards.map((card) => [card.id, card]));
  }, [cardIdsKey, sourceCards]);

  const [queue, setQueue] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [practicedCount, setPracticedCount] = useState(0);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (canFetch && !isFetched) {
      return;
    }

    if (!cardIdsKey) {
      setQueue([]);
      setCurrentIndex(0);
      setInitialized(true);
      return;
    }

    const cardIds = cardIdsKey.split(",");
    setQueue(isGuestBrowse ? cardIds : PracticeScheduler.createInitialQueue(cardIds));
    setCurrentIndex(0);
    setPracticedCount(0);
    setInitialized(true);
  }, [cardIdsKey, canFetch, isFetched, isGuestBrowse]);

  const studyCards = useMemo(() => {
    if (isGuestBrowse || readOnly) {
      return buildStudyCards(queue, cardMap, reverseMode);
    }

    const cardId = queue[currentIndex];
    if (!cardId) {
      return [];
    }
    const card = cardMap.get(cardId);
    return card ? [toPracticeStudyCard(card, reverseMode)] : [];
  }, [isGuestBrowse, readOnly, queue, currentIndex, cardMap, reverseMode]);

  const viewerIndex = isGuestBrowse || readOnly ? currentIndex : 0;

  function handleRating(rating: RatingValue) {
    if (readOnly || isGuestBrowse || queue.length === 0) {
      return;
    }

    setPracticedCount((count) => count + 1);
    const { queue: nextQueue, nextIndex } = PracticeScheduler.applyRating(
      queue,
      currentIndex,
      rating,
    );
    setQueue(nextQueue);
    setCurrentIndex(nextIndex);
  }

  const practiceSubtitle = isGuestBrowse || readOnly
    ? undefined
    : `${practicedCount + 1} practiced · endless session`;

  if (canFetch && isLoading) {
    return (
      <PracticeOverlay>
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
          <p className="text-muted-foreground">Loading cards...</p>
        </div>
      </PracticeOverlay>
    );
  }

  if (canFetch && isError) {
    return (
      <PracticeOverlay>
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Failed to load practice cards"}
          </p>
          <Button variant="ghost" onClick={onClose}>
            Go back
          </Button>
        </div>
      </PracticeOverlay>
    );
  }

  if (!initialized) {
    return (
      <PracticeOverlay>
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
          <p className="text-muted-foreground">Preparing session...</p>
        </div>
      </PracticeOverlay>
    );
  }

  if (studyCards.length === 0) {
    return (
      <PracticeOverlay>
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <p className="text-muted-foreground">No cards available to practice yet.</p>
          <Button variant="ghost" onClick={onClose}>
            Go back
          </Button>
        </div>
      </PracticeOverlay>
    );
  }

  if (authLoading && !readOnly) {
    return (
      <PracticeOverlay>
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
          <p className="text-muted-foreground">Preparing session...</p>
        </div>
      </PracticeOverlay>
    );
  }

  return (
    <PracticeOverlay>
      <StudyCardViewer
        cards={studyCards}
        currentIndex={viewerIndex}
        title={title}
        subtitle={practiceSubtitle}
        mode="practice"
        navigationMode={isGuestBrowse ? "swipe" : "ratings"}
        onIndexChange={setCurrentIndex}
        onRate={handleRating}
        onClose={onClose}
        fullscreen
        allowFreeNavigation={isGuestBrowse || readOnly}
        readOnly={readOnly}
      />
    </PracticeOverlay>
  );
}
