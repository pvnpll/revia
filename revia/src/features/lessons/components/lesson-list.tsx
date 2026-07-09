"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Layers, X } from "lucide-react";

import { useCards } from "@/features/cards/hooks/use-cards";
import { CreateLessonForm } from "@/features/lessons/components/create-lesson-form";
import { DeleteLessonButton } from "@/features/lessons/components/delete-lesson-button";
import { useLessons } from "@/features/lessons/hooks/use-lessons";
import { useSubmitReview } from "@/features/review/hooks/use-review";
import { RATING_LABELS } from "@/lib/constants/rating-labels";
import type { RatingValue } from "@/lib/scheduler";
import type { LessonWithStats } from "@/types/lesson";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ratings: RatingValue[] = [1, 2, 3, 4, 5];

export function LessonList({
  deckId,
  reverseMode = false,
}: {
  deckId: string;
  reverseMode?: boolean;
}) {
  const { data: lessons, isLoading, isError, error } = useLessons(deckId);
  const [activeLesson, setActiveLesson] = useState<LessonWithStats | null>(null);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading lessons...</p>;
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
            No lessons yet. Add one below to organize cards within this deck.
          </p>
        </div>
      ) : (
        <ul className="divide-y rounded-lg border">
          {items.map((lesson) => (
            <li
              key={lesson.id}
              className="group flex items-center justify-between gap-4 px-4 py-3"
            >
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => setActiveLesson(lesson)}
              >
                <p className="font-medium">{lesson.title}</p>
                <p className="text-xs text-muted-foreground">
                  Tap to study {reverseMode ? "back to front" : "front to back"}
                </p>
              </button>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{lesson.cardCount} cards</Badge>
                <DeleteLessonButton
                  deckId={deckId}
                  lessonId={lesson.id}
                  cardCount={lesson.cardCount}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      <CreateLessonForm deckId={deckId} />
      {activeLesson && (
        <LessonCardSession
          deckId={deckId}
          lesson={activeLesson}
          reverseMode={reverseMode}
          onClose={() => setActiveLesson(null)}
        />
      )}
    </div>
  );
}

export function LessonsSection({
  deckId,
  reverseMode = false,
}: {
  deckId: string;
  reverseMode?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lessons</CardTitle>
        <CardDescription>
          Tap a lesson to open its cards full screen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LessonList deckId={deckId} reverseMode={reverseMode} />
      </CardContent>
    </Card>
  );
}

function LessonCardSession({
  deckId,
  lesson,
  reverseMode,
  onClose,
}: {
  deckId: string;
  lesson: LessonWithStats;
  reverseMode: boolean;
  onClose: () => void;
}) {
  const { data: cards = [], isLoading } = useCards(deckId);
  const submitReview = useSubmitReview(deckId);
  const lessonCards = useMemo(
    () => cards.filter((card) => card.lessonId === lesson.id && !card.isSuspended),
    [cards, lesson.id],
  );
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const current = lessonCards[index];

  useEffect(() => {
    setRevealed(false);
    setStartedAt(Date.now());
  }, [current?.id]);

  async function handleRating(rating: RatingValue) {
    if (!current) return;
    await submitReview.mutateAsync({
      cardId: current.id,
      rating,
      durationMs: Date.now() - startedAt,
    });

    if (index + 1 >= lessonCards.length) {
      onClose();
    } else {
      setIndex((value) => value + 1);
    }
  }

  const front = current ? (reverseMode ? current.back : current.front) : "";
  const back = current ? (reverseMode ? current.front : current.back) : "";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="text-center">
          <p className="text-sm font-medium">{lesson.title}</p>
          <p className="text-xs text-muted-foreground">
            {reverseMode ? "Reverse" : "Normal"} · {current ? `${index + 1}/${lessonCards.length}` : "0/0"}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close lesson cards">
          <X className="h-4 w-4" />
        </Button>
      </header>

      <main className="flex flex-1 flex-col overflow-auto p-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading cards...</p>
        ) : !current ? (
          <div className="flex flex-1 items-center justify-center text-center text-muted-foreground">
            No cards in this lesson yet.
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="flex min-h-[55vh] flex-1 flex-col justify-center rounded-3xl border bg-card p-6 text-left shadow-sm"
            >
              <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {revealed ? "Back" : "Front"}
              </p>
              <p className="whitespace-pre-wrap text-3xl font-semibold leading-snug">
                {revealed ? back : front}
              </p>
              {!revealed && (
                <span className="mt-8 rounded-full bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground">
                  Tap anywhere or reveal answer
                </span>
              )}
            </button>

            {!revealed ? (
              <Button size="lg" className="mt-4 h-14 text-base" onClick={() => setRevealed(true)}>
                Reveal Answer
              </Button>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  {ratings.map((rating) => (
                    <Button
                      key={rating}
                      variant={rating <= 2 ? "secondary" : "default"}
                      className="h-14 text-xl font-bold"
                      disabled={submitReview.isPending}
                      onClick={() => handleRating(rating)}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] text-muted-foreground">
                  {ratings.map((rating) => (
                    <span key={rating}>{RATING_LABELS[rating]}</span>
                  ))}
                </div>
                {(current.pronunciation || current.exampleSentence || current.notes) && (
                  <div className="space-y-2 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                    {current.pronunciation && <p>Pronunciation: {current.pronunciation}</p>}
                    {current.exampleSentence && <p>Example: {current.exampleSentence}</p>}
                    {current.notes && <p>Notes: {current.notes}</p>}
                  </div>
                )}
                {submitReview.isError && (
                  <p className="text-sm text-destructive">
                    {submitReview.error instanceof Error
                      ? submitReview.error.message
                      : "Failed to submit rating"}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
