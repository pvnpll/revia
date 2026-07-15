import { SimpleIntervalAlgorithm } from "./algorithms/simple-interval";
import { SchedulingEngine } from "./engine";
import type {
  CardSchedulingState,
  ScheduleResult,
  SchedulingInput,
} from "./types";

const dailyReviewEngine = new SchedulingEngine(new SimpleIntervalAlgorithm());

/**
 * Date-based spaced repetition for Daily Review.
 * Practice sessions must not use this scheduler.
 */
export class DailyReviewScheduler {
  static submitReview(input: SchedulingInput): ScheduleResult {
    return dailyReviewEngine.submitReview(input);
  }

  static createInitialState(cardId: string, now: Date): CardSchedulingState {
    return dailyReviewEngine.createInitialState(cardId, now);
  }
}
