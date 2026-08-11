import { Navigate, Outlet } from "react-router-dom";

import { LoadingState } from "@/components/common/loading-state";
import { useAuth } from "@/contexts/auth-context";

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState message="Checking your session…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export { ProtectedRoute };
