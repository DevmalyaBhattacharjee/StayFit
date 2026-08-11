import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { MembershipPlanResponse } from "@/types/membership";

interface PlanCardProps {
  plan: MembershipPlanResponse;
  isCurrentPlan: boolean;
  hasActiveMembership: boolean;
  isCurrentMembershipLoading: boolean;
  onSubscribe: (plan: MembershipPlanResponse) => void;
}

function PlanCard({ plan, isCurrentPlan, hasActiveMembership, isCurrentMembershipLoading, onSubscribe }: PlanCardProps) {
  const disabled = isCurrentMembershipLoading || isCurrentPlan || hasActiveMembership;

  return (
    <Card className={cn("flex h-full flex-col", isCurrentPlan && "border-primary")}>
      <CardContent className="flex flex-1 flex-col gap-4 pt-6">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{plan.name}</p>
          {isCurrentPlan && (
            <Badge variant="success">
              <Check className="size-3" />
              Current Plan
            </Badge>
          )}
        </div>

        <div>
          <p className="text-3xl font-semibold text-foreground">{formatCurrency(plan.price)}</p>
          <p className="text-sm text-muted-foreground">{plan.durationDays} days</p>
        </div>

        {plan.description && <p className="flex-1 text-sm text-muted-foreground">{plan.description}</p>}

        <div className="mt-auto flex flex-col gap-2">
          <Button
            className="w-full"
            disabled={disabled}
            onClick={() => onSubscribe(plan)}
            aria-label={isCurrentPlan ? `${plan.name} is your current plan` : `Subscribe to ${plan.name} plan`}
          >
            {isCurrentPlan ? "Current Plan" : "Subscribe"}
          </Button>
          {!isCurrentPlan && hasActiveMembership && (
            <p className="text-xs text-muted-foreground">Cancel your current membership to switch plans.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { PlanCard };
