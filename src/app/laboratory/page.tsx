import { Suspense } from "react";
import { LaboratoryManagement } from "@/components/laboratory/laboratory-management";

export default function LaboratoryPage() {
  return (
    <Suspense>
      <LaboratoryManagement />
    </Suspense>
  );
}
