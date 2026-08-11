import { useState } from "react";
import type * as React from "react";

import { updateHealth } from "@/api/health-api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api-error";
import type { HealthProfileResponse } from "@/types/health";

interface HealthUpdateResult {
  profile: HealthProfileResponse;
  /** False when the submitted values matched the current profile exactly (a backend no-op). */
  changed: boolean;
}

interface HealthUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: HealthProfileResponse;
  onUpdated: (result: HealthUpdateResult) => void;
}

function HealthUpdateDialog({ open, onOpenChange, current, onUpdated }: HealthUpdateDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }
    setError(null);
    setFieldErrors(null);
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors(null);

    const formData = new FormData(event.currentTarget);
    const weight = Number(formData.get("weight"));
    const height = Number(formData.get("height"));

    setIsSubmitting(true);
    try {
      const profile = await updateHealth({ weight, height });
      const changed = profile.weight !== current.weight || profile.height !== current.height;
      onUpdated({ profile, changed });
      onOpenChange(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't update your health profile."));
      setFieldErrors(getApiFieldErrors(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update health profile</DialogTitle>
          <DialogDescription>
            Changing your weight or height records a new entry in your progress history.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                defaultValue={current.weight}
                min={0.1}
                max={500}
                step="0.1"
                required
                aria-invalid={Boolean(fieldErrors?.weight)}
                aria-describedby={fieldErrors?.weight ? "weight-error" : undefined}
              />
              {fieldErrors?.weight && (
                <p id="weight-error" className="text-xs text-destructive">
                  {fieldErrors.weight}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                defaultValue={current.height}
                min={0.1}
                max={300}
                step="0.1"
                required
                aria-invalid={Boolean(fieldErrors?.height)}
                aria-describedby={fieldErrors?.height ? "height-error" : undefined}
              />
              {fieldErrors?.height && (
                <p id="height-error" className="text-xs text-destructive">
                  {fieldErrors.height}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { HealthUpdateDialog };
export type { HealthUpdateResult };
