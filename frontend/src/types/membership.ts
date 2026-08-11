/** Mirrors `com.stayfit.backend.entity.MembershipStatus`. */
type MembershipStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

/** Mirrors `com.stayfit.backend.dto.MembershipResponse`. */
interface MembershipResponse {
  id: number;
  planId: number;
  planName: string;
  planDescription: string;
  durationDays: number;
  price: number;
  startDate: string;
  endDate: string;
  status: MembershipStatus;
  createdAt: string;
  updatedAt: string;
}

/** Mirrors `com.stayfit.backend.dto.MembershipPlanResponse`. */
interface MembershipPlanResponse {
  id: number;
  name: string;
  description: string;
  durationDays: number;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type { MembershipStatus, MembershipResponse, MembershipPlanResponse };
