import { Suspense } from "react";
import RadiologyManagement from "@/components/radiology/radiology-management";

export default function RadiologyPage() {
  return (
    <Suspense>
      <RadiologyManagement />
    </Suspense>
  );
}
