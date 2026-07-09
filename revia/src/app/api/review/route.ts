import { getUserId } from "@/lib/api/auth";
import { handleApiError, jsonResponse } from "@/lib/api/response";
import { reviewService } from "@/lib/services/review.service";
import { submitReviewSchema } from "@/lib/validators/review.schema";

export async function POST(request: Request) {
  try {
    const body = submitReviewSchema.parse(await request.json());
    const result = await reviewService.submitReview(getUserId(), body);
    return jsonResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
