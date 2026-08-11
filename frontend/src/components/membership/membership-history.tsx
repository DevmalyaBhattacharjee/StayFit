import { History } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionHeader } from "@/components/common/section-header";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { UseAsyncDataResult } from "@/hooks/use-async-data";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import type { MembershipResponse, MembershipStatus } from "@/types/membership";

const STATUS_VARIANT: Record<MembershipStatus, NonNullable<BadgeProps["variant"]>> = {
  ACTIVE: "success",
  EXPIRED: "warning",
  CANCELLED: "destructive",
};

/** Backend `GET /memberships` returns a plain array (not a `Page`), so this list is never paginated. */
function MembershipHistory({ state }: { state: UseAsyncDataResult<MembershipResponse[]> }) {
  const history = state.data ?? [];

  return (
    <Card>
      <CardContent className="pt-6">
        <SectionHeader title="Membership History" description="Newest first." />

        {state.isLoading && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        )}

        {!state.isLoading && Boolean(state.error) && (
          <ErrorState
            className="py-6"
            description={getApiErrorMessage(state.error, "Couldn't load your membership history.")}
            action={
              <Button variant="outline" size="sm" onClick={() => state.refetch()}>
                Try again
              </Button>
            }
          />
        )}

        {!state.isLoading && !state.error && history.length === 0 && (
          <EmptyState icon={History} title="No membership history yet" description="Subscribe to a plan to get started." />
        )}

        {!state.isLoading && !state.error && history.length > 0 && (
          <ul className="flex flex-col gap-3">
            {history.map((membership) => (
              <li
                key={membership.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-foreground">{membership.planName}</p>
                  <Badge variant={STATUS_VARIANT[membership.status]}>{membership.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(membership.startDate)} – {formatDate(membership.endDate)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export { MembershipHistory };
