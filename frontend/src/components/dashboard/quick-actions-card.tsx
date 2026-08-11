import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Dumbbell, HeartPulse, IdCard, TrendingUp } from "lucide-react";

import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent } from "@/components/ui/card";

interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
}

const quickActions: QuickAction[] = [
  { label: "Update Health", href: "/health", icon: HeartPulse },
  { label: "Log Workout", href: "/workouts", icon: Dumbbell },
  { label: "View Progress", href: "/progress", icon: TrendingUp },
  { label: "View Membership", href: "/membership", icon: IdCard },
];

function QuickActionsCard() {
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <SectionHeader title="Quick Actions" />
        <div className="flex flex-col gap-2">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              to={action.href}
              className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-muted"
            >
              <action.icon className="size-4 text-muted-foreground" />
              {action.label}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export { QuickActionsCard };
