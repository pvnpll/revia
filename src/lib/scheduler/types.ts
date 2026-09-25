export type RatingValue = 1 | 2 | 3 | 4 | 5;

export const RATING = {
  FORGOT: 1,
  HARD: 2,
  OKAY: 3,
  GOOD: 4,
  PERFECT: 5,
} as const satisfies Record<string, RatingValue>;

export interface CardSchedulingState {
  cardId: string;
  dueAt: Date;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  lastReviewedAt: Date | null;
  algorithmVersion: string;
  algorithmState: Record<string, unknown> | null;
}

export interface ReviewRecord {
  rating: RatingValue;
  reviewedAt: Date;
  intervalBefore: number;
  intervalAfter: number;
}

export interface ScheduleResult {
  dueAt: Date;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  algorithmVersion: string;
  algorithmState: Record<string, unknown> | null;
}

export interface SchedulingInput {
  state: CardSchedulingState;
  rating: RatingValue;
  reviewHistory: readonly ReviewRecord[];
  now: Date;
}

export interface SchedulingAlgorithm {
  readonly version: string;
  calculateNext(input: SchedulingInput): ScheduleResult;
  initialSchedule(now: Date): ScheduleResult;
}

export function isNewCard(state: CardSchedulingState): boolean {
  return state.repetitions === 0 && state.lastReviewedAt === null;
}
