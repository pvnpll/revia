"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { PracticeSession } from "@/features/practice/components/practice-session";
import { useDeck } from "@/features/decks/hooks/use-decks";
import { useLessons } from "@/features/lessons/hooks/use-lessons";

export function PracticePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deckId") ?? undefined;
  const lessonId = searchParams.get("lessonId") ?? undefined;
  const reverseMode = searchParams.get("reverse") === "1";

  const { data: deck } = useDeck(deckId ?? "");
  const { data: lessons = [] } = useLessons(deckId ?? "");

  const activeLesson = lessonId ? lessons.find((lesson) => lesson.id === lessonId) : undefined;
  const title = activeLesson?.title ?? deck?.title ?? "Practice";

  return (
    <PracticeSession
      title={title}
      deckId={deckId}
      lessonId={lessonId}
      reverseMode={reverseMode}
      onClose={() => router.push(deckId ? `/decks/${deckId}` : "/dashboard")}
    />
  );
}
