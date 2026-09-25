import { getUserId } from "@/lib/api/auth";
import { handleApiError, jsonResponse } from "@/lib/api/response";
import { reviewService } from "@/lib/services/review.service";
import { getDueReviewCardsSchema } from "@/lib/validators/review.schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const input = getDueReviewCardsSchema.parse({
      deckId: searchParams.get("deckId") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });
    const queue = await reviewService.getDueCards(await getUserId(), input);
    return jsonResponse(queue);
  } catch (error) {
    return handleApiError(error);
  }
}
