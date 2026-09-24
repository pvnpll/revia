import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { getUserId } from "@/lib/api/auth";
import { jsonResponse } from "@/lib/api/response";
import { aiContextService } from "@/lib/services/ai";
import { learnerContextSchema } from "@/lib/validators/ai";

import { normalizeTopic } from "@/lib/services/ai/topic-normalizer";

const getQuerySchema = z.object({
  topic: z.string().min(1, "Topic is required"),
});

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(); // Throws 401 if not logged in
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const { topic } = getQuerySchema.parse(searchParams);

    const context = await aiContextService.getContext(userId, topic);
    return jsonResponse(context);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: { code: "VALIDATION", message: error.errors[0]?.message } }, { status: 400 });
    }
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "UNAUTHORIZED") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not logged in" } }, { status: 401 });
    }
    console.error("GET context error", error);
    return NextResponse.json({ error: { code: "INTERNAL", message: "Server error" } }, { status: 500 });
  }
}

const postBodySchema = z.object({
  goal: z.string().min(1),
  topic: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { goal, topic } = postBodySchema.parse(body);

    const subjectKey = await normalizeTopic(goal, topic);
    const context = await aiContextService.getContext(userId, subjectKey);
    
    return jsonResponse({ subjectKey, context });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: { code: "VALIDATION", message: error.errors[0]?.message } }, { status: 400 });
    }
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "UNAUTHORIZED") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not logged in" } }, { status: 401 });
    }
    console.error("POST context error", error);
    return NextResponse.json({ error: { code: "INTERNAL", message: "Server error" } }, { status: 500 });
  }
}

const putBodySchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  updates: learnerContextSchema.partial(),
});

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { topic, updates } = putBodySchema.parse(body);

    const context = await aiContextService.updateContext(userId, topic, updates);
    return jsonResponse(context);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: { code: "VALIDATION", message: error.errors[0]?.message } }, { status: 400 });
    }
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "UNAUTHORIZED") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not logged in" } }, { status: 401 });
    }
    console.error("PUT context error", error);
    return NextResponse.json({ error: { code: "INTERNAL", message: "Server error" } }, { status: 500 });
  }
}
