import { apiClient } from "@/lib/api-client";
import type { ProgressPageResponse } from "@/types/progress";

interface GetProgressHistoryParams {
  page?: number;
  size?: number;
}

/** GET /api/v1/progress — the caller's historical health snapshots, newest first. */
async function getProgressHistory(params: GetProgressHistoryParams = {}): Promise<ProgressPageResponse> {
  const response = await apiClient.get<ProgressPageResponse>("/progress", { params });
  return response.data;
}

export { getProgressHistory };
