import { NextRequest } from "next/server";
import { getUserId } from "@/lib/api/auth";
import { aiContextService } from "@/lib/services/ai";
import { jsonResponse } from "@/lib/api/response";

export async function GET() {
  try {
    const userId = await getUserId();
    const topics = await aiContextService.getUserTopics(userId);
    
    if (topics.length === 0) {
      return jsonResponse({ suggestions: [] });
    }

    const pastTopics = topics.map(t => t.topic).join(", ");
    
    const systemPrompt = `You are a learning path AI. The user is using an adaptive flashcard app.
They have previously studied the following subjects/topics:
${pastTopics}

Based on this history, suggest exactly 3 logical, interesting NEXT topics they should study. 
Output ONLY a JSON array of strings, like: ["Calculus", "Physics", "Linear Algebra"]`;

    try {
      if (process.env.OPENROUTER_API_KEY) {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "google/gemma-2-9b-it:free",
            response_format: { type: "json_object" },
            messages: [{ role: "system", content: systemPrompt }],
          })
        });
        const data = await res.json();
        const jsonStr = data.choices[0]?.message?.content || "[]";
        let parsed = JSON.parse(jsonStr.replace(/```json/g, "").replace(/```/g, ""));
        
        // If the LLM returns an object { suggestions: [...] }, extract it
        if (!Array.isArray(parsed) && parsed.suggestions && Array.isArray(parsed.suggestions)) {
          parsed = parsed.suggestions;
        } else if (!Array.isArray(parsed)) {
          // If it returned something weird, fallback
          parsed = [];
        }
        
        // Return top 3
        return jsonResponse({ suggestions: parsed.slice(0, 3) });
      }
    } catch (err) {
      console.warn("Suggestion generation failed", err);
    }
    
    return jsonResponse({ suggestions: [] });
  } catch {
    return jsonResponse({ suggestions: [] });
  }
}
