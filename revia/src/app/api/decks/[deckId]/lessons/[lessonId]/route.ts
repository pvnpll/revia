import { getUserId } from "@/lib/api/auth";
import { handleApiError, jsonResponse } from "@/lib/api/response";
import { lessonService } from "@/lib/services/lesson.service";
import { updateLessonSchema } from "@/lib/validators/lesson.schema";

type RouteContext = { params: Promise<{ deckId: string; lessonId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { deckId, lessonId } = await context.params;
    const lesson = await lessonService.getById(getUserId(), deckId, lessonId);
    return jsonResponse(lesson);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { deckId, lessonId } = await context.params;
    const body = updateLessonSchema.parse(await request.json());
    const lesson = await lessonService.update(getUserId(), deckId, lessonId, body);
    return jsonResponse(lesson);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { deckId, lessonId } = await context.params;
    await lessonService.delete(getUserId(), deckId, lessonId);
    return jsonResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
