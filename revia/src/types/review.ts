import type { CardWithScheduling } from "@/types/card";
import type { RatingValue } from "@/lib/scheduler";

export interface DueReviewCard extends CardWithScheduling {
  dueAt: string;
}

export interface ReviewQueue {
  cards: DueReviewCard[];
  totalDue: number;
}

export interface SubmitReviewResult {
  cardId: string;
  rating: RatingValue;
  reviewedAt: string;
  nextDueAt: string;
  intervalBefore: number;
  intervalAfter: number;
  easeBefore: number;
  easeAfter: number;
  repetitions: number;
  lapses: number;
}
