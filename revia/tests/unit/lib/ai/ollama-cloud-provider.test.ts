import { OllamaCloudProvider } from "@/lib/providers/ai/ollama-cloud-provider";
import { describe, expect, it, vi } from "vitest";

describe("OllamaCloudProvider", () => {
  it("throws when OLLAMA_API_KEY is not configured", () => {
    const originalEnv = process.env.OLLAMA_API_KEY;
    delete process.env.OLLAMA_API_KEY;

    expect(() => new OllamaCloudProvider()).toThrowError(/OLLAMA_API_KEY/);

    process.env.OLLAMA_API_KEY = originalEnv;
  });

  it("successfully parses JSON output from Ollama Cloud /api/chat", async () => {
    const provider = new OllamaCloudProvider({
      apiKey: "test-ollama-key",
      model: "gemma4:31b",
    });

    const mockResponseBody = JSON.stringify({
      model: "gemma4:31b",
      message: {
        role: "assistant",
        content: JSON.stringify({
          cards: [
            { front: "Hello", back: "Namaskara" },
            { front: "Water", back: "Neeru" },
          ],
        }),
      },
      done: true,
      prompt_eval_count: 120,
      eval_count: 45,
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => mockResponseBody,
      json: async () => JSON.parse(mockResponseBody),
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
    expect(result.cards[0]).toEqual({ front: "Hello", back: "Namaskara" });
    expect(result.usage?.promptTokens).toBe(120);
    expect(result.usage?.completionTokens).toBe(45);
    expect(result.usage?.totalTokens).toBe(165);
    expect(result.usage?.model).toBe("gemma4:31b");

    // Verify request payload and endpoint
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, requestInit] = mockFetch.mock.calls[0];
    expect(url).toBe("https://ollama.com/api/chat");
    expect(requestInit.headers["Authorization"]).toBe("Bearer test-ollama-key");
    const parsedBody = JSON.parse(requestInit.body);
    expect(parsedBody.format).toBe("json");
    expect(parsedBody.model).toBe("gemma4:31b");
    expect(parsedBody.stream).toBe(false);
  });

  it("strips markdown codeblock ticks from model output before parsing", async () => {
    const provider = new OllamaCloudProvider({
      apiKey: "test-ollama-key",
    });

    const jsonString = JSON.stringify({
      cards: [{ front: "Apple", back: "Sebu" }],
    });

    const mockResponseBody = JSON.stringify({
      model: "gemma4:31b",
      message: {
        role: "assistant",
        content: `\`\`\`json\n${jsonString}\n\`\`\``,
      },
      prompt_eval_count: 80,
      eval_count: 20,
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => mockResponseBody,
      json: async () => JSON.parse(mockResponseBody),
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

  it("handles custom baseUrl with or without /api suffix", async () => {
    const provider = new OllamaCloudProvider({
      apiKey: "test-ollama-key",
      baseUrl: "https://my-custom-ollama.internal:11434/api/",
    });

    const mockResponseBody = JSON.stringify({
      model: "gemma4:31b",
      message: {
        role: "assistant",
        content: JSON.stringify({
          cards: [{ front: "Sun", back: "Surya" }],
        }),
      },
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => mockResponseBody,
      json: async () => JSON.parse(mockResponseBody),
    });

    global.fetch = mockFetch;

    await provider.generateCards({
      goal: "Learn Kannada",
      topic: "Nature",
      level: "beginner",
      batchSize: 1,
      context: { known: [], struggled: [], recentlySeen: [], preferences: {} },
      systemPrompt: "You are a tutor",
      userPrompt: "Generate cards",
    });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("https://my-custom-ollama.internal:11434/api/chat");
  });

  it("throws authentication error when response is 401", async () => {
    const provider = new OllamaCloudProvider({
      apiKey: "invalid-key",
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ error: "Unauthorized" }),
    });

    await expect(
      provider.generateCards({
        goal: "Learn Kannada",
        topic: "Nature",
        level: "beginner",
        batchSize: 1,
        context: { known: [], struggled: [], recentlySeen: [], preferences: {} },
        systemPrompt: "You are a tutor",
        userPrompt: "Generate cards",
      }),
    ).rejects.toThrowError(/unauthorized|invalid/i);
  });
});

