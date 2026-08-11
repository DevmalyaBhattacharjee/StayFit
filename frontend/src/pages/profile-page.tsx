import { User } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";

function ProfilePage() {
  return (
    <div>
      <PageHeader title="Profile" description="Your account details." />
      <Card>
        <CardContent>
          <EmptyState
            icon={User}
            title="No profile loaded yet"
            description="Your account details will appear here once you're signed in."
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage;
