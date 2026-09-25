import type { RatingValue } from "@/lib/scheduler";

/** Minimal per-rating accent — border tint only, shared card background. */
export const RATING_BORDER_STYLES: Record<RatingValue, string> = {
  1: "border-red-500/50",
  2: "border-violet-500/50",
  3: "border-yellow-500/55",
  4: "border-sky-500/50",
  5: "border-emerald-500/50",
};
