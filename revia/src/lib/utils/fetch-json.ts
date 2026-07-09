import type { ApiErrorBody, ApiSuccess } from "@/types/api";
import { ApiError } from "@/types/api";

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = (await res.json()) as ApiSuccess<T> | ApiErrorBody;

  if (!res.ok) {
    const err = "error" in body ? body.error : { code: "INTERNAL" as const, message: "Request failed" };
    throw new ApiError(res.status, err.code, err.message, err.field);
  }

  return (body as ApiSuccess<T>).data;
}
