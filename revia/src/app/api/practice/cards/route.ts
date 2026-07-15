import { getUserId } from "@/lib/api/auth";
import { handleApiError, jsonResponse } from "@/lib/api/response";
import { practiceService } from "@/lib/services/practice.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get("deckId") ?? undefined;
    const lessonId = searchParams.get("lessonId") ?? undefined;

    const cards = await practiceService.getCards(await getUserId(), {
      deckId,
      lessonId,
    });

    return jsonResponse({ cards });
  } catch (error) {
    return handleApiError(error);
  }
}
