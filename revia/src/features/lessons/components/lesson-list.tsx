"use client";

import Link from "next/link";
import { Layers } from "lucide-react";

import { useLessons, useUpdateLesson } from "@/features/lessons/hooks/use-lessons";
import { CreateLessonForm } from "@/features/lessons/components/create-lesson-form";
import { DeleteLessonButton } from "@/features/lessons/components/delete-lesson-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InlineTitleEditor } from "@/components/ui/inline-title-editor";
import { ListSkeleton } from "@/components/ui/skeleton";

function practiceHref(deckId: string, lessonId: string, reverseMode: boolean) {
  const params = new URLSearchParams({ deckId, lessonId });
  if (reverseMode) {
    params.set("reverse", "1");
  }
  return `/practice?${params.toString()}`;
}

export function LessonList({ deckId, canEdit = false }: { deckId: string; canEdit?: boolean }) {
  const { data: lessons, isLoading, isError, error } = useLessons(deckId);
  const updateLesson = useUpdateLesson(deckId);

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
            {canEdit
              ? "No lessons yet. Add one below to organize cards within this deck."
              : "This deck has no lessons yet."}
          </p>
        </div>
      ) : (
        <ul className="divide-y rounded-2xl border bg-card">
          {items.map((lesson) => (
            <li
              key={lesson.id}
              className="group flex items-center justify-between gap-4 px-4 py-4 transition-colors active:bg-accent"
            >
              <div className="min-w-0 flex-1 space-y-1">
                {canEdit ? (
                  <InlineTitleEditor
                    value={lesson.title}
                    titleClassName="font-semibold"
                    isSaving={updateLesson.isPending}
                    error={
                      updateLesson.isError && updateLesson.error instanceof Error
                        ? updateLesson.error.message
                        : null
                    }
                    onSave={async (title) => {
                      await updateLesson.mutateAsync({ lessonId: lesson.id, input: { title } });
                    }}
                  />
                ) : (
                  <p className="font-semibold">{lesson.title}</p>
                )}
                <Link
                  href={practiceHref(deckId, lesson.id, false)}
                  prefetch
                  className="block text-left text-xs text-muted-foreground hover:text-foreground"
                >
                  Practice {lesson.cardCount} cards · front to back
                </Link>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <Badge variant="secondary">{lesson.cardCount} cards</Badge>
                <Button asChild variant="outline" size="sm">
                  <Link href={practiceHref(deckId, lesson.id, true)} prefetch>
                    Reverse
                  </Link>
                </Button>
                {canEdit && (
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
      {canEdit && <CreateLessonForm deckId={deckId} />}
    </div>
  );
}

export function LessonsSection({
  deckId,
  canEdit = false,
}: {
  deckId: string;
  canEdit?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lessons</CardTitle>
        <CardDescription>
          {canEdit
            ? "Tap a lesson to start an endless practice session."
            : "Tap a lesson to practice with ratings. Session progress is not saved — sign in and add to your library for Daily Review."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LessonList deckId={deckId} canEdit={canEdit} />
      </CardContent>
    </Card>
  );
}
