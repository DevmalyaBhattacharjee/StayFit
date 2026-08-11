import axios from "axios";

import { apiClient } from "@/lib/api-client";
import type { MembershipResponse } from "@/types/membership";

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

export { getCurrentMembership };
