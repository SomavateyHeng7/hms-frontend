import { Suspense } from "react";
import { OPDManagement } from "@/components/opd/opd-management";

export default function OpdPage() {
  return (
    <Suspense>
      <OPDManagement />
    </Suspense>
  );
}
