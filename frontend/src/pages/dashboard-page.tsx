import { getCurrentHealth } from "@/api/health-api";
import { getCurrentMembership } from "@/api/membership-api";
import { getProgressHistory } from "@/api/progress-api";
import { getWorkouts } from "@/api/workout-api";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { HealthSummaryCard } from "@/components/dashboard/health-summary-card";
import { MembershipCard } from "@/components/dashboard/membership-card";
import { ProgressSummaryCard } from "@/components/dashboard/progress-summary-card";
import { QuickActionsCard } from "@/components/dashboard/quick-actions-card";
import { RecentWorkoutsCard } from "@/components/dashboard/recent-workouts-card";
import { useAuth } from "@/contexts/auth-context";
import { useAsyncData } from "@/hooks/use-async-data";

const RECENT_WORKOUTS_PAGE_SIZE = 4;
const PROGRESS_SUMMARY_PAGE_SIZE = 2;

function DashboardPage() {
  const { user } = useAuth();

  const health = useAsyncData(getCurrentHealth);
  const progress = useAsyncData(() => getProgressHistory({ page: 0, size: PROGRESS_SUMMARY_PAGE_SIZE }));
  const workouts = useAsyncData(() => getWorkouts({ page: 0, size: RECENT_WORKOUTS_PAGE_SIZE }));
  const membership = useAsyncData(getCurrentMembership);

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader user={user} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HealthSummaryCard state={health} />
        <MembershipCard state={membership} />
      </div>

      <ProgressSummaryCard state={progress} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentWorkoutsCard state={workouts} />
        </div>
        <QuickActionsCard />
      </div>
    </div>
  );
}

export default DashboardPage;
