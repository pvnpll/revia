import { getUserId } from "@/lib/api/auth";
import { handleApiError, jsonResponse } from "@/lib/api/response";
import { importService } from "@/lib/services/import.service";
import { importDeckRequestSchema } from "@/lib/validators/import.schema";

export async function POST(request: Request) {
  try {
    const body = importDeckRequestSchema.parse(await request.json());
    const result = await importService.importDeck(getUserId(), body);
    return jsonResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
