export interface StudyCardItem {
  id: string;
  front: string;
  back: string;
  pronunciation?: string | null;
  exampleSentence?: string | null;
  notes?: string | null;
  nuance?: string | null;
  lessonTitle?: string | null;
  reviewCount?: number;
}
