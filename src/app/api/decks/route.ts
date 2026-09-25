import { getUserId } from "@/lib/api/auth";
import { handleApiError, jsonResponse } from "@/lib/api/response";
import { deckService } from "@/lib/services/deck.service";
import { createDeckSchema } from "@/lib/validators/deck.schema";

export async function GET() {
  try {
    const decks = await deckService.list(await getUserId());
    return jsonResponse(decks);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = createDeckSchema.parse(await request.json());
    const deck = await deckService.create(await getUserId(), body);
    return jsonResponse(deck, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
