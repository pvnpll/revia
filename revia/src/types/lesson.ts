export interface Lesson {
  id: string;
  deckId: string;
  title: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface LessonWithStats extends Lesson {
  cardCount: number;
}
