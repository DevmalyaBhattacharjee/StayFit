import { HeartPulse } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";

function HealthPage() {
  return (
    <div>
      <PageHeader title="Health Profile" description="Your current weight and height." />
      <Card>
        <CardContent>
          <EmptyState
            icon={HeartPulse}
            title="No health profile loaded yet"
            description="Your current health profile will appear here once you're signed in."
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default HealthPage;
