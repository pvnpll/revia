export interface CardSchedulingState {
  dueAt: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  lastReviewedAt: string | null;
  algorithmVersion: string;
}

export interface CardLessonSummary {
  id: string;
  title: string;
}

export interface Card {
  id: string;
  deckId: string;
  lessonId: string | null;
  front: string;
  back: string;
  pronunciation: string | null;
  exampleSentence: string | null;
  notes: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CardWithScheduling extends Card {
  lesson: CardLessonSummary | null;
  schedulingState: CardSchedulingState | null;
}
