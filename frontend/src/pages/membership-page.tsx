import { useState } from "react";
import { IdCard } from "lucide-react";

import { getCurrentMembership, getMembershipHistory, getMembershipPlans } from "@/api/membership-api";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { SectionHeader } from "@/components/common/section-header";
import { CancelMembershipDialog } from "@/components/membership/cancel-membership-dialog";
import { CurrentMembershipSection } from "@/components/membership/current-membership-section";
import { MembershipHistory } from "@/components/membership/membership-history";
import { PlanCard } from "@/components/membership/plan-card";
import { SubscribeDialog } from "@/components/membership/subscribe-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsyncData } from "@/hooks/use-async-data";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import type { MembershipPlanResponse, MembershipResponse } from "@/types/membership";

interface Feedback {
  tone: "success" | "neutral";
  message: string;
}

function MembershipPage() {
  const current = useAsyncData(getCurrentMembership);
  const plans = useAsyncData(getMembershipPlans);
  const history = useAsyncData(getMembershipHistory);

  const [subscribingPlan, setSubscribingPlan] = useState<MembershipPlanResponse | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const hasActiveMembership = current.data?.status === "ACTIVE";

  function handleSubscribeClick(plan: MembershipPlanResponse) {
    setFeedback(null);
    setSubscribingPlan(plan);
  }

  function handleSubscribed(membership: MembershipResponse) {
    setFeedback({ tone: "success", message: `You're now subscribed to the ${membership.planName} plan.` });
    current.refetch();
    history.refetch();
  }

  function handleCancelled() {
    setFeedback({ tone: "neutral", message: "Your membership has been cancelled. It remains in your history." });
    current.refetch();
    history.refetch();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Membership" description="Browse plans and manage your current membership." />

      {feedback && (
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            feedback.tone === "success" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
          )}
        >
          {feedback.message}
        </p>
      )}

      <CurrentMembershipSection state={current} onCancelClick={() => setIsCancelDialogOpen(true)} />

      <div>
        <SectionHeader title="Available Plans" description="Choose a plan that fits your goals." />

        {plans.isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
          </div>
        )}

        {!plans.isLoading && Boolean(plans.error) && (
          <ErrorState
            description={getApiErrorMessage(plans.error, "Couldn't load membership plans.")}
            action={
              <Button variant="outline" size="sm" onClick={() => plans.refetch()}>
                Try again
              </Button>
            }
          />
        )}

        {!plans.isLoading && !plans.error && plans.data && plans.data.length === 0 && (
          <EmptyState icon={IdCard} title="No membership plans available" description="Check back later." />
        )}

        {!plans.isLoading && !plans.error && plans.data && plans.data.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.data.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={Boolean(hasActiveMembership) && current.data?.planId === plan.id}
                hasActiveMembership={Boolean(hasActiveMembership)}
                isCurrentMembershipLoading={current.isLoading}
                onSubscribe={handleSubscribeClick}
              />
            ))}
          </div>
        )}
      </div>

      <MembershipHistory state={history} />

      <SubscribeDialog
        open={subscribingPlan !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSubscribingPlan(null);
          }
        }}
        plan={subscribingPlan}
        onSubscribed={handleSubscribed}
      />

      <CancelMembershipDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        membership={current.data}
        onCancelled={handleCancelled}
      />
    </div>
  );
}

export default MembershipPage;
