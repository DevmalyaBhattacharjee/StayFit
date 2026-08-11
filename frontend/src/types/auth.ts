/** Mirrors `com.stayfit.backend.entity.Gender`. */
type Gender = "MALE" | "FEMALE" | "OTHER";

/** Mirrors `com.stayfit.backend.dto.UserResponse`. Never carries a password/hash. */
interface User {
  id: number;
  name: string;
  email: string;
  dateOfBirth: string;
  gender: Gender;
  height: number;
  weight: number;
  createdAt: string;
  enabled: boolean;
}

/** Mirrors `com.stayfit.backend.dto.LoginRequest`. */
interface LoginRequest {
  email: string;
  password: string;
}

/** Mirrors `com.stayfit.backend.dto.RegisterRequest`. */
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  dateOfBirth: string;
  gender: Gender;
  height: number;
  weight: number;
}

/** Mirrors `com.stayfit.backend.dto.AuthResponse`, returned only by `POST /auth/login`. */
interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

/** Mirrors `com.stayfit.backend.exception.ApiError`, the shape of every error response. */
interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: Record<string, string> | null;
}

export type { Gender, User, LoginRequest, RegisterRequest, AuthResponse, ApiErrorResponse };
