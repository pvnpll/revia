import { GeneratedCard, LearnerContext } from "@/lib/validators/ai";
import { describe, expect, it } from "vitest";

describe("AI Session Context State Management", () => {
  function applyCardRating(
    context: LearnerContext,
    card: GeneratedCard,
    rating: number,
  ): LearnerContext {
    const known = new Set(context.known || []);
    const struggled = new Set(context.struggled || []);
    const recentlySeen = new Set(context.recentlySeen || []);

    recentlySeen.add(card.front);

    if (rating <= 2) {
      struggled.add(card.front);
      known.delete(card.front);
    } else if (rating >= 4) {
      known.add(card.front);
      struggled.delete(card.front);
    }

    return {
      ...context,
      known: Array.from(known),
      struggled: Array.from(struggled),
      recentlySeen: Array.from(recentlySeen),
    };
  }

  const sampleCard: GeneratedCard = {
    front: "How are you?",
    back: "Hegiddira?",
    pronunciation: "Hegiddira?",
    example: "Neevu hegiddira?",
    notes: "Formal",
  };

  it("adds card to struggled when rated 1 (Forgot) or 2 (Hard)", () => {
    let context: LearnerContext = {
      known: [],
      struggled: [],
      recentlySeen: [],
      preferences: {},
    };

    context = applyCardRating(context, sampleCard, 1);
    expect(context.struggled).toContain("How are you?");
    expect(context.known).not.toContain("How are you?");
    expect(context.recentlySeen).toContain("How are you?");
  });

  it("adds card to known and removes from struggled when rated 4 (Good) or 5 (Mastered)", () => {
    let context: LearnerContext = {
      known: [],
      struggled: ["How are you?"],
      recentlySeen: [],
      preferences: {},
    };

    context = applyCardRating(context, sampleCard, 5);
    expect(context.known).toContain("How are you?");
    expect(context.struggled).not.toContain("How are you?");
    expect(context.recentlySeen).toContain("How are you?");
  });

  it("keeps existing known and struggled without changes when rated 3 (Okay)", () => {
    let context: LearnerContext = {
      known: ["Hello"],
      struggled: ["Water"],
      recentlySeen: [],
      preferences: {},
    };

    context = applyCardRating(context, sampleCard, 3);
    expect(context.known).toEqual(["Hello"]);
    expect(context.struggled).toEqual(["Water"]);
    expect(context.recentlySeen).toContain("How are you?");
  });
});

