"use client";

import { useEffect, useMemo, useState } from "react";

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
  queue: string[],
  cardMap: Map<string, CardWithScheduling>,
  reverseMode: boolean,
): StudyCardItem[] {
  return queue
    .map((cardId) => cardMap.get(cardId))
    .filter((card): card is CardWithScheduling => card !== undefined)
    .map((card) => toPracticeStudyCard(card, reverseMode));
}

// buildStudyCards used for read-only lesson browse.

export function PracticeSession({
  title,
  deckId,
  lessonId,
  initialCards,
  reverseMode = false,
  readOnly = false,
  onClose,
}: PracticeSessionProps) {
  const shouldFetch = !initialCards;
  const {
    data: fetchedCards,
    isLoading,
    isError,
    error,
    isFetched,
  } = usePracticeCards({ deckId, lessonId }, shouldFetch);
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
  const [reviewedCount, setReviewedCount] = useState(0);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (shouldFetch && !isFetched) {
      return;
    }

    if (!cardIdsKey) {
      setQueue([]);
      setCurrentIndex(0);
      setInitialized(true);
      return;
    }

    setQueue(PracticeScheduler.createInitialQueue(cardIdsKey.split(",")));
    setCurrentIndex(0);
    setReviewedCount(0);
    setInitialized(true);
  }, [cardIdsKey, shouldFetch, isFetched]);

  const studyCards = useMemo(() => {
    if (readOnly) {
      return buildStudyCards(queue, cardMap, reverseMode);
    }
    const cardId = queue[currentIndex];
    if (!cardId) {
      return [];
    }
    const card = cardMap.get(cardId);
    return card ? [toPracticeStudyCard(card, reverseMode)] : [];
  }, [readOnly, queue, currentIndex, cardMap, reverseMode]);

  const viewerIndex = readOnly ? currentIndex : 0;

  function handleRating(rating: RatingValue) {
    if (readOnly || queue.length === 0) {
      return;
    }

    setReviewedCount((count) => count + 1);
    const { queue: nextQueue, nextIndex } = PracticeScheduler.applyRating(
      queue,
      currentIndex,
      rating,
    );
    setQueue(nextQueue);
    setCurrentIndex(nextIndex);
  }

  if (shouldFetch && isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading cards...</p>
      </div>
    );
  }

  if (shouldFetch && isError) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-destructive">
          {error instanceof Error ? error.message : "Failed to load practice cards"}
        </p>
        <Button variant="ghost" onClick={onClose}>
          Go back
        </Button>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Preparing session...</p>
      </div>
    );
  }

  if (studyCards.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-muted-foreground">No cards available to practice yet.</p>
        <Button variant="ghost" onClick={onClose}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <StudyCardViewer
      cards={studyCards}
      currentIndex={viewerIndex}
      title={title}
      subtitle={
        readOnly
          ? `${currentIndex + 1} of ${queue.length}`
          : `${reviewedCount + 1} reviewed · endless`
      }
      onIndexChange={readOnly ? setCurrentIndex : () => undefined}
      onRate={handleRating}
      onClose={onClose}
      fullscreen
      allowFreeNavigation={readOnly}
      readOnly={readOnly}
    />
  );
}
