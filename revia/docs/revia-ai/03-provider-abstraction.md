# 03 — Provider Abstraction

The AI service must not directly depend on any single AI provider. A provider interface allows swapping Gemini for OpenRouter (or any future provider) without changing the application API or service logic.

---

## AIProvider Interface

```typescript
// src/lib/providers/ai/ai-provider.ts

export interface GenerateCardsRequest {
  goal: string;
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  batchSize: number;
  context: LearnerContext;
  systemPrompt: string;
}

export interface GenerateCardsResponse {
  cards: GeneratedCard[];
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    model: string;
  };
}

export interface AIProvider {
  readonly name: string;
  generateCards(request: GenerateCardsRequest): Promise<GenerateCardsResponse>;
}
```

---

## Provider Implementations

### GeminiProvider
- Uses `@google/genai` SDK (Gemini API)
- Initial model: `gemini-3.6-flash` (free tier)
- Supports structured JSON output mode
- Environment: `GEMINI_API_KEY`

### OpenRouterProvider
- Uses OpenRouter HTTP API (REST, no SDK needed)
- Free models: `google/gemma-2-9b-it:free`, `mistralai/mistral-7b-instruct:free`
- Requires explicit JSON parsing (no native structured output)
- Environment: `OPENROUTER_API_KEY`

---

## Provider Factory

```typescript
// src/lib/providers/ai/provider-factory.ts

export function createAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER ?? 'gemini';
  
  switch (provider) {
    case 'gemini':
      return new GeminiProvider(process.env.GEMINI_API_KEY!);
    case 'openrouter':
      return new OpenRouterProvider(process.env.OPENROUTER_API_KEY!);
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_PROVIDER` | No (default: `gemini`) | Active provider: `gemini` or `openrouter` |
| `GEMINI_API_KEY` | When AI_PROVIDER=gemini | Google AI API key |
| `OPENROUTER_API_KEY` | When AI_PROVIDER=openrouter | OpenRouter API key |

---

## Adding a New Provider

1. Create `src/lib/providers/ai/new-provider.ts` implementing `AIProvider`
2. Add case to `provider-factory.ts`
3. Add env var documentation
4. No changes needed in the AI service, API route, or any UI code

---

## Provider Selection Diagram

```mermaid
flowchart TD
    Env[Read AI_PROVIDER env] --> Switch{Switch}
    
    Switch -- "gemini (default)" --> Gemini[GeminiProvider]
    Switch -- "openrouter" --> OpenRouter[OpenRouterProvider]
    Switch -- "unknown" --> Err[Throw Error]
    
    Gemini -- "success" --> Return[Return Response]
    Gemini -- "failure (future)" --> Fallback[Try Secondary Provider]
    
    OpenRouter -- "success" --> Return
    OpenRouter -- "failure (future)" --> Fallback
```

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Interface, not abstract class | Keep it simple, no shared state |
| Factory function, not DI container | Appropriate for project scale |
| Optional usage tracking | Not all providers expose token counts |
| Provider-specific prompt tuning | Happens inside each provider, not in the service |
