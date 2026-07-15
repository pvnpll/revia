import { getOptionalUserId, getUserId } from "@/lib/api/auth";
import { handleApiError, jsonResponse } from "@/lib/api/response";
import { lessonService } from "@/lib/services/lesson.service";
import { createLessonSchema } from "@/lib/validators/lesson.schema";

type RouteContext = { params: Promise<{ deckId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { deckId } = await context.params;
    const lessons = await lessonService.list(await getOptionalUserId(), deckId);
    return jsonResponse(lessons);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { deckId } = await context.params;
    const body = createLessonSchema.parse(await request.json());
    const lesson = await lessonService.create(await getUserId(), deckId, body);
    return jsonResponse(lesson, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
