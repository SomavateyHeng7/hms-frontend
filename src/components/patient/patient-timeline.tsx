"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ClipboardList,
  FileText,
  FlaskConical,
  Pill,
  Scan,
  Stethoscope,
  TestTube,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useEffect } from "react";
import { useClinicalData, type TimelineEventType } from "@/lib/clinical-store";
import { useAccess } from "@/lib/access";
import type { Permission } from "@/lib/permissions";

const EVENT_CONFIG: Record<TimelineEventType, { label: string; icon: React.ElementType; color: string }> = {
  visit: { label: "Visit", icon: Stethoscope, color: "bg-blue-100 text-blue-700" },
  appointment: { label: "Appointment", icon: Calendar, color: "bg-green-100 text-green-700" },
  lab_order: { label: "Lab", icon: TestTube, color: "bg-purple-100 text-purple-700" },
  lab_result: { label: "Result", icon: FlaskConical, color: "bg-indigo-100 text-indigo-700" },
  imaging_order: { label: "Imaging", icon: Scan, color: "bg-orange-100 text-orange-700" },
  prescription: { label: "Prescription", icon: Pill, color: "bg-rose-100 text-rose-700" },
  record: { label: "Record", icon: FileText, color: "bg-gray-100 text-gray-700" },
};

const QUICK_ACTIONS: { label: string; href: string; icon: React.ElementType; permission: Permission }[] = [
  { label: "Order lab test", href: "/laboratory?tab=orders", icon: TestTube, permission: "labOrder.create" },
  { label: "Order imaging", href: "/radiology?tab=orders", icon: Scan, permission: "imagingOrder.create" },
  { label: "Write prescription", href: "/opd?tab=prescription", icon: Pill, permission: "prescription.create" },
  { label: "Book appointment", href: "/scheduling?tab=booking", icon: Calendar, permission: "appointment.book" },
];

export function PatientTimeline({ patientId }: { patientId: string }) {
  const { getPatient, getTimeline } = useClinicalData();
  const { can, log, ready } = useAccess();
  const patient = getPatient(patientId);

  // Record that this patient's record was opened (once per visit to the page)
  useEffect(() => {
    if (!ready || !patient) return;
    log({
      action: "patient.view",
      entityType: "patient",
      entityId: patient.patientId,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      summary: `Opened the timeline of ${patient.firstName} ${patient.lastName}`,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, patient?.id]);

  if (!patient) {
    return (
      <div className="container mx-auto py-8 px-4">
        <EmptyState
          icon={ClipboardList}
          title="Patient not found"
          description="This patient doesn't exist, or the in-memory data was reset by a page reload."
          action={
            <Button asChild>
              <Link href="/patients">Back to patients</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const events = getTimeline(patient.id);

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-8 px-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-3 mb-1">
            <Link href="/patients">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Patients
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {patient.patientId} · {patient.gender} · DOB {format(patient.dateOfBirth, "MMM d, yyyy")}
            {can("patient.viewClinical") && patient.bloodType && ` · ${patient.bloodType}`}
          </p>
          {can("patient.viewClinical") && patient.allergies && (
            <Badge variant="destructive" className="mt-2">
              Allergies: {patient.allergies}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.filter((a) => can(a.permission)).map(({ label, href, icon: Icon }) => (
            <Button key={label} variant="outline" size="sm" asChild>
              <Link href={`${href}&patient=${patient.id}`}>
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Visits, orders and prescriptions across all modules</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No activity yet"
              description="Orders, prescriptions and visits for this patient will appear here."
            />
          ) : (
            <ol className="relative space-y-6 border-l pl-6">
              {events.map((event) => {
                const { icon: Icon, color, label } = EVENT_CONFIG[event.type];
                const body = (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{event.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {label}
                      </Badge>
                      {event.alert && (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <AlertTriangle className="h-3 w-3" />
                          Unacknowledged critical value
                        </Badge>
                      )}
                      {event.status && (
                        <Badge variant="secondary" className="text-xs">
                          {event.status.replace(/[_-]/g, " ")}
                        </Badge>
                      )}
                    </div>
                    {event.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{format(event.date, "MMM d, yyyy h:mm a")}</p>
                  </>
                );
                return (
                  <li key={event.id} className="relative">
                    <span
                      className={`absolute -left-[2.2rem] flex h-8 w-8 items-center justify-center rounded-full ${color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {event.href ? (
                      <Link href={event.href} className="block rounded-md hover:bg-accent/50 -m-2 p-2">
                        {body}
                      </Link>
                    ) : (
                      <div>{body}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
