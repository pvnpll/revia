import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { getOptionalUserId } from "@/lib/api/auth";
import { AIProviderError } from "@/lib/providers/ai";
import { aiGenerationService } from "@/lib/services/ai";

export const maxDuration = 60;

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

function sseMessage(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
  const userId = await getOptionalUserId();
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const rateLimitKey = userId || clientIp;

  if (!checkRateLimit(rateLimitKey)) {
    return new Response(
      JSON.stringify({
        error: {
          code: "RATE_LIMITED",
          message: "Rate limit exceeded. Please wait a minute before generating more cards.",
        },
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        error: {
          code: "VALIDATION",
          message: "Malformed JSON in request body",
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        const result = await aiGenerationService.generateStream(
          body,
          userId || undefined,
          (card) => {
            controller.enqueue(encoder.encode(sseMessage("card", card)));
          },
        );

        // Send final done event with metadata and context
        controller.enqueue(
          encoder.encode(
            sseMessage("done", {
              meta: result.meta,
              context: result.context,
            }),
          ),
        );
      } catch (error: unknown) {
        let errorPayload: { code: string; message: string };

        if (error instanceof ZodError) {
          const first = error.errors[0];
          errorPayload = {
            code: "VALIDATION",
            message: first?.message ?? "Invalid generation request",
          };
        } else if (error instanceof AIProviderError) {
          errorPayload = {
            code: error.code,
            message: error.message,
          };
        } else {
          console.error("Unexpected error in /api/v1/generate/cards:", error);
          errorPayload = {
            code: "INTERNAL",
            message:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred during card generation",
          };
        }


        controller.enqueue(encoder.encode(sseMessage("error", errorPayload)));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
