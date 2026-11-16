import { Suspense } from "react";
import { ReportingManagement } from "@/components/reporting/reporting-management";

export default function ReportingPage() {
  return (
    <Suspense>
      <ReportingManagement />
    </Suspense>
  );
}
