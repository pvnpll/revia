import { GenerationRequestInput } from "@/lib/validators/ai";

export interface GenerationPrompts {
  systemPrompt: string;
  userPrompt: string;
}

export function buildGenerationPrompts(input: GenerationRequestInput): GenerationPrompts {
  const { goal, topic, level, batchSize, context } = input;
  const preferences = context.preferences || {};
  const includeRomanization = preferences.romanization !== false;
  const includeExamples = preferences.examples !== false;

  const systemInstructions = [
    "You are Revia AI, an expert adaptive curriculum and flashcard generation engine.",
    "Your objective is to generate clear, effective, and progressive spaced repetition flashcards based on the user's specific learning goal, topic, and current proficiency level.",
    "",
    "### Core Generation Guidelines:",
    "1. REAL-WORLD UTILITY: Prioritize natural, everyday, practical language or foundational concepts over academic obscurity or rare theoretical trivia.",
    `2. PROFICIENCY LEVEL: Strictly calibrate to the '${level}' level. Do not jump to advanced nuances if beginner, and do not provide trivial basics if advanced.`,
    "3. PROGRESSIVE CONTINUITY: Concepts should build logically from one to the next within the batch.",
    "4. ACCURACY: Provide exact and verified information. Do not guess or present uncertain data as facts.",
    includeRomanization
      ? "5. ROMANIZATION / PRONUNCIATION: For language learning, provide simple, intuitive phonetic pronunciation/romanization in the 'pronunciation' field."
      : "5. ROMANIZATION: Omit phonetic pronunciation unless essential.",
    includeExamples
      ? "6. EXAMPLES: Provide a brief, natural usage example in the 'example' field whenever appropriate."
      : "6. EXAMPLES: Omit usage examples.",
    "7. EXPLANATIONS & NUANCE: Act as an expert tutor. You MUST include a 'nuance' field for every card containing a concise grammar breakdown, cultural context, or the 'Why' behind the concept.",
    "8. NOTES: Include brief usage tips in 'notes' if needed.",
    "9. STRICT STRUCTURE: You must return valid JSON with a 'cards' array of exactly the requested batch size.",
  ].join("\n");

  const userSections: string[] = [
    "### Target Request:",
    `- Goal: ${goal}`,
    `- Topic: ${topic}`,
    `- Level: ${level}`,
    `- Number of Cards to Generate: ${batchSize}`,
  ];

  if (context.known && context.known.length > 0) {
    userSections.push(
      "",
      "### Known Concepts (DO NOT RE-GENERATE THESE; learner has already mastered them):",
      context.known.map((item) => `- ${item}`).join("\n"),
    );
  }

  if (context.recentlySeen && context.recentlySeen.length > 0) {
    userSections.push(
      "",
      "### Recently Seen Concepts (DO NOT DUPLICATE THESE):",
      context.recentlySeen.map((item) => `- ${item}`).join("\n"),
    );
  }

  if (context.struggled && context.struggled.length > 0) {
    userSections.push(
      "",
      "### Struggled Concepts (PRIORITIZE REINFORCING OR RE-APPROACHING THESE FROM A FRESH ANGLE):",
      context.struggled.map((item) => `- ${item}`).join("\n"),
    );
  }

  // --- DYNAMIC DIFFICULTY ADJUSTMENT ---
  const knownCount = context.known?.length || 0;
  if (knownCount > 0) {
    let adjustment = "";
    if (level === "beginner") {
      if (knownCount >= 15) {
        adjustment = "The user has mastered over 15 concepts at the beginner level. You MUST seamlessly upgrade the complexity to intermediate (e.g., short phrases, simple grammar) while staying on topic.";
      } else if (knownCount >= 5) {
        adjustment = "The user has a solid foundation. Begin transitioning from basic single-word vocabulary to simple conversational phrases.";
      }
    } else if (level === "intermediate") {
      if (knownCount >= 15) {
        adjustment = "The user has mastered over 15 concepts at the intermediate level. You MUST seamlessly upgrade the complexity to advanced (e.g., complex sentences, idioms, nuances) while staying on topic.";
      }
    }
    
    if (adjustment) {
      userSections.push(
        "",
        "### Dynamic Difficulty Scaling:",
        adjustment,
      );
    }
  }

  userSections.push(
    "",
    `Generate exactly ${batchSize} new, high-quality cards that logically advance the learner's journey.`,
  );

  return {
    systemPrompt: systemInstructions,
    userPrompt: userSections.join("\n"),
  };
}

