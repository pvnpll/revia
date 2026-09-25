import { fetchJson } from "@/lib/utils/fetch-json";
import type { UpdateUsernameInput } from "@/lib/validators/username.schema";
import type { UserProfile } from "@/types/user";

export const accountApi = {
  getProfile(): Promise<UserProfile> {
    return fetchJson<UserProfile>("/api/account");
  },

  sync(): Promise<UserProfile> {
    return fetchJson<UserProfile>("/api/account", { method: "POST" });
  },

  updateUsername(input: UpdateUsernameInput): Promise<UserProfile> {
    return fetchJson<UserProfile>("/api/account", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  resolveLoginEmail(identifier: string): Promise<{ email: string }> {
    const params = new URLSearchParams({ identifier });
    return fetchJson<{ email: string }>(`/api/auth/resolve-email?${params.toString()}`);
  },
};
