import { Link, useNavigate } from "react-router-dom";
import { HeartPulse, LogOut } from "lucide-react";

import { getCurrentHealth } from "@/api/health-api";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { SectionHeader } from "@/components/common/section-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useAsyncData } from "@/hooks/use-async-data";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { formatGender } from "@/lib/gender-labels";
import { getInitials } from "@/lib/utils";

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Weight/height can change via /health after this page's last load, so they're
  // fetched fresh here rather than trusted from the AuthContext user snapshot.
  const health = useAsyncData(getCurrentHealth);

  if (!user) {
    return null;
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile" description="Your account information." />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center sm:flex-row sm:text-left">
          <Avatar className="size-16 shrink-0 border border-border">
            <AvatarFallback className="bg-accent text-lg text-accent-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="truncate text-xl font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Badge variant={user.enabled ? "success" : "destructive"}>{user.enabled ? "Active" : "Disabled"}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <SectionHeader title="Account Information" />
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Date of birth</p>
              <p className="text-foreground">{formatDate(user.dateOfBirth)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Gender</p>
              <p className="text-foreground">{formatGender(user.gender)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Member since</p>
              <p className="text-foreground">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <SectionHeader
            title="Current Health"
            actions={
              <Button asChild variant="outline" size="sm">
                <Link to="/health">
                  <HeartPulse />
                  Update Health
                </Link>
              </Button>
            }
          />

          {health.isLoading && (
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          )}

          {!health.isLoading && Boolean(health.error) && (
            <ErrorState
              className="py-6"
              description={getApiErrorMessage(health.error, "Couldn't load your health data.")}
              action={
                <Button variant="outline" size="sm" onClick={() => health.refetch()}>
                  Try again
                </Button>
              }
            />
          )}

          {!health.isLoading && !health.error && health.data && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">Weight</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {health.data.weight} <span className="text-sm font-normal text-muted-foreground">kg</span>
                </p>
              </div>
              <div className="rounded-lg bg-muted px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">Height</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {health.data.height} <span className="text-sm font-normal text-muted-foreground">cm</span>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <Button type="button" variant="outline" onClick={handleLogout}>
          <LogOut />
          Log out
        </Button>
      </div>
    </div>
  );
}

export default ProfilePage;
