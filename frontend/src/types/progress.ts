import type { PageResponse } from "@/types/pagination";

/** Mirrors `com.stayfit.backend.dto.ProgressRecordResponse`. */
interface ProgressRecordResponse {
  id: number;
  recordedAt: string;
  weight: number;
  height: number;
  createdAt: string;
}

/** The JSON shape of `GET /api/v1/progress` — a `Page<ProgressRecordResponse>`. */
type ProgressPageResponse = PageResponse<ProgressRecordResponse>;

export type { ProgressRecordResponse, ProgressPageResponse };
