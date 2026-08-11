import { Menu } from "lucide-react";

import { Brand } from "@/components/layout/brand";

function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
      <Brand />
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-muted"
      >
        <Menu className="size-5" />
      </button>
    </header>
  );
}

export { MobileHeader };
