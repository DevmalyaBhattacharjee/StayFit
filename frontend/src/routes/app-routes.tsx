import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import DashboardPage from "@/pages/dashboard-page";
import HealthPage from "@/pages/health-page";
import LoginPage from "@/pages/login-page";
import MembershipPage from "@/pages/membership-page";
import NotFoundPage from "@/pages/not-found-page";
import ProfilePage from "@/pages/profile-page";
import ProgressPage from "@/pages/progress-page";
import RegisterPage from "@/pages/register-page";
import WorkoutsPage from "@/pages/workouts-page";
import { ProtectedRoute } from "@/routes/protected-route";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export { AppRoutes };
