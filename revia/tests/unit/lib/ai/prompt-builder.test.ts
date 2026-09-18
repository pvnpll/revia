import { buildGenerationPrompts } from "@/lib/services/ai/prompt-builder";
import { describe, expect, it } from "vitest";

describe("buildGenerationPrompts", () => {
  it("includes goal, topic, level, and batch size in user prompt", () => {
    const prompts = buildGenerationPrompts({
      goal: "Learn conversational Kannada",
      topic: "Ordering food",
      level: "beginner",
      batchSize: 10,
      context: {
        known: [],
        struggled: [],
        recentlySeen: [],
        preferences: {},
      },
    });

    expect(prompts.userPrompt).toContain("Goal: Learn conversational Kannada");
    expect(prompts.userPrompt).toContain("Topic: Ordering food");
    expect(prompts.userPrompt).toContain("Level: beginner");
    expect(prompts.userPrompt).toContain("Number of Cards to Generate: 10");
  });

  it("includes exclusions for known and recently seen concepts", () => {
    const prompts = buildGenerationPrompts({
      goal: "Learn Kannada",
      topic: "Daily life",
      level: "intermediate",
      batchSize: 8,
      context: {
        known: ["Namaskara", "Dhanyawada"],
        recentlySeen: ["Banni", "Hogi"],
        struggled: ["Hegiddira"],
        preferences: {},
      },
    });

    expect(prompts.userPrompt).toContain("Known Concepts");
    expect(prompts.userPrompt).toContain("- Namaskara");
    expect(prompts.userPrompt).toContain("- Dhanyawada");

    expect(prompts.userPrompt).toContain("Recently Seen Concepts");
    expect(prompts.userPrompt).toContain("- Banni");
    expect(prompts.userPrompt).toContain("- Hogi");

    expect(prompts.userPrompt).toContain("Struggled Concepts");
    expect(prompts.userPrompt).toContain("- Hegiddira");
  });

  it("adjusts instructions based on learner preferences", () => {
    const withoutRomanization = buildGenerationPrompts({
      goal: "Learn Spanish",
      topic: "Travel",
      level: "advanced",
      batchSize: 5,
      context: {
        known: [],
        struggled: [],
        recentlySeen: [],
        preferences: {
          romanization: false,
          examples: false,
        },
      },
    });

    expect(withoutRomanization.systemPrompt).toContain("Omit phonetic pronunciation");
    expect(withoutRomanization.systemPrompt).toContain("Omit usage examples");
  });
});
