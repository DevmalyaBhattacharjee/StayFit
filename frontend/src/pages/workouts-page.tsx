import { Dumbbell, Plus } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function WorkoutsPage() {
  return (
    <div>
      <PageHeader
        title="Workouts"
        description="Log and review your completed workout sessions."
        actions={
          <Button>
            <Plus />
            Log workout
          </Button>
        }
      />
      <Card>
        <CardContent>
          <EmptyState
            icon={Dumbbell}
            title="No workouts logged yet"
            description="Your workout sessions will appear here once you're signed in."
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default WorkoutsPage;
