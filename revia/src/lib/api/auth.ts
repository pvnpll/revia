import { createClient } from "@/lib/supabase/server";
import { isSupabaseAuthEnabled } from "@/lib/supabase/config";
import { userRepository } from "@/lib/repositories/user.repository";
import { env } from "@/lib/utils/env";
import { ApiError } from "@/types/api";

export async function getUserId(): Promise<string> {
  if (!isSupabaseAuthEnabled()) {
    return env.MOCK_USER_ID;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
  }

  await userRepository.ensureUser({
    id: user.id,
    email: user.email ?? `${user.id}@unknown.local`,
    name:
      (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null) ??
      (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null),
  });

  return user.id;
}
