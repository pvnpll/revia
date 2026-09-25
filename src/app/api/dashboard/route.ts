import { getUserId } from "@/lib/api/auth";
import { handleApiError, jsonResponse } from "@/lib/api/response";
import { dashboardService } from "@/lib/services/dashboard.service";

export async function GET() {
  try {
    const summary = await dashboardService.getSummary(await getUserId());
    return jsonResponse(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
