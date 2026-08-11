import { apiClient } from "@/lib/api-client";
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types/auth";

/** POST /api/v1/auth/register — creates the account. Does not authenticate; no token is returned. */
async function register(data: RegisterRequest): Promise<User> {
  const response = await apiClient.post<User>("/auth/register", data);
  return response.data;
}

/** POST /api/v1/auth/login — verifies credentials and returns a Bearer token plus the user's profile. */
async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/login", data);
  return response.data;
}

/** GET /api/v1/auth/me — the authenticated caller's profile, resolved from the Bearer token. */
async function me(): Promise<User> {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
}

export { register, login, me };
