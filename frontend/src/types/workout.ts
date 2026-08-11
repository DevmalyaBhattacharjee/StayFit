import type { PageResponse } from "@/types/pagination";

/** Mirrors `com.stayfit.backend.entity.WorkoutType`. */
type WorkoutType = "STRENGTH" | "CARDIO" | "FLEXIBILITY" | "HIIT" | "SPORTS" | "OTHER";

/** Mirrors `com.stayfit.backend.dto.WorkoutResponse`. */
interface WorkoutResponse {
  id: number;
  workoutDate: string;
  workoutType: WorkoutType;
  durationMinutes: number;
  caloriesBurned: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** The JSON shape of `GET /api/v1/workouts` — a `Page<WorkoutResponse>`. */
type WorkoutPageResponse = PageResponse<WorkoutResponse>;

/** Mirrors `com.stayfit.backend.dto.WorkoutCreateRequest` (durationMinutes: 1-600, caloriesBurned: 0-10000, notes: optional, max 500 chars). */
interface WorkoutCreateRequest {
  workoutDate: string;
  workoutType: WorkoutType;
  durationMinutes: number;
  caloriesBurned: number;
  notes: string | null;
}

/** Mirrors `com.stayfit.backend.dto.WorkoutUpdateRequest` — identical shape/validation to `WorkoutCreateRequest`. */
type WorkoutUpdateRequest = WorkoutCreateRequest;

export type { WorkoutType, WorkoutResponse, WorkoutPageResponse, WorkoutCreateRequest, WorkoutUpdateRequest };
