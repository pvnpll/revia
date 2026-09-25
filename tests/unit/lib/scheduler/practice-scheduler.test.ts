import {
  PracticeScheduler,
  PRACTICE_GAP_RANGES,
  practiceGapForRating,
} from "@/lib/scheduler/practice-scheduler";
import { RATING } from "@/lib/scheduler/types";

describe("PracticeScheduler", () => {
  const cardIds = ["a", "b", "c", "d", "e", "f"];

  it("creates a shuffled queue containing every card once", () => {
    const queue = PracticeScheduler.createInitialQueue(cardIds, () => 0.5);
    expect(queue).toHaveLength(cardIds.length);
    expect(new Set(queue)).toEqual(new Set(cardIds));
  });

  it("returns empty queue for no cards", () => {
    expect(PracticeScheduler.createInitialQueue([])).toEqual([]);
  });

  it("reinserts a forgotten card after a short gap", () => {
    const queue = ["a", "b", "c", "d", "e"];
    const { queue: nextQueue, nextIndex } = PracticeScheduler.applyRating(
      queue,
      0,
      RATING.FORGOT,
      () => 0,
    );

    expect(nextIndex).toBe(0);
    expect(nextQueue[0]).toBe("b");
    expect(nextQueue.indexOf("a")).toBe(PRACTICE_GAP_RANGES[1].min);
  });

  it("uses progressively larger gaps for higher ratings", () => {
    const queue = cardIds;
    const lowGap = PracticeScheduler.applyRating(queue, 0, RATING.FORGOT, () => 0).queue.indexOf(
      "a",
    );
    const highGap = PracticeScheduler.applyRating(queue, 0, RATING.PERFECT, () => 0).queue.indexOf(
      "a",
    );

    expect(lowGap).toBeLessThan(highGap);
  });

  it("keeps the session alive with a single card", () => {
    const { queue, nextIndex } = PracticeScheduler.applyRating(["solo"], 0, RATING.GOOD, () => 0);
    expect(queue).toEqual(["solo"]);
    expect(nextIndex).toBe(0);
  });

  it("randomizes gaps within the configured range", () => {
    const gaps = new Set<number>();
    for (let index = 0; index < 30; index += 1) {
      gaps.add(practiceGapForRating(RATING.HARD, () => index / 30));
    }
    expect(gaps.size).toBeGreaterThan(1);
    for (const gap of gaps) {
      expect(gap).toBeGreaterThanOrEqual(PRACTICE_GAP_RANGES[2].min);
      expect(gap).toBeLessThanOrEqual(PRACTICE_GAP_RANGES[2].max);
    }
  });
});
