import {
  filterDuplicateCards,
  normalizeCardText,
} from "@/lib/services/ai/dedup-filter";
import { GeneratedCard } from "@/lib/validators/ai";
import { describe, expect, it } from "vitest";

describe("dedup-filter", () => {
  describe("normalizeCardText", () => {
    it("lowercases, removes punctuation, and trims extra spaces", () => {
      expect(normalizeCardText("  How are you???  ")).toBe("how are you");
      expect(normalizeCardText("Hello, World!")).toBe("hello world");
      expect(normalizeCardText("Namaskara: (Formal)")).toBe("namaskara formal");
    });
  });

  describe("filterDuplicateCards", () => {
    const sampleCards: GeneratedCard[] = [
      { front: "How are you?", back: "Hegiddira?" },
      { front: "Thank you", back: "Dhanyawada" },
      { front: "Water", back: "Neeru" },
      { front: "Food", back: "Oota" },
    ];

    it("filters out cards matching known concepts", () => {
      const result = filterDuplicateCards(sampleCards, {
        known: ["how are you", "dhanyawada"],
      });

      expect(result.duplicatesRemoved).toBe(2);
      expect(result.cards).toHaveLength(2);
      expect(result.cards.map((c) => c.front)).toEqual(["Water", "Food"]);
    });

    it("filters out cards matching recently seen concepts", () => {
      const result = filterDuplicateCards(sampleCards, {
        recentlySeen: ["neeru"],
      });

      expect(result.duplicatesRemoved).toBe(1);
      expect(result.cards).toHaveLength(3);
      expect(result.cards.map((c) => c.front)).toEqual([
        "How are you?",
        "Thank you",
        "Food",
      ]);
    });

    it("filters duplicates generated within the same batch", () => {
      const batchWithDuplicates: GeneratedCard[] = [
        { front: "Hello", back: "Namaskara" },
        { front: "Hello!", back: "Namaskara" },
        { front: "Goodbye", back: "Hogibanni" },
      ];

      const result = filterDuplicateCards(batchWithDuplicates);
      expect(result.duplicatesRemoved).toBe(1);
      expect(result.cards).toHaveLength(2);
      expect(result.cards[0].front).toBe("Hello");
      expect(result.cards[1].front).toBe("Goodbye");
    });
  });
});
