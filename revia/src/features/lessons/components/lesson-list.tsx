"use client";

import { useEffect, useMemo, useState } from "react";
import { Layers } from "lucide-react";

import { useCards } from "@/features/cards/hooks/use-cards";
import { CreateLessonForm } from "@/features/lessons/components/create-lesson-form";
import { DeleteLessonButton } from "@/features/lessons/components/delete-lesson-button";
import { useLessons } from "@/features/lessons/hooks/use-lessons";
import { useSubmitReview } from "@/features/review/hooks/use-review";
import { StudyCardViewer } from "@/features/study/components/study-card-viewer";
import type { StudyCardItem } from "@/features/study/types";
import type { RatingValue } from "@/lib/scheduler";
import type { CardWithScheduling } from "@/types/card";
import type { LessonWithStats } from "@/types/lesson";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListSkeleton } from "@/components/ui/skeleton";

interface ActiveLessonSession {
  lesson: LessonWithStats;
  reverseMode: boolean;
}

export function LessonList({ deckId, readOnly = false }: { deckId: string; readOnly?: boolean }) {
  const { data: lessons, isLoading, isError, error } = useLessons(deckId);
  const [activeSession, setActiveSession] = useState<ActiveLessonSession | null>(null);

  if (isLoading) {
    return <ListSkeleton rows={3} />;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Failed to load lessons"}
      </p>
    );
  }

  const items = lessons ?? [];

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Layers className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? "This deck has no lessons yet."
              : "No lessons yet. Add one below to organize cards within this deck."}
          </p>
        </div>
      ) : (
        <ul className="divide-y rounded-2xl border bg-card">
          {items.map((lesson) => (
            <li
              key={lesson.id}
              className="group flex items-center justify-between gap-4 px-4 py-4 transition-colors active:bg-accent"
            >
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => setActiveSession({ lesson, reverseMode: false })}
              >
                <p className="font-semibold">{lesson.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {readOnly ? "Browse" : "Swipe through"} {lesson.cardCount} cards
                  {!readOnly && " · front to back"}
                </p>
              </button>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <Badge variant="secondary">{lesson.cardCount} cards</Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveSession({ lesson, reverseMode: true })}
                >
                  Reverse
                </Button>
                {!readOnly && (
                  <DeleteLessonButton
                    deckId={deckId}
                    lessonId={lesson.id}
                    cardCount={lesson.cardCount}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {!readOnly && <CreateLessonForm deckId={deckId} />}
      {activeSession && (
        <LessonCardSession
          deckId={deckId}
          lesson={activeSession.lesson}
          reverseMode={activeSession.reverseMode}
          readOnly={readOnly}
          onClose={() => setActiveSession(null)}
        />
      )}
    </div>
  );
}

export function LessonsSection({
  deckId,
  readOnly = false,
}: {
  deckId: string;
  readOnly?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lessons</CardTitle>
        <CardDescription>
          {readOnly
            ? "Browse lessons and cards in this shared deck."
            : "Tap a lesson to study cards with swipe navigation."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LessonList deckId={deckId} readOnly={readOnly} />
      </CardContent>
    </Card>
  );
}

function toLessonStudyCard(card: CardWithScheduling, reverseMode: boolean): StudyCardItem {
  return {
    id: card.id,
    front: reverseMode ? card.back : card.front,
    back: reverseMode ? card.front : card.back,
    pronunciation: card.pronunciation,
    exampleSentence: card.exampleSentence,
    notes: card.notes,
    reviewCount: card.schedulingState?.repetitions ?? 0,
  };
}

function LessonCardSession({
  deckId,
  lesson,
  reverseMode,
  readOnly,
  onClose,
}: {
  deckId: string;
  lesson: LessonWithStats;
  reverseMode: boolean;
  readOnly: boolean;
  onClose: () => void;
}) {
  const { data: cards = [], isLoading } = useCards(deckId, { lessonId: lesson.id });
  const submitReview = useSubmitReview(deckId);
  const studyCards = useMemo(
    () => cards.map((card) => toLessonStudyCard(card, reverseMode)),
    [cards, reverseMode],
  );
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const current = cards[index];

  useEffect(() => {
    setStartedAt(Date.now());
  }, [current?.id]);

  function handleRating(rating: RatingValue) {
    if (!current || readOnly) return;

    const cardId = current.id;
    const durationMs = Date.now() - startedAt;
    const isLast = index + 1 >= cards.length;

    if (isLast) {
      submitReview.mutate(
        { cardId, rating, durationMs },
        {
          onSettled: () => {
            onClose();
          },
        },
      );
      return;
    }

    setIndex((value) => value + 1);
    submitReview.mutate({ cardId, rating, durationMs });
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading cards...</p>
      </div>
    );
  }

  if (studyCards.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-muted-foreground">No cards in this lesson yet.</p>
        <Button variant="ghost" onClick={onClose}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <StudyCardViewer
      cards={studyCards}
      currentIndex={index}
      title={lesson.title}
      subtitle={`${reverseMode ? "Reverse" : "Normal"} · ${index + 1} of ${studyCards.length}`}
      onIndexChange={setIndex}
      onRate={handleRating}
      onClose={onClose}
      fullscreen
      allowFreeNavigation
      readOnly={readOnly}
      errorMessage={
        submitReview.isError
          ? submitReview.error instanceof Error
            ? submitReview.error.message
            : "Failed to submit rating"
          : null
      }
    />
  );
}
