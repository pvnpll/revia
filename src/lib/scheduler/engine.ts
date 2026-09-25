import type {
  CardSchedulingState,
  ScheduleResult,
  SchedulingAlgorithm,
  SchedulingInput,
} from "./types";

export class SchedulingEngine {
  constructor(private readonly algorithm: SchedulingAlgorithm) {}

  submitReview(input: SchedulingInput): ScheduleResult {
    return this.algorithm.calculateNext(input);
  }

  createInitialState(cardId: string, now: Date): CardSchedulingState {
    const initial = this.algorithm.initialSchedule(now);
    return {
      cardId,
      dueAt: initial.dueAt,
      intervalDays: initial.intervalDays,
      easeFactor: initial.easeFactor,
      repetitions: initial.repetitions,
      lapses: initial.lapses,
      lastReviewedAt: null,
      algorithmVersion: initial.algorithmVersion,
      algorithmState: initial.algorithmState,
    };
  }
}
