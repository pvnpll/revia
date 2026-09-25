import type { RatingValue, ScheduleResult, SchedulingAlgorithm, SchedulingInput } from "../types";
import { RATING } from "../types";

const MINIMUM_INTERVAL_DAYS = 1;
const MAXIMUM_INTERVAL_DAYS = 365;
const INITIAL_EASE_FACTOR = 2.5;
const MINIMUM_EASE_FACTOR = 1.3;

const EASE_DELTA: Record<RatingValue, number> = {
  [RATING.FORGOT]: -0.3,
  [RATING.HARD]: -0.15,
  [RATING.OKAY]: 0,
  [RATING.GOOD]: 0.05,
  [RATING.PERFECT]: 0.1,
};

const INTERVAL_MULTIPLIER: Record<RatingValue, number> = {
  [RATING.FORGOT]: 0,
  [RATING.HARD]: 0.6,
  [RATING.OKAY]: 1.0,
  [RATING.GOOD]: 1.3,
  [RATING.PERFECT]: 1.8,
};

const LEARNING_STEPS: Record<RatingValue, number> = {
  [RATING.FORGOT]: 1,
  [RATING.HARD]: 1,
  [RATING.OKAY]: 1,
  [RATING.GOOD]: 3,
  [RATING.PERFECT]: 4,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export class SimpleIntervalAlgorithm implements SchedulingAlgorithm {
  readonly version = "simple-v1";

  initialSchedule(now: Date): ScheduleResult {
    return {
      dueAt: now,
      intervalDays: 0,
      easeFactor: INITIAL_EASE_FACTOR,
      repetitions: 0,
      lapses: 0,
      algorithmVersion: this.version,
      algorithmState: null,
    };
  }

  calculateNext(input: SchedulingInput): ScheduleResult {
    const { state, rating, now } = input;

    const easeFactor = clamp(
      state.easeFactor + EASE_DELTA[rating],
      MINIMUM_EASE_FACTOR,
      INITIAL_EASE_FACTOR + 1,
    );

    let intervalDays: number;
    let repetitions: number;
    let lapses = state.lapses;

    if (rating === RATING.FORGOT) {
      intervalDays = MINIMUM_INTERVAL_DAYS;
      repetitions = 0;
      lapses += 1;
    } else if (state.repetitions === 0) {
      intervalDays = LEARNING_STEPS[rating];
      repetitions = 1;
    } else {
      intervalDays = Math.round(
        state.intervalDays * INTERVAL_MULTIPLIER[rating] * (easeFactor / INITIAL_EASE_FACTOR),
      );
      intervalDays = clamp(intervalDays, MINIMUM_INTERVAL_DAYS, MAXIMUM_INTERVAL_DAYS);
      repetitions = state.repetitions + 1;
    }

    return {
      dueAt: addDays(now, intervalDays),
      intervalDays,
      easeFactor,
      repetitions,
      lapses,
      algorithmVersion: this.version,
      algorithmState: null,
    };
  }
}
