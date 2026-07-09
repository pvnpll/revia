import { getUserId } from "@/lib/api/auth";
import { handleApiError, jsonResponse } from "@/lib/api/response";
import { cardService } from "@/lib/services/card.service";
import { updateCardSchema } from "@/lib/validators/card.schema";

type RouteContext = { params: Promise<{ deckId: string; cardId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { deckId, cardId } = await context.params;
    const card = await cardService.getById(getUserId(), deckId, cardId);
    return jsonResponse(card);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { deckId, cardId } = await context.params;
    const body = updateCardSchema.parse(await request.json());
    const card = await cardService.update(getUserId(), deckId, cardId, body);
    return jsonResponse(card);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { deckId, cardId } = await context.params;
    await cardService.delete(getUserId(), deckId, cardId);
    return jsonResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
