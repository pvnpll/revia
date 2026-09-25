import { getOptionalUserId, getUserId } from "@/lib/api/auth";
import { handleApiError, jsonResponse } from "@/lib/api/response";
import { cardService } from "@/lib/services/card.service";
import { createCardSchema } from "@/lib/validators/card.schema";

type RouteContext = { params: Promise<{ deckId: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { deckId } = await context.params;
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId") ?? undefined;
    const cards = await cardService.list(await getOptionalUserId(), deckId, { lessonId });
    return jsonResponse(cards);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { deckId } = await context.params;
    const body = createCardSchema.parse(await request.json());
    const card = await cardService.create(await getUserId(), deckId, body);
    return jsonResponse(card, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
