import { apiClient } from "@/lib/api-client";
import type { WorkoutPageResponse } from "@/types/workout";

interface GetWorkoutsParams {
  page?: number;
  size?: number;
}

/** GET /api/v1/workouts — the caller's logged workouts, newest first. */
async function getWorkouts(params: GetWorkoutsParams = {}): Promise<WorkoutPageResponse> {
  const response = await apiClient.get<WorkoutPageResponse>("/workouts", { params });
  return response.data;
}

export { getWorkouts };
