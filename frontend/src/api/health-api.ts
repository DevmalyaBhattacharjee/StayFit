import { apiClient } from "@/lib/api-client";
import type { HealthProfileResponse } from "@/types/health";

/** GET /api/v1/profile/health — the caller's current weight/height. */
async function getCurrentHealth(): Promise<HealthProfileResponse> {
  const response = await apiClient.get<HealthProfileResponse>("/profile/health");
  return response.data;
}

export { getCurrentHealth };
