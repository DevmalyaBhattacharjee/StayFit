import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { UseAsyncDataResult } from "@/hooks/use-async-data";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDate, formatSignedWeight } from "@/lib/format";
import type { ProgressPageResponse } from "@/types/progress";

/** Always fed a `getProgressHistory({ page: 0, size: 2 })` result — the true latest 2 records, independent of whatever page the timeline below is showing. */
function ProgressStatsSummary({ state }: { state: UseAsyncDataResult<ProgressPageResponse> }) {
  const records = state.data?.content ?? [];
  const latest = records[0];
  const previous = records[1];

  if (!state.isLoading && !state.error && records.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {state.isLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        )}

        {!state.isLoading && Boolean(state.error) && (
          <ErrorState
            className="py-6"
            description={getApiErrorMessage(state.error, "Couldn't load your progress summary.")}
            action={
              <Button variant="outline" size="sm" onClick={() => state.refetch()}>
                Try again
              </Button>
            }
          />
        )}

        {!state.isLoading && !state.error && latest && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">Current</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {latest.weight} <span className="text-sm font-normal text-muted-foreground">kg</span>
                </p>
              </div>
              {previous ? (
                <>
                  <div className="rounded-lg bg-muted px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">Previous</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {previous.weight} <span className="text-sm font-normal text-muted-foreground">kg</span>
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">Change</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {formatSignedWeight(latest.weight - previous.weight)}
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-lg bg-muted px-4 py-3 sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">Previous</p>
                  <p className="mt-1 text-sm text-foreground">First recorded entry — no previous value to compare yet.</p>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {state.data?.totalElements ?? records.length} recorded {(state.data?.totalElements ?? records.length) === 1 ? "entry" : "entries"} ·
              last updated {formatDate(latest.recordedAt)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { ProgressStatsSummary };
