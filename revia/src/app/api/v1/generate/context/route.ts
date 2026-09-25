import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { getUserIdOrGuestId } from "@/lib/api/auth";
import { jsonResponse } from "@/lib/api/response";
import { aiContextService } from "@/lib/services/ai";
import { prisma } from "@/lib/db/prisma";
import { learnerContextSchema } from "@/lib/validators/ai";

import { normalizeTopic } from "@/lib/services/ai/topic-normalizer";

const getQuerySchema = z.object({
  topic: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdOrGuestId(); // Throws 401 if no user and no guest cookie
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const { topic } = getQuerySchema.parse(searchParams);

    if (topic) {
      const context = await aiContextService.getContext(userId, topic);
      return jsonResponse(context);
    } else {
      const topics = await aiContextService.getUserTopics(userId);
      return jsonResponse(topics);
    }
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
    const userId = await getUserIdOrGuestId();
    const body = await request.json();
    const { goal, topic } = postBodySchema.parse(body);

    const subjectKey = await normalizeTopic(goal, topic);
    
    if (userId.startsWith("guest_")) {
      const existingTopics = await aiContextService.getUserTopics(userId);
      const isNewTopic = !existingTopics.some(t => t.topic === subjectKey);

      // 1. Check IP tracker only if trying to create a NEW topic
      const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
      if (isNewTopic && clientIp !== "anonymous") {
        const tracker = await prisma.guestIpTracker.findUnique({ where: { ip: clientIp } });
        // Strict 1 topic limit per IP address
        if (tracker && tracker.count >= 1) {
          return NextResponse.json(
            { error: { code: "GUEST_LIMIT", message: "Guest limit reached for this IP address! Please create a free account to continue." } },
            { status: 403 }
          );
        }
      }

      // 2. Check cookie-based topic limit
      if (existingTopics.length >= 1 && isNewTopic) {
        return NextResponse.json(
          { error: { code: "GUEST_LIMIT", message: "Guest limit reached! Please sign in to save your progress and learn new subjects." } },
          { status: 403 }
        );
      }
      
      // 3. Track IP for new topics
      if (isNewTopic && clientIp !== "anonymous") {
        await prisma.guestIpTracker.upsert({
          where: { ip: clientIp },
          update: { count: { increment: 1 } },
          create: { ip: clientIp, count: 1 },
        });
      }
    }

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
    const userId = await getUserIdOrGuestId();
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
