import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  /** 0-based current page number, matching Spring's `Page.number`. */
  page: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

function PaginationControls({ page, totalPages, isFirst, isLast, onPrevious, onNext, className }: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <Button type="button" variant="outline" size="sm" onClick={onPrevious} disabled={isFirst}>
        <ChevronLeft />
        Previous
      </Button>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Page {page + 1} of {totalPages}
      </p>
      <Button type="button" variant="outline" size="sm" onClick={onNext} disabled={isLast}>
        Next
        <ChevronRight />
      </Button>
    </div>
  );
}

export { PaginationControls };
