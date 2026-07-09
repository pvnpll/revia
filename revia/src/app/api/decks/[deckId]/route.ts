import { getUserId } from "@/lib/api/auth";
import { handleApiError, jsonResponse } from "@/lib/api/response";
import { deckService } from "@/lib/services/deck.service";
import { updateDeckSchema } from "@/lib/validators/deck.schema";

type RouteContext = { params: Promise<{ deckId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { deckId } = await context.params;
    const deck = await deckService.getById(getUserId(), deckId);
    return jsonResponse(deck);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { deckId } = await context.params;
    const body = updateDeckSchema.parse(await request.json());
    const deck = await deckService.update(getUserId(), deckId, body);
    return jsonResponse(deck);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { deckId } = await context.params;
    await deckService.delete(getUserId(), deckId);
    return jsonResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
