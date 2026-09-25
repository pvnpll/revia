import { z } from "zod";

import { isValidUsernameFormat, normalizeUsername } from "@/lib/username";

export const usernameSchema = z
  .string()
  .trim()
  .transform(normalizeUsername)
  .refine(isValidUsernameFormat, {
    message: "Username must be 3–30 characters: lowercase letters, numbers, _ or -",
  });

export const updateUsernameSchema = z.object({
  username: usernameSchema,
});

export type UpdateUsernameInput = z.infer<typeof updateUsernameSchema>;
