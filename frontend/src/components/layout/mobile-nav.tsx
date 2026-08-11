import { useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

function MobileNav({ open, onClose }: MobileNavProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    onClose();
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className={cn("fixed inset-0 z-50 lg:hidden", open ? "" : "pointer-events-none")}>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 text-sidebar-foreground shadow-xl transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-2">
          <Brand className="text-sidebar-foreground" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-8 items-center justify-center rounded-lg text-sidebar-muted-foreground hover:bg-white/5 hover:text-sidebar-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-8 flex flex-1 flex-col">
          <SidebarNav onNavigate={onClose} />
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-sidebar-muted-foreground transition-colors hover:bg-white/5 hover:text-sidebar-foreground"
        >
          <LogOut className="size-4 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
}

export { MobileNav };
