import { apiClient } from "@/lib/api-client";
import type { HealthProfileResponse, HealthProfileUpdateRequest } from "@/types/health";

/** GET /api/v1/profile/health — the caller's current weight/height. */
async function getCurrentHealth(): Promise<HealthProfileResponse> {
  const response = await apiClient.get<HealthProfileResponse>("/profile/health");
  return response.data;
}

/**
 * PUT /api/v1/profile/health — updates weight/height. The backend records the
 * previous state (and this new one) as progress history, unless both values
 * are identical to the current ones, in which case it's a no-op.
 */
async function updateHealth(data: HealthProfileUpdateRequest): Promise<HealthProfileResponse> {
  const response = await apiClient.put<HealthProfileResponse>("/profile/health", data);
  return response.data;
}

export { getCurrentHealth, updateHealth };
