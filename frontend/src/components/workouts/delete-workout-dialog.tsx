import { useState } from "react";

import { deleteWorkout } from "@/api/workout-api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { formatWorkoutType } from "@/lib/workout-labels";
import type { WorkoutResponse } from "@/types/workout";

interface DeleteWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: WorkoutResponse | null;
  onDeleted: () => void;
}

function DeleteWorkoutDialog({ open, onOpenChange, workout, onDeleted }: DeleteWorkoutDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (isDeleting) {
      return;
    }
    setError(null);
    onOpenChange(nextOpen);
  }

  async function handleConfirm() {
    if (!workout) {
      return;
    }
    setError(null);
    setIsDeleting(true);
    try {
      await deleteWorkout(workout.id);
      onDeleted();
      onOpenChange(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't delete this workout."));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete workout?</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>

        {workout && (
          <div className="rounded-lg border border-border px-4 py-3 text-sm">
            <p className="font-medium text-foreground">{formatWorkoutType(workout.workoutType)}</p>
            <p className="text-muted-foreground">
              {formatDate(workout.workoutDate)} · {workout.durationMinutes} min · {workout.caloriesBurned} kcal
            </p>
          </div>
        )}

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteWorkoutDialog };
