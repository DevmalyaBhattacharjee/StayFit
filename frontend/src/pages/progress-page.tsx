import { TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";

function ProgressPage() {
  return (
    <div>
      <PageHeader title="Progress History" description="How your health metrics have changed over time." />
      <Card>
        <CardContent>
          <EmptyState
            icon={TrendingUp}
            title="No progress history yet"
            description="Your historical health snapshots will appear here once you're signed in."
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default ProgressPage;
