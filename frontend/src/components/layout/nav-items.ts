import type { LucideIcon } from "lucide-react";
import { Dumbbell, HeartPulse, IdCard, LayoutDashboard, TrendingUp, User } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Health", href: "/health", icon: HeartPulse },
  { label: "Progress", href: "/progress", icon: TrendingUp },
  { label: "Workouts", href: "/workouts", icon: Dumbbell },
  { label: "Membership", href: "/membership", icon: IdCard },
  { label: "Profile", href: "/profile", icon: User },
];

export { navItems };
export type { NavItem };
