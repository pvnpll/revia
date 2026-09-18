import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getOptionalUserId } from "@/lib/api/auth";
import { jsonResponse } from "@/lib/api/response";
import { AIProviderError } from "@/lib/providers/ai";
import { aiGenerationService } from "@/lib/services/ai";

// In-memory sliding window rate limiter: 10 requests per minute per user/IP
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60000;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) || []).filter(
    (time) => now - time < RATE_LIMIT_WINDOW_MS,
  );

  if (timestamps.length >= RATE_LIMIT_MAX) {
    return false;
  }

  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getOptionalUserId();
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const rateLimitKey = userId || clientIp;

    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Rate limit exceeded. Please wait a minute before generating more cards.",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION",
            message: "Malformed JSON in request body",
          },
        },
        { status: 400 },
      );
    }

    const result = await aiGenerationService.generate(body);

    return jsonResponse(result);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const first = error.errors[0];
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION",
            message: first?.message ?? "Invalid generation request",
            field: first?.path.join("."),
          },
        },
        { status: 400 },
      );
    }

    if (error instanceof AIProviderError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.status },
      );
    }

    console.error("Unexpected error in /api/v1/generate/cards:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL",
          message: "An unexpected error occurred during card generation",
        },
      },
      { status: 500 },
    );
  }
}

