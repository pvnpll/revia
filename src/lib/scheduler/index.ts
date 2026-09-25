import { SimpleIntervalAlgorithm } from "./algorithms/simple-interval";
import { SchedulingEngine } from "./engine";

export * from "./types";
export { SchedulingEngine } from "./engine";
export { SimpleIntervalAlgorithm } from "./algorithms/simple-interval";
export { PracticeScheduler, PRACTICE_GAP_RANGES, practiceGapForRating } from "./practice-scheduler";
export { DailyReviewScheduler } from "./daily-review-scheduler";

const algorithm = new SimpleIntervalAlgorithm();
export const schedulingEngine = new SchedulingEngine(algorithm);
