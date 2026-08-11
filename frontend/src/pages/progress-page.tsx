import { useState } from "react";
import { Link } from "react-router-dom";
import { HeartPulse } from "lucide-react";

import { getProgressHistory } from "@/api/progress-api";
import { PageHeader } from "@/components/common/page-header";
import { SectionHeader } from "@/components/common/section-header";
import { ProgressStatsSummary } from "@/components/progress/progress-stats-summary";
import { ProgressTimeline } from "@/components/progress/progress-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAsyncData } from "@/hooks/use-async-data";

const TIMELINE_PAGE_SIZE = 10;
const SUMMARY_SIZE = 2;

function ProgressPage() {
  const [page, setPage] = useState(0);

  // Independent of `page`/the timeline below: always the true latest 2 records,
  // so the summary stats never shift just because the user paged through history.
  const summary = useAsyncData(() => getProgressHistory({ page: 0, size: SUMMARY_SIZE }));
  const timeline = useAsyncData(() => getProgressHistory({ page, size: TIMELINE_PAGE_SIZE }), [page]);

  function handlePageChange(nextPage: number) {
    const totalPages = timeline.data?.totalPages ?? 1;
    if (nextPage < 0 || nextPage >= totalPages) {
      return;
    }
    setPage(nextPage);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Progress History"
        description="Your health journey over time."
        actions={
          <Button asChild variant="outline">
            <Link to="/health">
              <HeartPulse />
              Update Health
            </Link>
          </Button>
        }
      />

      <ProgressStatsSummary state={summary} />

      <Card>
        <CardContent className="pt-6">
          <SectionHeader title="Timeline" description="Newest entries first." />
          <ProgressTimeline state={timeline} onPageChange={handlePageChange} />
        </CardContent>
      </Card>
    </div>
  );
}

export default ProgressPage;
