import type { StudyCardItem } from "@/features/study/types";
import type { CardWithScheduling } from "@/types/card";

export function toPracticeStudyCard(
  card: CardWithScheduling,
  reverseMode = false,
): StudyCardItem {
  return {
    id: card.id,
    front: reverseMode ? card.back : card.front,
    back: reverseMode ? card.front : card.back,
    pronunciation: card.pronunciation,
    exampleSentence: card.exampleSentence,
    notes: card.notes,
    lessonTitle: card.lesson?.title ?? null,
  };
}
