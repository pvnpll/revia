import {
  AIProvider,
  AIProviderError,
  ProviderGenerateCardsRequest,
  ProviderGenerateCardsResult,
} from "@/lib/providers/ai";
import { AIGenerationService } from "@/lib/services/ai";
import { describe, expect, it, vi } from "vitest";

describe("AIGenerationService", () => {
  it("orchestrates generation and returns validated cards with metadata", async () => {
    const mockProvider: AIProvider = {
      name: "mock-gemini",
      generateCards: vi.fn().mockResolvedValue({
        cards: [
          {
            front: "How are you?",
            back: "Hegiddira?",
            pronunciation: "Hegiddira?",
            example: "Neevu hegiddira?",
            notes: "Polite form",
          },
          {
            front: "I am fine",
            back: "Naanu chennagiddini",
            pronunciation: "Naanu chennagiddini",
          },
          { front: "What is your name?", back: "Nimma hesaru enu?" },
          { front: "My name is John", back: "Nanna hesaru John" },
          { front: "Thank you", back: "Dhanyawada" },
        ],
        usage: {
          promptTokens: 120,
          completionTokens: 80,
          totalTokens: 200,
          model: "gemini-2.0-flash",
        },
      } satisfies ProviderGenerateCardsResult),
    };

    const service = new AIGenerationService({ provider: mockProvider });
    const result = await service.generate({
      goal: "Learn conversational Kannada",
      topic: "Greetings",
      level: "beginner",
      batchSize: 5,
    });

    expect(result.cards).toHaveLength(5);
    expect(result.meta.provider).toBe("mock-gemini");
    expect(result.meta.model).toBe("gemini-2.0-flash");
    expect(result.meta.batchSize).toBe(5);
    expect(result.meta.duplicatesFiltered).toBe(0);
    expect(result.meta.usage?.totalTokens).toBe(200);
    expect(mockProvider.generateCards).toHaveBeenCalledTimes(1);
  });

  it("retries when provider returns invalid card schema and recovers", async () => {
    const mockGenerate = vi
      .fn()
      // First attempt: missing required "back" field
      .mockResolvedValueOnce({
        cards: [{ front: "Incomplete card without back" }],
      } satisfies ProviderGenerateCardsResult)
      // Second attempt: valid cards
      .mockResolvedValueOnce({
        cards: [
          { front: "Hello", back: "Namaskara" },
          { front: "Water", back: "Neeru" },
          { front: "Food", back: "Oota" },
          { front: "Come", back: "Banni" },
          { front: "Go", back: "Hogi" },
        ],
      } satisfies ProviderGenerateCardsResult);

    const mockProvider: AIProvider = {
      name: "mock-gemini",
      generateCards: mockGenerate,
    };

    const service = new AIGenerationService({
      provider: mockProvider,
      maxRetries: 2,
    });

    const result = await service.generate({
      goal: "Learn Kannada",
      topic: "Basics",
      level: "beginner",
      batchSize: 5,
    });

    expect(mockGenerate).toHaveBeenCalledTimes(2);
    expect(result.cards).toHaveLength(5);
  });

  it("throws GENERATION_FAILED when all retries fail", async () => {
    const mockGenerate = vi.fn().mockResolvedValue({
      cards: [{ front: "Invalid" }], // missing back
    });

    const mockProvider: AIProvider = {
      name: "mock-gemini",
      generateCards: mockGenerate,
    };

    const service = new AIGenerationService({
      provider: mockProvider,
      maxRetries: 1,
    });

    await expect(
      service.generate({
        goal: "Learn Kannada",
        topic: "Basics",
        level: "beginner",
        batchSize: 5,
      }),
    ).rejects.toThrowError(/AI card generation failed/);

    expect(mockGenerate).toHaveBeenCalledTimes(2);
  });

  it("propagates RATE_LIMITED immediately without retrying", async () => {
    const mockGenerate = vi.fn().mockRejectedValue(
      new AIProviderError("Rate limit exceeded", "RATE_LIMITED", 429),
    );

    const mockProvider: AIProvider = {
      name: "mock-gemini",
      generateCards: mockGenerate,
    };

    const service = new AIGenerationService({
      provider: mockProvider,
      maxRetries: 2,
    });

    await expect(
      service.generate({
        goal: "Learn Kannada",
        topic: "Basics",
        level: "beginner",
        batchSize: 5,
      }),
    ).rejects.toMatchObject({
      code: "RATE_LIMITED",
      status: 429,
    });

    expect(mockGenerate).toHaveBeenCalledTimes(1);
  });

  it("filters duplicates and reports duplicate count", async () => {
    const mockProvider: AIProvider = {
      name: "mock-gemini",
      generateCards: vi.fn().mockResolvedValue({
        cards: [
          { front: "Hello", back: "Namaskara" }, // known duplicate
          { front: "Water", back: "Neeru" },
          { front: "Food", back: "Oota" },
          { front: "Come", back: "Banni" },
          { front: "Go", back: "Hogi" },
        ],
      } satisfies ProviderGenerateCardsResult),
    };

    const service = new AIGenerationService({ provider: mockProvider });
    const result = await service.generate({
      goal: "Learn Kannada",
      topic: "Basics",
      level: "beginner",
      batchSize: 5,
      context: {
        known: ["namaskara"],
        struggled: [],
        recentlySeen: [],
        preferences: {},
      },
    });

    expect(result.cards).toHaveLength(4);
    expect(result.meta.duplicatesFiltered).toBe(1);
  });

  it("throws EMPTY_GENERATION when all generated cards are duplicates", async () => {
    const mockProvider: AIProvider = {
      name: "mock-gemini",
      generateCards: vi.fn().mockResolvedValue({
        cards: [
          { front: "Hello", back: "Namaskara" },
          { front: "Water", back: "Neeru" },
        ],
      } satisfies ProviderGenerateCardsResult),
    };

    const service = new AIGenerationService({ provider: mockProvider });

    await expect(
      service.generate({
        goal: "Learn Kannada",
        topic: "Basics",
        level: "beginner",
        batchSize: 5,
        context: {
          known: ["namaskara", "neeru"],
          struggled: [],
          recentlySeen: [],
          preferences: {},
        },
      }),
    ).rejects.toMatchObject({
      code: "EMPTY_GENERATION",
      status: 502,
    });
  });
});

