/** Mirrors `com.stayfit.backend.dto.HealthProfileResponse`. */
interface HealthProfileResponse {
  userId: number;
  weight: number;
  height: number;
}

/** Mirrors `com.stayfit.backend.dto.HealthProfileUpdateRequest` (weight/height: required, positive, weight <= 500, height <= 300). */
interface HealthProfileUpdateRequest {
  weight: number;
  height: number;
}

export type { HealthProfileResponse, HealthProfileUpdateRequest };
