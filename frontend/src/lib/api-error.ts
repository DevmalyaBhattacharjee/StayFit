import axios from "axios";

import type { ApiErrorResponse } from "@/types/auth";

/** Extracts the backend's `ApiError.message`, falling back for network/unexpected errors. */
function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
}

/** Extracts the backend's `ApiError.fieldErrors` (per-field validation messages), if present. */
function getApiFieldErrors(error: unknown): Record<string, string> | null {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.fieldErrors ?? null;
  }
  return null;
}

export { getApiErrorMessage, getApiFieldErrors };
