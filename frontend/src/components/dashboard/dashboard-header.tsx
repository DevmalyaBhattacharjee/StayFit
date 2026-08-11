import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { User } from "@/types/auth";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function DashboardHeader({ user }: { user: User }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {getGreeting()}, {user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">Here's your fitness overview.</p>
      </div>
      <Avatar className="size-11 border border-border">
        <AvatarFallback className="bg-accent text-accent-foreground">{getInitials(user.name)}</AvatarFallback>
      </Avatar>
    </div>
  );
}

export { DashboardHeader };
