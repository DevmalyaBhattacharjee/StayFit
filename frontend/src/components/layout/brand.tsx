import { Flame } from "lucide-react";

import { cn } from "@/lib/utils";

function Brand({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Flame className="size-5" />
      </span>
      <span className="text-lg font-semibold tracking-tight">StayFit</span>
    </div>
  );
}

export { Brand };
