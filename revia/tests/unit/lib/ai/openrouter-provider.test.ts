import { OpenRouterProvider } from "@/lib/providers/ai/openrouter-provider";
import { describe, expect, it, vi } from "vitest";

describe("OpenRouterProvider", () => {
  it("throws when OPENROUTER_API_KEY is not configured", () => {
    const originalEnv = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;

    expect(() => new OpenRouterProvider()).toThrowError(/OPENROUTER_API_KEY/);

    process.env.OPENROUTER_API_KEY = originalEnv;
  });

  it("successfully parses JSON output from OpenRouter chat completion", async () => {
    const provider = new OpenRouterProvider({
      apiKey: "test-openrouter-key",
      model: "meta-llama/llama-3.3-70b-instruct:free",
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                cards: [
                  { front: "Hello", back: "Namaskara" },
                  { front: "Water", back: "Neeru" },
                ],
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      }),
    });

    global.fetch = mockFetch;

    const result = await provider.generateCards({
      goal: "Learn Kannada",
      topic: "Greetings",
      level: "beginner",
      batchSize: 2,
      context: { known: [], struggled: [], recentlySeen: [], preferences: {} },
      systemPrompt: "You are a tutor",
      userPrompt: "Generate cards",
    });

    expect(result.cards).toHaveLength(2);
    expect(result.usage?.totalTokens).toBe(150);
  });

  it("strips markdown codeblock ticks from model output before parsing", async () => {
    const provider = new OpenRouterProvider({
      apiKey: "test-openrouter-key",
    });

    const jsonString = JSON.stringify({
      cards: [{ front: "Apple", back: "Sebu" }],
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: `\`\`\`json\n${jsonString}\n\`\`\``,
            },
          },
        ],
      }),
    });

    const result = await provider.generateCards({
      goal: "Learn Kannada",
      topic: "Fruits",
      level: "beginner",
      batchSize: 1,
      context: { known: [], struggled: [], recentlySeen: [], preferences: {} },
      systemPrompt: "You are a tutor",
      userPrompt: "Generate cards",
    });

    expect(result.cards).toHaveLength(1);
    expect(result.cards[0]).toEqual({ front: "Apple", back: "Sebu" });
  });
});
