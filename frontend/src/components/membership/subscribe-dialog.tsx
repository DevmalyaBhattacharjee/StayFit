import { useState } from "react";

import { subscribeToMembership } from "@/api/membership-api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency } from "@/lib/format";
import type { MembershipPlanResponse, MembershipResponse } from "@/types/membership";

interface SubscribeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: MembershipPlanResponse | null;
  onSubscribed: (membership: MembershipResponse) => void;
}

function SubscribeDialog({ open, onOpenChange, plan, onSubscribed }: SubscribeDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }
    setError(null);
    onOpenChange(nextOpen);
  }

  async function handleConfirm() {
    if (!plan) {
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const membership = await subscribeToMembership(plan.id);
      onSubscribed(membership);
      onOpenChange(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't subscribe to this plan."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm subscription</DialogTitle>
          <DialogDescription>Review what you're about to subscribe to.</DialogDescription>
        </DialogHeader>

        {plan && (
          <div className="rounded-lg border border-border px-4 py-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{plan.name}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{formatCurrency(plan.price)}</p>
            <p className="text-sm text-muted-foreground">{plan.durationDays} days</p>
          </div>
        )}

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isSubmitting || !plan}>
            {isSubmitting ? "Subscribing…" : "Confirm subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { SubscribeDialog };
