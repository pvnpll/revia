import { handleApiError, jsonResponse } from "@/lib/api/response";
import { accountService } from "@/lib/services/account.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get("identifier") ?? "";
    const email = await accountService.resolveLoginEmail(identifier);
    return jsonResponse({ email });
  } catch (error) {
    return handleApiError(error);
  }
}
