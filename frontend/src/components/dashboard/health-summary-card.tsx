import { Link } from "react-router-dom";
import { HeartPulse } from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { SectionHeader } from "@/components/common/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AsyncState } from "@/hooks/use-async-data";
import { getApiErrorMessage } from "@/lib/api-error";
import type { HealthProfileResponse } from "@/types/health";

function HealthSummaryCard({ state }: { state: AsyncState<HealthProfileResponse> }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <SectionHeader
          title="Current Health"
          actions={
            <Button asChild variant="outline" size="sm">
              <Link to="/health">
                <HeartPulse />
                Update Health
              </Link>
            </Button>
          }
        />

        {state.isLoading && (
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        )}

        {!state.isLoading && Boolean(state.error) && (
          <ErrorState
            className="py-6"
            description={getApiErrorMessage(state.error, "Couldn't load your health data.")}
          />
        )}

        {!state.isLoading && !state.error && state.data !== null && (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Weight</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {state.data.weight} <span className="text-sm font-normal text-muted-foreground">kg</span>
              </p>
            </div>
            <div className="rounded-lg bg-muted px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Height</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {state.data.height} <span className="text-sm font-normal text-muted-foreground">cm</span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { HealthSummaryCard };
