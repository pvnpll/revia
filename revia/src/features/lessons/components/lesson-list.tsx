"use client";

import { useState } from "react";
import { Layers } from "lucide-react";

import { useLessons } from "@/features/lessons/hooks/use-lessons";
import { CreateLessonForm } from "@/features/lessons/components/create-lesson-form";
import { DeleteLessonButton } from "@/features/lessons/components/delete-lesson-button";
import { PracticeSession } from "@/features/practice/components/practice-session";
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
                  {readOnly ? "Browse" : "Practice"} {lesson.cardCount} cards
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
        <PracticeSession
          title={activeSession.lesson.title}
          deckId={deckId}
          lessonId={activeSession.lesson.id}
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
            : "Tap a lesson to start an endless practice session."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LessonList deckId={deckId} readOnly={readOnly} />
      </CardContent>
    </Card>
  );
}
