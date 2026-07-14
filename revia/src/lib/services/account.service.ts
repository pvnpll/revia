import { userRepository } from "@/lib/repositories/user.repository";
import { normalizeUsername } from "@/lib/username";
import type { UpdateUsernameInput } from "@/lib/validators/username.schema";
import { ApiError } from "@/types/api";
import type { UserProfile } from "@/types/user";

export const accountService = {
  async getProfile(userId: string): Promise<UserProfile> {
    const profile = await userRepository.findById(userId);
    if (!profile) {
      throw new ApiError(404, "NOT_FOUND", "User not found");
    }
    return profile;
  },

  async syncFromAuth(input: { id: string; email: string; name?: string | null }): Promise<UserProfile> {
    await userRepository.ensureUser(input);
    return accountService.getProfile(input.id);
  },

  async resolveLoginEmail(identifier: string): Promise<string> {
    const trimmed = identifier.trim();
    if (!trimmed) {
      throw new ApiError(400, "VALIDATION", "Email or username is required");
    }

    if (trimmed.includes("@")) {
      return trimmed.toLowerCase();
    }

    const email = await userRepository.findEmailByUsername(trimmed);
    if (!email) {
      throw new ApiError(404, "NOT_FOUND", "Invalid username or password");
    }

    return email;
  },

  async updateUsername(userId: string, input: UpdateUsernameInput): Promise<UserProfile> {
    const username = normalizeUsername(input.username);
    const taken = await userRepository.isUsernameTaken(username, userId);
    if (taken) {
      throw new ApiError(409, "CONFLICT", "Username is already taken");
    }

    return userRepository.updateUsername(userId, username);
  },
};
