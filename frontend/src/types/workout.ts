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

export type { WorkoutType, WorkoutResponse, WorkoutPageResponse };
