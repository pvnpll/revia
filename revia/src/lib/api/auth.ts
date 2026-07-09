import { env } from "@/lib/utils/env";

export function getUserId(): string {
  return env.MOCK_USER_ID;
}
