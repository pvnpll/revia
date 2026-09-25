import { getUserId } from "@/lib/api/auth";
import { handleApiError, jsonResponse } from "@/lib/api/response";
import { feedbackService } from "@/lib/services/feedback.service";
import { feedbackSchema } from "@/lib/validators/feedback.schema";

export async function POST(request: Request) {
  try {
    const body = feedbackSchema.parse(await request.json());
    const result = await feedbackService.submit(await getUserId(), body);
    return jsonResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
