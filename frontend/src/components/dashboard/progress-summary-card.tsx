import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionHeader } from "@/components/common/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AsyncState } from "@/hooks/use-async-data";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDate, formatSignedWeight } from "@/lib/format";
import type { ProgressPageResponse } from "@/types/progress";

function ProgressSummaryCard({ state }: { state: AsyncState<ProgressPageResponse> }) {
  const records = state.data?.content ?? [];
  const latest = records[0];
  const previous = records[1];

  return (
    <Card>
      <CardContent className="pt-6">
        <SectionHeader
          title="Progress Summary"
          actions={
            <Button asChild variant="outline" size="sm">
              <Link to="/progress">
                <TrendingUp />
                View Progress
              </Link>
            </Button>
          }
        />

        {state.isLoading && (
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        )}

        {!state.isLoading && Boolean(state.error) && (
          <ErrorState
            className="py-6"
            description={getApiErrorMessage(state.error, "Couldn't load your progress data.")}
          />
        )}

        {!state.isLoading && !state.error && state.data && !latest && (
          <EmptyState
            icon={TrendingUp}
            title="No progress records yet"
            description="Update your health profile to start tracking progress."
            action={
              <Button asChild size="sm" className="mt-1">
                <Link to="/health">Update Health</Link>
              </Button>
            }
          />
        )}

        {!state.isLoading && !state.error && latest && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">Current</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {latest.weight} <span className="text-sm font-normal text-muted-foreground">kg</span>
                </p>
              </div>
              {previous && (
                <div className="rounded-lg bg-muted px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">Previous</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {previous.weight} <span className="text-sm font-normal text-muted-foreground">kg</span>
                  </p>
                </div>
              )}
              {previous && (
                <div className="rounded-lg bg-muted px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">Change</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {formatSignedWeight(latest.weight - previous.weight)}
                  </p>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {state.data?.totalElements ?? records.length} recorded {records.length === 1 ? "entry" : "entries"} · last
              updated {formatDate(latest.recordedAt)}
              {!previous && " · log another update to see your trend"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { ProgressSummaryCard };
