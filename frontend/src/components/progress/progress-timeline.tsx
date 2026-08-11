import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PaginationControls } from "@/components/common/pagination-controls";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { UseAsyncDataResult } from "@/hooks/use-async-data";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProgressPageResponse } from "@/types/progress";

interface ProgressTimelineProps {
  state: UseAsyncDataResult<ProgressPageResponse>;
  onPageChange: (page: number) => void;
}

function ProgressTimeline({ state, onPageChange }: ProgressTimelineProps) {
  const page = state.data;
  const records = page?.content ?? [];

  return (
    <div>
      {state.isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      )}

      {!state.isLoading && Boolean(state.error) && (
        <ErrorState
          description={getApiErrorMessage(state.error, "Couldn't load your progress history.")}
          action={
            <Button variant="outline" size="sm" onClick={() => state.refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {!state.isLoading && !state.error && page && records.length === 0 && (
        <EmptyState
          icon={TrendingUp}
          title="No progress recorded yet"
          description="Update your health profile to start tracking your progress."
          action={
            <Button asChild size="sm" className="mt-1">
              <Link to="/health">Update Health</Link>
            </Button>
          }
        />
      )}

      {!state.isLoading && !state.error && page && records.length > 0 && (
        <>
          <ul className="flex flex-col">
            {records.map((record, index) => {
              const isLast = index === records.length - 1;
              return (
                <li key={record.id} className="relative flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className="mt-1.5 size-3 shrink-0 rounded-full border-2 border-primary bg-card"
                      aria-hidden="true"
                    />
                    {!isLast && <span className="w-px flex-1 bg-border" aria-hidden="true" />}
                  </div>
                  <div className={cn("flex-1", !isLast && "pb-6")}>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(record.recordedAt)}{" "}
                      <span className="font-normal text-muted-foreground">· {formatTime(record.recordedAt)}</span>
                    </p>
                    <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                      <span>{record.weight} kg</span>
                      <span>{record.height} cm</span>
                    </div>
                  </div>
                </li>
              );
            })}
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

export { ProgressTimeline };
