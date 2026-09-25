import { NextResponse } from "next/server";
import { ZodError } from "zod";

import type { ApiErrorBody, ApiSuccess } from "@/types/api";
import { ApiError } from "@/types/api";

export function jsonResponse<T>(data: T, status = 200) {
  const body: ApiSuccess<T> = { data };
  return NextResponse.json(body, { status });
}

export function apiErrorResponse(
  status: number,
  code: ApiErrorBody["error"]["code"],
  message: string,
  field?: string,
) {
  const body: ApiErrorBody = { error: { code, message, field } };
  return NextResponse.json(body, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return apiErrorResponse(error.status, error.code, error.message, error.field);
  }
  if (error instanceof ZodError) {
    const first = error.errors[0];
    return apiErrorResponse(
      400,
      "VALIDATION",
      first?.message ?? "Validation failed",
      first?.path.join("."),
    );
  }
  console.error(error);
  return apiErrorResponse(500, "INTERNAL", "Internal server error");
}
