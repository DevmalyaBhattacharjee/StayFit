import type { WorkoutType } from "@/types/workout";

/** Friendly display labels for `com.stayfit.backend.entity.WorkoutType`. The backend value itself is always what's sent/stored. */
const WORKOUT_TYPE_LABELS: Record<WorkoutType, string> = {
  STRENGTH: "Strength",
  CARDIO: "Cardio",
  FLEXIBILITY: "Flexibility",
  HIIT: "HIIT",
  SPORTS: "Sports",
  OTHER: "Other",
};

const WORKOUT_TYPE_OPTIONS: { value: WorkoutType; label: string }[] = (
  Object.keys(WORKOUT_TYPE_LABELS) as WorkoutType[]
).map((value) => ({ value, label: WORKOUT_TYPE_LABELS[value] }));

function formatWorkoutType(type: WorkoutType): string {
  return WORKOUT_TYPE_LABELS[type];
}

export { WORKOUT_TYPE_LABELS, WORKOUT_TYPE_OPTIONS, formatWorkoutType };
