"use client";

import { ReportingAnalytics } from "@/features/admin/reporting/components/reporting-analytics";
import {
  emptyBillingSummary,
  emptyDailyCensus,
  emptyInventoryReport,
} from "@/features/admin/reporting/empty-reports";

export default function ReportingPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ReportingAnalytics
        dailyCensus={emptyDailyCensus()}
        clinicalReports={[]}
        billingSummary={emptyBillingSummary()}
        inventoryReport={emptyInventoryReport()}
        customDashboards={[]}
      />
    </div>
  );
}
