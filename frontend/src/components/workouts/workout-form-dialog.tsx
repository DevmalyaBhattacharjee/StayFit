import { useState } from "react";
import type * as React from "react";

import { createWorkout, updateWorkout } from "@/api/workout-api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api-error";
import { WORKOUT_TYPE_OPTIONS } from "@/lib/workout-labels";
import type { WorkoutResponse, WorkoutType } from "@/types/workout";

interface WorkoutFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present => edit this workout. Absent/null => create a new one. */
  workout?: WorkoutResponse | null;
  onSaved: () => void;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function WorkoutFormDialog({ open, onOpenChange, workout, onSaved }: WorkoutFormDialogProps) {
  const isEditMode = Boolean(workout);
  const [workoutType, setWorkoutType] = useState<WorkoutType | "">(workout?.workoutType ?? "");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }
    setError(null);
    setFieldErrors(null);
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors(null);

    if (!workoutType) {
      setError("Please fix the highlighted fields.");
      setFieldErrors({ workoutType: "Workout type is required." });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const workoutDate = String(formData.get("workoutDate") ?? "");
    const durationMinutes = Number(formData.get("durationMinutes"));
    const caloriesBurned = Number(formData.get("caloriesBurned"));
    const notesRaw = String(formData.get("notes") ?? "").trim();
    const notes = notesRaw === "" ? null : notesRaw;
    const payload = { workoutDate, workoutType, durationMinutes, caloriesBurned, notes };

    setIsSubmitting(true);
    try {
      if (workout) {
        await updateWorkout(workout.id, payload);
      } else {
        await createWorkout(payload);
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(getApiErrorMessage(err, isEditMode ? "Couldn't update this workout." : "Couldn't log this workout."));
      setFieldErrors(getApiFieldErrors(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit workout" : "Log a workout"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details of this workout session." : "Record a completed workout session."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="workoutDate">Date</Label>
              <Input
                id="workoutDate"
                name="workoutDate"
                type="date"
                defaultValue={workout?.workoutDate ?? todayIsoDate()}
                max={todayIsoDate()}
                required
                aria-invalid={Boolean(fieldErrors?.workoutDate)}
                aria-describedby={fieldErrors?.workoutDate ? "workoutDate-error" : undefined}
              />
              {fieldErrors?.workoutDate && (
                <p id="workoutDate-error" className="text-xs text-destructive">
                  {fieldErrors.workoutDate}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="workoutType">Type</Label>
              <Select value={workoutType} onValueChange={(value) => setWorkoutType(value as WorkoutType)}>
                <SelectTrigger id="workoutType" aria-invalid={Boolean(fieldErrors?.workoutType)}>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {WORKOUT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors?.workoutType && <p className="text-xs text-destructive">{fieldErrors.workoutType}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="durationMinutes">Duration (min)</Label>
              <Input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                defaultValue={workout?.durationMinutes}
                min={1}
                max={600}
                step={1}
                required
                aria-invalid={Boolean(fieldErrors?.durationMinutes)}
                aria-describedby={fieldErrors?.durationMinutes ? "duration-error" : undefined}
              />
              {fieldErrors?.durationMinutes && (
                <p id="duration-error" className="text-xs text-destructive">
                  {fieldErrors.durationMinutes}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="caloriesBurned">Calories (kcal)</Label>
              <Input
                id="caloriesBurned"
                name="caloriesBurned"
                type="number"
                defaultValue={workout?.caloriesBurned}
                min={0}
                max={10000}
                step={1}
                required
                aria-invalid={Boolean(fieldErrors?.caloriesBurned)}
                aria-describedby={fieldErrors?.caloriesBurned ? "calories-error" : undefined}
              />
              {fieldErrors?.caloriesBurned && (
                <p id="calories-error" className="text-xs text-destructive">
                  {fieldErrors.caloriesBurned}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={workout?.notes ?? ""}
              maxLength={500}
              rows={3}
              placeholder="How did it go?"
              aria-invalid={Boolean(fieldErrors?.notes)}
              aria-describedby={fieldErrors?.notes ? "notes-error" : undefined}
            />
            {fieldErrors?.notes && (
              <p id="notes-error" className="text-xs text-destructive">
                {fieldErrors.notes}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : isEditMode ? "Save changes" : "Log workout"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { WorkoutFormDialog };
