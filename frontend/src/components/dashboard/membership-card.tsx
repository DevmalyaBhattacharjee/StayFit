import { Link } from "react-router-dom";
import { IdCard } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionHeader } from "@/components/common/section-header";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AsyncState } from "@/hooks/use-async-data";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import type { MembershipResponse, MembershipStatus } from "@/types/membership";

const STATUS_VARIANT: Record<MembershipStatus, NonNullable<BadgeProps["variant"]>> = {
  ACTIVE: "success",
  EXPIRED: "warning",
  CANCELLED: "destructive",
};

function MembershipCard({ state }: { state: AsyncState<MembershipResponse | null> }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <SectionHeader
          title="Current Membership"
          actions={
            <Button asChild variant="outline" size="sm">
              <Link to="/membership">
                <IdCard />
                View Membership
              </Link>
            </Button>
          }
        />

        {state.isLoading && <Skeleton className="h-16" />}

        {!state.isLoading && Boolean(state.error) && (
          <ErrorState
            className="py-6"
            description={getApiErrorMessage(state.error, "Couldn't load your membership.")}
          />
        )}

        {!state.isLoading && !state.error && !state.data && (
          <EmptyState
            icon={IdCard}
            title="No active membership"
            description="Browse StayFit's membership plans to get started."
            action={
              <Button asChild size="sm" className="mt-1">
                <Link to="/membership">View Plans</Link>
              </Button>
            }
          />
        )}

        {!state.isLoading && !state.error && state.data && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg font-semibold text-foreground">{state.data.planName}</p>
              <Badge variant={STATUS_VARIANT[state.data.status]}>{state.data.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Start date</p>
                <p className="text-foreground">{formatDate(state.data.startDate)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">End date</p>
                <p className="text-foreground">{formatDate(state.data.endDate)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { MembershipCard };
