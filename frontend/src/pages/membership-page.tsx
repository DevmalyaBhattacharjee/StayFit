import { IdCard } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";

function MembershipPage() {
  return (
    <div>
      <PageHeader title="Membership" description="Browse plans and manage your current membership." />
      <Card>
        <CardContent>
          <EmptyState
            icon={IdCard}
            title="No membership information yet"
            description="Available plans and your membership status will appear here once you're signed in."
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default MembershipPage;
