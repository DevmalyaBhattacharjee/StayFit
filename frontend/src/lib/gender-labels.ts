import type { Gender } from "@/types/auth";

/** Friendly display labels for `com.stayfit.backend.entity.Gender`. */
const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

function formatGender(gender: Gender): string {
  return GENDER_LABELS[gender];
}

export { GENDER_LABELS, formatGender };
