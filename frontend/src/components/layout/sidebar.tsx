import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { getInitials } from "@/lib/utils";

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (!user) {
    return null;
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 text-sidebar-foreground lg:flex">
      <Brand className="px-2 text-sidebar-foreground" />

      <div className="mt-8 flex flex-1 flex-col">
        <SidebarNav />
      </div>

      <Link
        to="/profile"
        className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/5"
      >
        <Avatar className="size-8 shrink-0 border border-sidebar-border">
          <AvatarFallback className="bg-sidebar-accent-muted text-xs text-sidebar-accent">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</p>
          <p className="truncate text-xs text-sidebar-muted-foreground">{user.email}</p>
        </div>
      </Link>

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
