import type { RatingValue } from "./types";

export type RandomFn = () => number;

/** Cards to show before a rated card reappears (min inclusive, max inclusive). */
export const PRACTICE_GAP_RANGES: Record<RatingValue, { min: number; max: number }> = {
  1: { min: 2, max: 4 },
  2: { min: 5, max: 9 },
  3: { min: 10, max: 18 },
  4: { min: 19, max: 35 },
  5: { min: 36, max: 55 },
};

export interface PracticeRatingResult {
  queue: string[];
  nextIndex: number;
}

function shuffle<T>(items: T[], random: RandomFn): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function randomInt(min: number, max: number, random: RandomFn): number {
  return min + Math.floor(random() * (max - min + 1));
}

export function practiceGapForRating(rating: RatingValue, random: RandomFn = Math.random): number {
  const range = PRACTICE_GAP_RANGES[rating];
  return randomInt(range.min, range.max, random);
}

export class PracticeScheduler {
  static createInitialQueue(cardIds: readonly string[], random: RandomFn = Math.random): string[] {
    if (cardIds.length === 0) {
      return [];
    }
    return shuffle([...cardIds], random);
  }

  /**
   * Removes the card at `currentIndex`, reinserts it after a rating-based gap,
   * and returns the index of the next card to show (same position — the successor).
   */
  static applyRating(
    queue: readonly string[],
    currentIndex: number,
    rating: RatingValue,
    random: RandomFn = Math.random,
  ): PracticeRatingResult {
    if (queue.length === 0) {
      return { queue: [], nextIndex: 0 };
    }

    const safeIndex = Math.max(0, Math.min(currentIndex, queue.length - 1));
    const cardId = queue[safeIndex];
    const remaining = queue.filter((_, index) => index !== safeIndex);

    if (remaining.length === 0) {
      return { queue: [cardId], nextIndex: 0 };
    }

    const gap = practiceGapForRating(rating, random);
    const insertAt = Math.min(safeIndex + gap, remaining.length);
    const nextQueue = [
      ...remaining.slice(0, insertAt),
      cardId,
      ...remaining.slice(insertAt),
    ];

    return {
      queue: nextQueue,
      nextIndex: Math.min(safeIndex, nextQueue.length - 1),
    };
  }
}
