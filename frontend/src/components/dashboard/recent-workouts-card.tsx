import { Link } from "react-router-dom";
import { Clock, Dumbbell, Flame, Plus } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionHeader } from "@/components/common/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AsyncState } from "@/hooks/use-async-data";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import type { WorkoutPageResponse } from "@/types/workout";

function RecentWorkoutsCard({ state }: { state: AsyncState<WorkoutPageResponse> }) {
  const workouts = state.data?.content ?? [];

  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <SectionHeader
          title="Recent Workouts"
          actions={
            <>
              <Button asChild variant="outline" size="sm">
                <Link to="/workouts">
                  <Plus />
                  Add workout
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/workouts">View all</Link>
              </Button>
            </>
          }
        />

        {state.isLoading && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        )}

        {!state.isLoading && Boolean(state.error) && (
          <ErrorState className="py-6" description={getApiErrorMessage(state.error, "Couldn't load your workouts.")} />
        )}

        {!state.isLoading && !state.error && workouts.length === 0 && (
          <EmptyState
            icon={Dumbbell}
            title="No workouts yet"
            description="Log your first workout to start tracking your training."
            action={
              <Button asChild size="sm" className="mt-1">
                <Link to="/workouts">Log a workout</Link>
              </Button>
            }
          />
        )}

        {!state.isLoading && !state.error && workouts.length > 0 && (
          <ul className="flex flex-col gap-3">
            {workouts.map((workout) => (
              <li
                key={workout.id}
                className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{workout.workoutType}</Badge>
                  <span className="text-sm text-muted-foreground">{formatDate(workout.workoutDate)}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {workout.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="size-3.5" />
                    {workout.caloriesBurned} kcal
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export { RecentWorkoutsCard };
