import { Suspense } from "react";
import { SchedulingManagement } from "@/components/scheduling/scheduling-management";

export default function SchedulingPage() {
  return (
    <Suspense>
      <SchedulingManagement />
    </Suspense>
  );
}
