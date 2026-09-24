import { NextRequest } from "next/server";
import { aiGenerationService } from "@/lib/services/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await aiGenerationService.generateCurriculum(body);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to generate curriculum" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

