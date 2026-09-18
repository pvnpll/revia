# 02 — API Reference

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/generate/cards` | Generate a batch of learning cards |

---

## Generate Cards

**Request body**:
```json
{
  "goal": "Learn basic Kannada conversation",
  "topic": "Greetings",
  "level": "beginner",
  "batchSize": 10,
  "context": {
    "known": ["Namaskara", "Dhanyawada"],
    "struggled": ["Hegiddira"],
    "recentlySeen": ["Nimma hesaru enu?"],
    "preferences": {
      "romanization": true,
      "examples": true
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| goal | string | Yes | Learner's high-level objective |
| topic | string | Yes | Specific topic for this batch |
| level | enum | Yes | `beginner`, `intermediate`, or `advanced` |
| batchSize | number | No | Number of cards (5-25), default 10 |
| context | object | No | Learner context |
| context.known | string[] | No | Concepts the learner already knows |
| context.struggled | string[] | No | Concepts the learner found difficult |
| context.recentlySeen | string[] | No | Recently generated content (for dedup) |
| context.preferences | object | No | User preferences like romanization, examples |

**Success response**:
```json
{
  "data": {
    "cards": [
      {
        "front": "How are you?",
        "back": "ಹೇಗಿದ್ದೀರ? (Hegiddira?)",
        "pronunciation": "Hegiddira?",
        "example": "ನೀವು ಹೇಗಿದ್ದೀರ?",
        "notes": "Formal way of asking how someone is"
      }
    ],
    "meta": {
      "provider": "gemini",
      "model": "gemini-3.6-flash",
      "batchSize": 10,
      "generatedAt": "2026-09-18T15:30:00.000Z"
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| front | string | Yes | Question or prompt side |
| back | string | Yes | Answer side |
| pronunciation | string | No | Phonetic guide (language learning) |
| example | string | No | Usage example |
| notes | string | No | Additional context or tips |

---

## Error Responses

All AI endpoints follow the same `{ "data": T }` / `{ "error": { "code", "message" } }` pattern as the main Revia API.

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION | 400 | Invalid request body (Zod validation failed) |
| RATE_LIMITED | 429 | Too many requests, try again later |
| PROVIDER_UNAVAILABLE | 503 | AI provider is down or unreachable |
| PROVIDER_AUTH_FAILED | 502 | AI provider rejected credentials |
| GENERATION_FAILED | 502 | AI produced invalid/unparseable output after retries |
| EMPTY_GENERATION | 502 | AI returned zero cards |
| TIMEOUT | 504 | AI provider didn't respond in time |
| UNAUTHORIZED | 401 | Missing or invalid auth |
| INTERNAL | 500 | Unexpected server error |

---

## Constraints

| Constraint | Value |
|------------|-------|
| Min batch size | 5 |
| Max batch size | 25 |
| Max known items | 100 |
| Max struggled items | 50 |
| Max recentlySeen items | 50 |
| Max retries on invalid output | 2 |
| Request timeout | 30s |
