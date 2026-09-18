# Revia AI Learning Engine

## 1. Overview

Revia AI is an independent AI learning engine that generates adaptive learning content for a learning application.

The service must be developed independently from the Revia web application so that it can later serve:

* Revia Web
* Revia Mobile
* Other clients in the future

The AI service must expose an API rather than being tightly coupled to any UI.

Initial AI provider:

* Gemini API using its available free tier

Secondary provider:

* OpenRouter free models

The provider must be replaceable without changing the application API.

---

## 2. Goal

Build an AI service capable of generating useful learning cards based on:

* User's learning goal
* Topic
* Current level
* Previously known concepts
* Recently seen concepts
* Concepts the learner struggled with
* User preferences
* Content already generated
* Desired batch size

The system should generate the next useful batch rather than repeatedly generating random cards.

---

## 3. Core Use Case

Example:

User:

"Teach me basic Kannada conversation."

The system should understand:

* Topic: Kannada conversation
* Level: Beginner
* Goal: Everyday conversation

It generates 10 cards.

While the learner studies those cards, the client can request another batch.

The next batch should consider:

* What the learner already knows
* What was recently generated
* What the learner struggled with
* What concepts should logically come next

The system should avoid unnecessary repetition.

---

## 4. AI Mode

AI Mode is an ongoing learning session.

Basic flow:

1. User enters a learning goal.
2. Client creates an AI learning session.
3. AI generates the first batch.
4. Client displays the cards.
5. Learner rates/interacts with cards.
6. Learner context is updated.
7. Client requests the next batch.
8. AI generates the next batch using the updated context.
9. Repeat until the learner exits.

The system should support background generation of the next batch.

---

## 5. Learner Context

The AI service must not depend on sending the entire learning history to the model.

Maintain a compact learner context.

Example:

{
"topic": "Kannada daily conversation",
"level": "beginner",
"goal": "Speak basic everyday Kannada",
"known": [
"Namaskara",
"Dhanyawada"
],
"struggled": [
"Hegiddira"
],
"recentlySeen": [
"Nimma hesaru enu?"
],
"preferences": {
"romanization": true,
"examples": true
}
}

The context should remain compact and relevant.

---

## 6. Card Generation

Initial batch size:

10 cards.

The API should allow the client to request different batch sizes within reasonable limits.

Each generated card should contain structured data.

Example:

{
"front": "How are you?",
"back": "ಹೇಗಿದ್ದೀರ? (Hegiddira?)",
"pronunciation": "Hegiddira?",
"example": "ನೀವು ಹೇಗಿದ್ದೀರ?",
"notes": "Formal way of asking how someone is"
}

The exact schema must be validated before the response is accepted.

---

## 7. Generation Requirements

Generated content should:

* Match the requested topic
* Match the learner's level
* Avoid unnecessary repetition
* Build progressively on previous content
* Prefer useful real-world knowledge
* Respect user preferences
* Produce valid structured JSON
* Never invent fields outside the schema
* Avoid academic complexity unless requested

For language learning:

* Prefer natural everyday language
* Include simple romanization when requested
* Do not use unnecessary linguistic notation
* Avoid confidently presenting uncertain information as fact

---

## 8. Duplicate Avoidance

The system must avoid generating cards that are substantially equivalent to:

* Known cards
* Recently generated cards
* Previously rejected cards
* Existing session content

Duplicate detection should exist outside the AI prompt where practical.

The system should not rely entirely on the model to detect duplicates.

---

## 9. Learner Feedback

The system should support feedback such as:

* Known
* Easy
* Good
* Hard
* Forgot
* Not useful
* Already knew this

This feedback should update learner context.

The AI should use this information when generating future batches.

---

## 10. AI Provider Abstraction

The application must not directly depend on Gemini.

Create a provider interface.

Conceptually:

AIProvider
generateCards()
generateExplanation()
etc.

Implement:

GeminiProvider
OpenRouterProvider

The rest of the application should communicate with AIProvider rather than directly with a provider SDK.

Provider selection should be configurable through environment variables.

Example:

AI_PROVIDER=gemini

Later:

AI_PROVIDER=openrouter

---

## 11. API

Initial API:

POST /api/v1/generate/cards

Request:

{
"goal": "Learn basic Kannada conversation",
"topic": "Greetings",
"level": "beginner",
"batchSize": 10,
"context": {
"known": [],
"struggled": [],
"recentlySeen": [],
"preferences": {
"romanization": true,
"examples": true
}
}
}

Response:

{
"cards": [
{
"front": "...",
"back": "...",
"pronunciation": "...",
"example": "...",
"notes": "..."
}
]
}

The API must return predictable JSON.

---

## 12. Validation

AI output must be validated before being returned.

Use Zod for runtime schema validation.

Invalid AI output must not silently enter the database.

The system should attempt a controlled retry when the model produces invalid structured output.

Do not create an unlimited retry loop.

---

## 13. Security

API keys must never be exposed to clients.

Correct architecture:

Client
↓
Revia AI API
↓
AI Provider

Incorrect:

Client
↓
Gemini API directly with secret key

Environment variables must contain provider credentials.

---

## 14. Cost Control

The initial implementation must assume free-tier limits.

Implement:

* Maximum batch size
* Request limits
* Context size limits
* Maximum retries
* Logging of provider/model/token usage where available
* Provider fallback capability

Do not continuously generate content without user activity.

Background generation should only generate a limited next batch.

---

## 15. Error Handling

The API must handle:

* Provider unavailable
* Rate limit
* Invalid model response
* Timeout
* Invalid request
* Empty generation
* Provider authentication failure

Errors returned to the client must be safe and understandable.

Provider secrets and internal errors must not be exposed.

---

## 16. Persistence

The initial AI service should minimize persistent dependencies.

Do not create a large database architecture before it is necessary.

The first version may accept learner context from the client.

Later, the service can own persistent learner context.

The architecture should allow this transition without changing the public API significantly.

---

## 17. Non-Goals

Do NOT initially build:

* Chatbot UI
* Voice
* Image generation
* AI tutor conversation
* Embeddings/vector database
* RAG
* Fine-tuning
* Multiple AI agents
* Complex autonomous agents
* Native mobile application
* Production billing system

Focus on reliable structured learning-card generation.

---

## 18. Quality Requirements

The system should prioritize:

1. Correctness
2. Useful learning progression
3. Structured output reliability
4. Low cost
5. Low latency
6. Provider independence
7. Maintainable architecture

---

## 19. Future Direction

Possible future capabilities:

* AI-generated quizzes
* AI explanations
* AI difficulty adjustment
* Personalized curriculum
* Topic progression
* Spaced-repetition integration
* Learning analytics
* RAG over user documents
* PDF/website learning
* Voice-based learning
* Multiple AI providers
* Paid premium AI providers

These must not complicate the initial implementation.

---

## 20. Success Criteria

The first stable version should be able to:

1. Accept a learning goal.
2. Generate 10 valid cards.
3. Validate the response.
4. Return cards through an API.
5. Support Gemini.
6. Support a second provider.
7. Accept learner context.
8. Avoid obvious repetitions.
9. Generate the next batch using updated context.
10. Run independently from Revia Web.
11. Be consumable by a future mobile application.
