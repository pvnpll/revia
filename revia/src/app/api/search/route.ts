import { getUserId } from "@/lib/api/auth";
import { handleApiError, jsonResponse } from "@/lib/api/response";
import { searchService } from "@/lib/services/search.service";
import { searchSchema } from "@/lib/validators/search.schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchSchema.parse({
      q: searchParams.get("q") ?? "",
      limit: searchParams.get("limit") ?? undefined,
    });
    const results = await searchService.search(getUserId(), input);
    return jsonResponse(results);
  } catch (error) {
    return handleApiError(error);
  }
}
