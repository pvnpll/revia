export async function normalizeTopic(goal: string, topic: string): Promise<string> {
  // We make a direct lightweight fetch to OpenRouter/Ollama to extract the subject.
  // Using the cheapest/fastest model available just for this task.
  const prompt = `Extract the core language, subject, or academic field from this goal and topic.
Goal: "${goal}"
Topic: "${topic}"

Rules:
1. Return ONLY the subject name in lowercase with underscores.
2. Do not include markdown or explanations.
3. Keep it broad (e.g., "kannada", "react_js", "physics").

Subject:`;

  const fallback = topic.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30) || "general";

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemma-2-9b-it:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to normalize topic");
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim() || "";
    
    // Clean up any weird characters
    const normalized = result.toLowerCase().replace(/[^a-z0-9_]/g, "");
    return normalized || fallback;
  } catch (err) {
    console.warn("Topic normalization failed, falling back to heuristic:", err);
    return fallback;
  }
}
