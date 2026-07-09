import { SimpleIntervalAlgorithm } from "@/lib/scheduler/algorithms/simple-interval";
import { RATING, type RatingValue } from "@/lib/scheduler/types";

describe("SimpleIntervalAlgorithm", () => {
  const algorithm = new SimpleIntervalAlgorithm();
  const now = new Date("2026-01-01T12:00:00Z");
  const cardId = "30000000-0000-0000-0000-000000000001";

  it("initial schedule sets due immediately", () => {
    const result = algorithm.initialSchedule(now);
    expect(result.dueAt).toEqual(now);
    expect(result.repetitions).toBe(0);
    expect(result.algorithmVersion).toBe("simple-v1");
  });

  it("rating 1 resets interval to minimum", () => {
    const result = algorithm.calculateNext({
      state: {
        cardId,
        dueAt: now,
        intervalDays: 30,
        easeFactor: 2.5,
        repetitions: 5,
        lapses: 0,
        lastReviewedAt: now,
        algorithmVersion: "simple-v1",
        algorithmState: null,
      },
      rating: RATING.FORGOT,
      reviewHistory: [],
      now,
    });

    expect(result.intervalDays).toBe(1);
    expect(result.repetitions).toBe(0);
    expect(result.lapses).toBe(1);
  });

  it("interval increases monotonically with rating", () => {
    const baseState = {
      cardId,
      dueAt: now,
      intervalDays: 10,
      easeFactor: 2.5,
      repetitions: 3,
      lapses: 0,
      lastReviewedAt: now,
      algorithmVersion: "simple-v1",
      algorithmState: null,
    };

    const ratings: RatingValue[] = [
      RATING.FORGOT,
      RATING.HARD,
      RATING.OKAY,
      RATING.GOOD,
      RATING.PERFECT,
    ];

    const intervals = ratings.map((rating) =>
      algorithm.calculateNext({
        state: baseState,
        rating,
        reviewHistory: [],
        now,
      }).intervalDays,
    );

    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThanOrEqual(intervals[i - 1]!);
    }
  });
});
