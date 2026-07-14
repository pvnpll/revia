import { getUserId } from "@/lib/api/auth";
import { handleApiError, jsonResponse } from "@/lib/api/response";
import { deckService } from "@/lib/services/deck.service";

type RouteContext = { params: Promise<{ deckId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { deckId } = await context.params;
    const deck = await deckService.importPublicDeck(await getUserId(), deckId);
    return jsonResponse(deck, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
