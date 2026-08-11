import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";

import { getCurrentHealth } from "@/api/health-api";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { HealthUpdateDialog } from "@/components/health/health-update-dialog";
import type { HealthUpdateResult } from "@/components/health/health-update-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsyncData } from "@/hooks/use-async-data";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

function HealthPage() {
  const health = useAsyncData(getCurrentHealth);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<{ changed: boolean } | null>(null);

  function handleOpenDialog() {
    setConfirmation(null);
    setIsDialogOpen(true);
  }

  function handleUpdated({ changed }: HealthUpdateResult) {
    setConfirmation({ changed });
    // The backend is authoritative for what actually got persisted, including
    // the no-op case — reload rather than trusting the submitted form values.
    health.refetch();
  }

  return (
    <div>
      <PageHeader
        title="Health Profile"
        description="Your current weight and height."
        actions={
          health.data && (
            <Button onClick={handleOpenDialog}>
              <Pencil />
              Update Health
            </Button>
          )
        }
      />

      {confirmation && (
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "mb-4 rounded-lg px-3 py-2 text-sm",
            confirmation.changed ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
          )}
        >
          {confirmation.changed
            ? "Health profile updated. This change has been recorded in your progress history."
            : "No changes were made — the values you submitted match your current profile."}
        </p>
      )}

      <Card>
        <CardContent className="pt-6">
          {health.isLoading && (
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          )}

          {!health.isLoading && Boolean(health.error) && (
            <ErrorState
              description={getApiErrorMessage(health.error, "Couldn't load your health profile.")}
              action={
                <Button variant="outline" size="sm" onClick={() => health.refetch()}>
                  Try again
                </Button>
              }
            />
          )}

          {!health.isLoading && !health.error && health.data && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted px-4 py-4">
                <p className="text-xs font-medium text-muted-foreground">Weight</p>
                <p className="mt-1 text-3xl font-semibold text-foreground">
                  {health.data.weight} <span className="text-base font-normal text-muted-foreground">kg</span>
                </p>
              </div>
              <div className="rounded-lg bg-muted px-4 py-4">
                <p className="text-xs font-medium text-muted-foreground">Height</p>
                <p className="mt-1 text-3xl font-semibold text-foreground">
                  {health.data.height} <span className="text-base font-normal text-muted-foreground">cm</span>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mt-4 text-sm text-muted-foreground">
        Updating your weight or height records a new entry in your{" "}
        <Link to="/progress" className="font-medium text-foreground underline underline-offset-4">
          progress history
        </Link>
        , preserving what came before.
      </p>

      {health.data && (
        <HealthUpdateDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          current={health.data}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}

export default HealthPage;
