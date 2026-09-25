import { getUserId } from "@/lib/api/auth";
import { handleApiError, jsonResponse } from "@/lib/api/response";
import { accountService } from "@/lib/services/account.service";
import { updateUsernameSchema } from "@/lib/validators/username.schema";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAuthEnabled } from "@/lib/supabase/config";
import { env } from "@/lib/utils/env";
import { ApiError } from "@/types/api";

export async function GET() {
  try {
    const profile = await accountService.getProfile(await getUserId());
    return jsonResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = updateUsernameSchema.parse(await request.json());
    const profile = await accountService.updateUsername(await getUserId(), body);
    return jsonResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST() {
  try {
    const userId = await getUserId();

    if (!isSupabaseAuthEnabled()) {
      const profile = await accountService.syncFromAuth({
        id: userId,
        email: env.MOCK_USER_EMAIL,
        name: "Demo User",
      });
      return jsonResponse(profile);
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }

    const profile = await accountService.syncFromAuth({
      id: user.id,
      email: user.email ?? `${user.id}@unknown.local`,
      name:
        (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null) ??
        (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null),
    });

    return jsonResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
