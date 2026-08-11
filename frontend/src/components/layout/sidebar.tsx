import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { useAuth } from "@/contexts/auth-context";

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 text-sidebar-foreground lg:flex">
      <Brand className="px-2 text-sidebar-foreground" />

      <div className="mt-8 flex flex-1 flex-col">
        <SidebarNav />
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-sidebar-muted-foreground transition-colors hover:bg-white/5 hover:text-sidebar-foreground"
      >
        <LogOut className="size-4 shrink-0" />
        Logout
      </button>
    </aside>
  );
}

export { Sidebar };
