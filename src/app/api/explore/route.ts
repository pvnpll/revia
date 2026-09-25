import { getOptionalUserId } from "@/lib/api/auth";
import { handleApiError, jsonResponse } from "@/lib/api/response";
import { deckService } from "@/lib/services/deck.service";
import { exploreSchema } from "@/lib/validators/explore.schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const input = exploreSchema.parse({
      q: searchParams.get("q") ?? "",
      limit: searchParams.get("limit") ?? undefined,
    });
    const result = await deckService.explore(await getOptionalUserId(), input);
    return jsonResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
