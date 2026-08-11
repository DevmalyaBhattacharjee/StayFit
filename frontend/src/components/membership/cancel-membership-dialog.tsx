import { useState } from "react";

import { cancelMembership } from "@/api/membership-api";
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
import type { MembershipResponse } from "@/types/membership";

interface CancelMembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membership: MembershipResponse | null;
  onCancelled: (membership: MembershipResponse) => void;
}

function CancelMembershipDialog({ open, onOpenChange, membership, onCancelled }: CancelMembershipDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (isCancelling) {
      return;
    }
    setError(null);
    onOpenChange(nextOpen);
  }

  async function handleConfirm() {
    if (!membership) {
      return;
    }
    setError(null);
    setIsCancelling(true);
    try {
      const updated = await cancelMembership(membership.id);
      onCancelled(updated);
      onOpenChange(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't cancel this membership."));
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel membership?</DialogTitle>
          <DialogDescription>
            This will cancel your current membership. Your membership record will remain in your history.
          </DialogDescription>
        </DialogHeader>

        {membership && (
          <div className="rounded-lg border border-border px-4 py-3 text-sm">
            <p className="font-medium text-foreground">{membership.planName}</p>
          </div>
        )}

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isCancelling}>
            Keep Membership
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isCancelling}>
            {isCancelling ? "Cancelling…" : "Cancel Membership"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { CancelMembershipDialog };
