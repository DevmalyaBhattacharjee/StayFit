import { useState } from "react";
import { Plus } from "lucide-react";

import { getWorkouts } from "@/api/workout-api";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteWorkoutDialog } from "@/components/workouts/delete-workout-dialog";
import { WorkoutFormDialog } from "@/components/workouts/workout-form-dialog";
import { WorkoutList } from "@/components/workouts/workout-list";
import { useAsyncData } from "@/hooks/use-async-data";
import type { WorkoutResponse } from "@/types/workout";

const WORKOUTS_PAGE_SIZE = 10;

function WorkoutsPage() {
  const [page, setPage] = useState(0);
  const list = useAsyncData(() => getWorkouts({ page, size: WORKOUTS_PAGE_SIZE }), [page]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutResponse | null>(null);
  const [deletingWorkout, setDeletingWorkout] = useState<WorkoutResponse | null>(null);

  function handlePageChange(nextPage: number) {
    const totalPages = list.data?.totalPages ?? 1;
    if (nextPage < 0 || nextPage >= totalPages) {
      return;
    }
    setPage(nextPage);
  }

  function handleAddWorkout() {
    setEditingWorkout(null);
    setIsFormOpen(true);
  }

  function handleEditWorkout(workout: WorkoutResponse) {
    setEditingWorkout(workout);
    setIsFormOpen(true);
  }

  function handleSaved() {
    // A new workout may land on page 0 (newest-first ordering) — jump there so it's visible.
    if (!editingWorkout && page !== 0) {
      setPage(0);
    } else {
      list.refetch();
    }
  }

  function handleDeleted() {
    const remainingOnPage = (list.data?.numberOfElements ?? 0) - 1;
    if (remainingOnPage <= 0 && page > 0) {
      setPage((current) => current - 1);
    } else {
      list.refetch();
    }
  }

  return (
    <div>
      <PageHeader
        title="Workouts"
        description="Log and review your completed workout sessions."
        actions={
          <Button onClick={handleAddWorkout}>
            <Plus />
            Log workout
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <WorkoutList
            state={list}
            onPageChange={handlePageChange}
            onAddWorkout={handleAddWorkout}
            onEdit={handleEditWorkout}
            onDelete={setDeletingWorkout}
          />
        </CardContent>
      </Card>

      <WorkoutFormDialog
        key={editingWorkout ? `edit-${editingWorkout.id}` : "create"}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        workout={editingWorkout}
        onSaved={handleSaved}
      />

      <DeleteWorkoutDialog
        open={deletingWorkout !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingWorkout(null);
          }
        }}
        workout={deletingWorkout}
        onDeleted={handleDeleted}
      />
    </div>
  );
}

export default WorkoutsPage;
