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

  let body: ApiSuccess<T> | ApiErrorBody;
  try {
    body = (await res.json()) as ApiSuccess<T> | ApiErrorBody;
  } catch (err) {
    if (!res.ok) {
      throw new ApiError(res.status, "INTERNAL", `Server error: ${res.statusText}`);
    }
    throw new ApiError(500, "INTERNAL", "Invalid JSON response from server");
  }

  if (!res.ok) {
    const err = "error" in body ? body.error : { code: "INTERNAL" as const, message: "Request failed" };
    throw new ApiError(res.status, err.code, err.message, err.field);
  }

  return (body as ApiSuccess<T>).data;
}
