import { Clock, Dumbbell, Flame, Pencil, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PaginationControls } from "@/components/common/pagination-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { UseAsyncDataResult } from "@/hooks/use-async-data";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { formatWorkoutType } from "@/lib/workout-labels";
import type { WorkoutPageResponse, WorkoutResponse } from "@/types/workout";

interface WorkoutListProps {
  state: UseAsyncDataResult<WorkoutPageResponse>;
  onPageChange: (page: number) => void;
  onAddWorkout: () => void;
  onEdit: (workout: WorkoutResponse) => void;
  onDelete: (workout: WorkoutResponse) => void;
}

function WorkoutList({ state, onPageChange, onAddWorkout, onEdit, onDelete }: WorkoutListProps) {
  const page = state.data;
  const workouts = page?.content ?? [];

  return (
    <div>
      {state.isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      )}

      {!state.isLoading && Boolean(state.error) && (
        <ErrorState
          description={getApiErrorMessage(state.error, "Couldn't load your workouts.")}
          action={
            <Button variant="outline" size="sm" onClick={() => state.refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {!state.isLoading && !state.error && page && workouts.length === 0 && (
        <EmptyState
          icon={Dumbbell}
          title="No workouts yet"
          description="Log your first workout to start tracking your activity."
          action={
            <Button size="sm" className="mt-1" onClick={onAddWorkout}>
              Log Workout
            </Button>
          }
        />
      )}

      {!state.isLoading && !state.error && page && workouts.length > 0 && (
        <>
          <ul className="flex flex-col gap-3">
            {workouts.map((workout) => (
              <li key={workout.id} className="rounded-lg border border-border px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{formatWorkoutType(workout.workoutType)}</Badge>
                    <span className="text-sm font-medium text-foreground">{formatDate(workout.workoutDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(workout)}
                      aria-label={`Edit ${formatWorkoutType(workout.workoutType)} workout from ${formatDate(workout.workoutDate)}`}
                    >
                      <Pencil />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(workout)}
                      aria-label={`Delete ${formatWorkoutType(workout.workoutType)} workout from ${formatDate(workout.workoutDate)}`}
                    >
                      <Trash2 />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {workout.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="size-3.5" />
                    {workout.caloriesBurned} kcal
                  </span>
                </div>

                {workout.notes && <p className="mt-2 text-sm text-muted-foreground">{workout.notes}</p>}
              </li>
            ))}
          </ul>

          <PaginationControls
            className="mt-6"
            page={page.number}
            totalPages={page.totalPages}
            isFirst={page.first}
            isLast={page.last}
            onPrevious={() => onPageChange(page.number - 1)}
            onNext={() => onPageChange(page.number + 1)}
          />
        </>
      )}
    </div>
  );
}

export { WorkoutList };
