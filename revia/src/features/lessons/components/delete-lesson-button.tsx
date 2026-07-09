"use client";

import { Trash2 } from "lucide-react";

import { useDeleteLesson } from "@/features/lessons/hooks/use-lessons";
import { Button } from "@/components/ui/button";

export function DeleteLessonButton({
  deckId,
  lessonId,
  cardCount,
}: {
  deckId: string;
  lessonId: string;
  cardCount: number;
}) {
  const deleteLesson = useDeleteLesson(deckId);

  function handleDelete() {
    const message =
      cardCount > 0
        ? `Delete this lesson? ${cardCount} card(s) will be unassigned but not deleted.`
        : "Delete this lesson?";
    if (!confirm(message)) return;
    deleteLesson.mutate(lessonId);
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={deleteLesson.isPending}
      aria-label="Delete lesson"
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </Button>
  );
}
