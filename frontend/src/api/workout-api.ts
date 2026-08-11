import { apiClient } from "@/lib/api-client";
import type { WorkoutCreateRequest, WorkoutPageResponse, WorkoutResponse, WorkoutUpdateRequest } from "@/types/workout";

interface GetWorkoutsParams {
  page?: number;
  size?: number;
}

/** GET /api/v1/workouts — the caller's logged workouts, newest first. */
async function getWorkouts(params: GetWorkoutsParams = {}): Promise<WorkoutPageResponse> {
  const response = await apiClient.get<WorkoutPageResponse>("/workouts", { params });
  return response.data;
}

/** POST /api/v1/workouts — logs a new workout for the authenticated caller (ownership comes from the JWT, never from the request). */
async function createWorkout(data: WorkoutCreateRequest): Promise<WorkoutResponse> {
  const response = await apiClient.post<WorkoutResponse>("/workouts", data);
  return response.data;
}

/** PUT /api/v1/workouts/{id} — updates one of the caller's own workouts. */
async function updateWorkout(id: number, data: WorkoutUpdateRequest): Promise<WorkoutResponse> {
  const response = await apiClient.put<WorkoutResponse>(`/workouts/${id}`, data);
  return response.data;
}

/** DELETE /api/v1/workouts/{id} — deletes one of the caller's own workouts. */
async function deleteWorkout(id: number): Promise<void> {
  await apiClient.delete(`/workouts/${id}`);
}

export { getWorkouts, createWorkout, updateWorkout, deleteWorkout };
