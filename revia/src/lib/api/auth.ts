import { createClient } from "@/lib/supabase/server";
import { isSupabaseAuthEnabled } from "@/lib/supabase/config";
import { env } from "@/lib/utils/env";
import { ApiError } from "@/types/api";
import { cache } from "react";

const getSessionUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  return { user: session?.user ?? null, error };
});

export async function getOptionalUserId(): Promise<string | null> {
  if (!isSupabaseAuthEnabled()) {
    return env.MOCK_USER_ID;
  }

  const { user, error } = await getSessionUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

export async function getUserId(): Promise<string> {
  const userId = await getOptionalUserId();

  if (!userId) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
  }

  return userId;
}
