import { IdCard } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionHeader } from "@/components/common/section-header";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { UseAsyncDataResult } from "@/hooks/use-async-data";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatDate } from "@/lib/format";
import type { MembershipResponse, MembershipStatus } from "@/types/membership";

const STATUS_VARIANT: Record<MembershipStatus, NonNullable<BadgeProps["variant"]>> = {
  ACTIVE: "success",
  EXPIRED: "warning",
  CANCELLED: "destructive",
};

interface CurrentMembershipSectionProps {
  state: UseAsyncDataResult<MembershipResponse | null>;
  onCancelClick: () => void;
}

function CurrentMembershipSection({ state, onCancelClick }: CurrentMembershipSectionProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <SectionHeader title="Current Membership" />

        {state.isLoading && <Skeleton className="h-24" />}

        {!state.isLoading && Boolean(state.error) && (
          <ErrorState
            className="py-6"
            description={getApiErrorMessage(state.error, "Couldn't load your membership.")}
            action={
              <Button variant="outline" size="sm" onClick={() => state.refetch()}>
                Try again
              </Button>
            }
          />
        )}

        {!state.isLoading && !state.error && !state.data && (
          <EmptyState
            icon={IdCard}
            title="No active membership"
            description="Browse the plans below to get started."
          />
        )}

        {!state.isLoading && !state.error && state.data && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-lg font-semibold text-foreground">{state.data.planName}</p>
              <Badge variant={STATUS_VARIANT[state.data.status]}>{state.data.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Start date</p>
                <p className="text-foreground">{formatDate(state.data.startDate)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">End date</p>
                <p className="text-foreground">{formatDate(state.data.endDate)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Duration</p>
                <p className="text-foreground">{state.data.durationDays} days</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Price</p>
                <p className="text-foreground">{formatCurrency(state.data.price)}</p>
              </div>
            </div>

            {state.data.status === "ACTIVE" && (
              <div>
                <Button type="button" variant="outline" size="sm" onClick={onCancelClick}>
                  Cancel Membership
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { CurrentMembershipSection };
