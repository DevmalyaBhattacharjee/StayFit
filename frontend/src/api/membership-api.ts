import axios from "axios";

import { apiClient } from "@/lib/api-client";
import type { MembershipCreateRequest, MembershipPlanResponse, MembershipResponse } from "@/types/membership";

/** GET /api/v1/membership-plans — the currently active, subscribable plans. */
async function getMembershipPlans(): Promise<MembershipPlanResponse[]> {
  const response = await apiClient.get<MembershipPlanResponse[]>("/membership-plans");
  return response.data;
}

/** GET /api/v1/memberships/current — the caller's active membership, or `null` if they have none (backend returns 404). */
async function getCurrentMembership(): Promise<MembershipResponse | null> {
  try {
    const response = await apiClient.get<MembershipResponse>("/memberships/current");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/** GET /api/v1/memberships — the caller's full membership history, newest first. Not paginated — the backend returns a plain array. */
async function getMembershipHistory(): Promise<MembershipResponse[]> {
  const response = await apiClient.get<MembershipResponse[]>("/memberships");
  return response.data;
}

/** POST /api/v1/memberships — subscribes the caller to a plan. The backend derives start/end dates and status; ownership comes from the JWT. */
async function subscribeToMembership(membershipPlanId: number): Promise<MembershipResponse> {
  const payload: MembershipCreateRequest = { membershipPlanId };
  const response = await apiClient.post<MembershipResponse>("/memberships", payload);
  return response.data;
}

/** POST /api/v1/memberships/{id}/cancel — cancels one of the caller's own memberships. The record is retained, not deleted. */
async function cancelMembership(id: number): Promise<MembershipResponse> {
  const response = await apiClient.post<MembershipResponse>(`/memberships/${id}/cancel`);
  return response.data;
}

export { getMembershipPlans, getCurrentMembership, getMembershipHistory, subscribeToMembership, cancelMembership };
