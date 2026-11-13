"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isSameDay } from "date-fns";
import { Activity, AlertTriangle, ArrowLeft, Calendar, CheckCircle2, ClipboardList, FileText, Loader2, QrCode, RefreshCw, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useServiceQuery } from "@/hooks/use-service-query";
import { patientService } from "@/features/front-desk/patients/service";
import { displayName, toRegistrationForm } from "@/features/front-desk/patients/patient-utils";
import type { PatientRegistrationFormData, AppointmentFormData, VisitFormData } from "@/features/front-desk/patients/validations";
import { PatientList } from "@/features/front-desk/patients/components/patient-list";
import { PatientRegistrationForm } from "@/features/front-desk/patients/components/patient-registration-form";
import { PatientDetails } from "@/features/front-desk/patients/components/patient-details";
import { AppointmentSchedulingForm } from "@/features/front-desk/patients/components/appointment-scheduling-form";
import { VisitRecordForm } from "@/features/front-desk/patients/components/visit-record-form";
import { PatientIdentification } from "@/features/front-desk/patients/components/patient-identification";
import { useT, useTranslateAny } from "@/lib/i18n/messages";
import { PATIENTS_KM } from "@/features/front-desk/patients/km";

const VIEWS = ["dashboard", "list", "register", "details", "edit", "appointment", "visit", "check-in"] as const;
type View = (typeof VIEWS)[number];

/** View and selected patient live in the URL so refresh and the back button keep your place. */
function usePatientNavigation() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get("view");
  const view: View = raw && (VIEWS as readonly string[]).includes(raw) ? (raw as View) : "dashboard";
  const patientId = params.get("patient");

  const go = (next: View, nextPatientId?: string | null) => {
    const search = new URLSearchParams(params.toString());
    if (next === "dashboard") search.delete("view");
    else search.set("view", next);
    const id = nextPatientId === undefined ? patientId : nextPatientId;
    if (id) search.set("patient", id);
    else search.delete("patient");
    const query = search.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: true });
  };

  return { view, patientId, go };
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      {label}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const t = useT(PATIENTS_KM);
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
        <div>
          <p className="font-medium">{t("Patient records are unavailable")}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("Try again")}
        </Button>
      </CardContent>
    </Card>
  );
}

/** Sub-page header: the way back is on the left, above the title, on every patient sub-page. */
function PageHeader({ title, subtitle, onBack, backLabel }: { title: string; subtitle?: string; onBack: () => void; backLabel?: string }) {
  const t = useT(PATIENTS_KM);
  return (
    <div className="space-y-3">
      <Button variant="ghost" size="sm" className="-ml-3" onClick={onBack}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        {backLabel ?? t("Back")}
      </Button>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function PatientManagementPage() {
  const t = useT(PATIENTS_KM);
  const tAny = useTranslateAny(PATIENTS_KM);
  const { view, patientId, go } = usePatientNavigation();
  const [notice, setNotice] = useState<string | null>(null);
  const [checkInError, setCheckInError] = useState<string | null>(null);

  const patients = useServiceQuery("patients", () => patientService.listPatients());
  const appointments = useServiceQuery("appointments", () => patientService.listAppointments());
  const visits = useServiceQuery("visits", () => patientService.listVisits());

  const selected = patients.status === "success" ? (patients.data.find((p) => p.id === patientId) ?? null) : null;
  const records = useServiceQuery(`records:${selected?.patientId ?? ""}`, () =>
    selected ? patientService.listRecords(selected.patientId) : Promise.resolve([])
  );

  const done = (message: string, next: View, id?: string | null) => {
    setNotice(message);
    go(next, id);
  };

  const handleRegister = async (data: PatientRegistrationFormData) => {
    const patient = await patientService.registerPatient(data);
    await patients.reload();
    done(t("Registered {name} as {id}.", { name: displayName(patient), id: patient.patientId }), "details", patient.id);
  };

  const handleEdit = async (data: PatientRegistrationFormData) => {
    if (!selected) return;
    const patient = await patientService.updatePatient(selected.id, data);
    await patients.reload();
    done(t("Saved changes to {name}.", { name: displayName(patient) }), "details", patient.id);
  };

  const handleAppointment = async (data: AppointmentFormData) => {
    await patientService.scheduleAppointment(data);
    await appointments.reload();
    done(t("Appointment booked."), selected ? "details" : "dashboard");
  };

  const handleVisit = async (data: VisitFormData) => {
    await patientService.recordVisit(data);
    await Promise.all([visits.reload(), records.reload(), patients.reload()]);
    done(t("Visit recorded."), "details");
  };

  const handleCheckIn = async (identifier: string) => {
    setCheckInError(null);
    const patient = await patientService.findPatient(identifier);
    if (patient) done(t("Checked in {name}.", { name: displayName(patient) }), "details", patient.id);
    else setCheckInError(t("No patient found for \"{identifier}\". Check the number or search by name.", { identifier }));
  };

  const renderView = () => {
    if (patients.status === "loading") return <LoadingState label={t("Loading patients…")} />;
    if (patients.status === "error") return <ErrorState message={tAny(patients.error)} onRetry={patients.retry} />;
    const allPatients = patients.data;
    const allAppointments = appointments.data ?? [];
    const allVisits = visits.data ?? [];

    // A patient view whose patient no longer exists (e.g. after reset) falls back to the list.
    if (["details", "edit", "visit"].includes(view) && !selected) {
      return (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-muted-foreground">{t("This patient could not be found.")}</p>
            <Button onClick={() => go("list", null)}>{t("Go to patient list")}</Button>
          </CardContent>
        </Card>
      );
    }

    switch (view) {
      case "check-in":
        return (
          <div className="space-y-6">
            <PageHeader
              title={t("Patient Check-in")}
              subtitle={t("Scan the patient QR code, or enter a hospital number, phone or ID number")}
              onBack={() => go("dashboard", null)}
              backLabel={t("Front Desk")}
            />
            {checkInError && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{checkInError}</div>
            )}
            <PatientIdentification onPatientFound={(id) => void handleCheckIn(id)} onError={setCheckInError} />
          </div>
        );

      case "list":
        return (
          <PatientList
            patients={allPatients}
            onAddPatient={() => go("register", null)}
            onViewPatient={(p) => go("details", p.id)}
            onEditPatient={(p) => go("edit", p.id)}
            onScheduleAppointment={(p) => go("appointment", p.id)}
          />
        );

      case "register":
        return (
          <div className="space-y-6">
            <PageHeader title={t("Register Patient")} subtitle={t("Fields marked * are required")} onBack={() => go("dashboard", null)} backLabel={t("Front Desk")} />
            <PatientRegistrationForm onSubmit={handleRegister} onCancel={() => go("dashboard", null)} />
          </div>
        );

      case "edit":
        return (
          <div className="space-y-6">
            <PageHeader title={t("Edit {name}", { name: displayName(selected!) })} onBack={() => go("details")} backLabel={t("Patient Details")} />
            <PatientRegistrationForm
              key={selected!.id}
              onSubmit={handleEdit}
              onCancel={() => go("details")}
              initialData={toRegistrationForm(selected!)}
              isEditing
            />
          </div>
        );

      case "details":
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <Button variant="ghost" size="sm" className="-ml-3" onClick={() => go("list", null)}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                {t("Patient List")}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => go("visit")}>
                  <FileText className="mr-2 h-4 w-4" />
                  {t("Record Visit")}
                </Button>
                <Button variant="outline" onClick={() => go("appointment")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  {t("Book Appointment")}
                </Button>
              </div>
            </div>
            <PatientDetails
              patient={selected!}
              appointments={allAppointments.filter((a) => a.patientId === selected!.patientId)}
              visits={allVisits.filter((v) => v.patientId === selected!.patientId)}
              ehrRecords={records.data ?? []}
              onEdit={() => go("edit")}
            />
          </div>
        );

      case "appointment":
        return (
          <div className="space-y-6">
            <PageHeader
              title={t("Book Appointment")}
              subtitle={selected ? t("For {name} ({id})", { name: displayName(selected), id: selected.patientId }) : undefined}
              onBack={() => go(selected ? "details" : "dashboard")}
              backLabel={selected ? t("Patient Details") : t("Front Desk")}
            />
            <AppointmentSchedulingForm
              onSubmit={handleAppointment}
              onCancel={() => go(selected ? "details" : "dashboard")}
              preSelectedPatientId={selected?.patientId}
              preSelectedPatientName={selected ? displayName(selected) : undefined}
            />
          </div>
        );

      case "visit":
        return (
          <div className="space-y-6">
            <PageHeader title={t("Record Visit")} onBack={() => go("details")} backLabel={t("Patient Details")} />
            <VisitRecordForm
              onSubmit={handleVisit}
              onCancel={() => go("details")}
              preSelectedPatientId={selected!.patientId}
              preSelectedPatientName={displayName(selected!)}
            />
          </div>
        );

      default: {
        const today = new Date();
        const actions = [
          { title: t("Check-in"), text: t("Scan QR or search an existing patient"), icon: QrCode, view: "check-in" as const },
          { title: t("Register Patient"), text: t("Add a new patient"), icon: UserPlus, view: "register" as const },
          { title: t("Patient Records"), text: t("Browse and search patients"), icon: Users, view: "list" as const },
          { title: t("Book Appointment"), text: t("Book without selecting a patient first"), icon: Calendar, view: "appointment" as const },
        ];
        const stats = [
          { title: t("Registered Patients"), value: allPatients.length, icon: Users },
          { title: t("Active"), value: allPatients.filter((p) => p.status === "active").length, icon: Activity },
          {
            title: t("Appointments Today"),
            value: allAppointments.filter((a) => isSameDay(new Date(a.appointmentDate), today)).length,
            icon: Calendar,
          },
          { title: t("Visits Recorded"), value: allVisits.length, icon: ClipboardList },
        ];
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t("Front Desk")}</h1>
              <p className="text-muted-foreground">{t("Check in, register and find patients")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {actions.map((a) => (
                <Card
                  key={a.title}
                  role="button"
                  tabIndex={0}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => go(a.view, null)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && go(a.view, null)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{a.title}</CardTitle>
                    <a.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{a.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stats.map((s) => (
                <Card key={s.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{s.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 space-y-4">
        {notice && (
          <div className="flex items-center justify-between gap-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {notice}
            </span>
            <button type="button" className="text-green-900/70 hover:text-green-900" onClick={() => setNotice(null)} aria-label={t("Dismiss")}>
              ×
            </button>
          </div>
        )}
        {renderView()}
      </div>
    </div>
  );
}
