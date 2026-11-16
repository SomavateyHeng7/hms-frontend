import { PatientTimeline } from "@/components/patient/patient-timeline";

export default async function PatientTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PatientTimeline patientId={id} />;
}
