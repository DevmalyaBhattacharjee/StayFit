import { Link } from "react-router-dom";
import { ArrowRight, Dumbbell, HeartPulse, IdCard, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const modules = [
  {
    title: "Health",
    description: "View and update your current weight and height.",
    href: "/health",
    icon: HeartPulse,
  },
  {
    title: "Progress",
    description: "See how your health metrics have changed over time.",
    href: "/progress",
    icon: TrendingUp,
  },
  {
    title: "Workouts",
    description: "Log and review your completed workout sessions.",
    href: "/workouts",
    icon: Dumbbell,
  },
  {
    title: "Membership",
    description: "Browse plans and manage your current membership.",
    href: "/membership",
    icon: IdCard,
  },
];

function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Your StayFit overview." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {modules.map((mod) => (
          <Link key={mod.href} to={mod.href}>
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <mod.icon className="size-5" />
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
                <CardTitle className="mt-2">{mod.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{mod.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
