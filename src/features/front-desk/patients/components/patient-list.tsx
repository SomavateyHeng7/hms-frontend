"use client";

import { useState } from "react";
import { Calendar, Edit, Eye, MapPin, Phone, Plus, Search, ShieldCheck } from "lucide-react";
import type { Patient } from "@/features/front-desk/patients/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCambodianPhone } from "@/lib/cambodia/phone";
import {
  COVERAGE_LABELS,
  ageLabel,
  khmerFullName,
  latinFullName,
  patientAddressEn,
  patientAddressKm,
  patientMatches,
} from "@/features/front-desk/patients/patient-utils";
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { useLanguage } from "@/lib/i18n/language-provider";
import { PATIENTS_KM } from "../km";

type StatusFilter = "all" | Patient["status"];

interface PatientListProps {
  patients: Patient[];
  onAddPatient: () => void;
  onViewPatient: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onScheduleAppointment: (patient: Patient) => void;
}

const STATUS_STYLES: Record<Patient["status"], string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-yellow-100 text-yellow-800",
  deceased: "bg-gray-100 text-gray-800",
};

const COVERAGE_STYLES: Record<Patient["coverage"]["scheme"], string> = {
  none: "",
  nssf: "bg-blue-50 text-blue-800 border-blue-200",
  hef: "bg-purple-50 text-purple-800 border-purple-200",
  private: "bg-teal-50 text-teal-800 border-teal-200",
};

export function PatientList({ patients, onAddPatient, onViewPatient, onEditPatient, onScheduleAppointment }: PatientListProps) {
  const t = useT(PATIENTS_KM);
  const tAny = useTranslateAny(PATIENTS_KM);
  const fmt = useDateFormat();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");

  const filtered = patients.filter(
    (p) => patientMatches(p, searchQuery) && (filterStatus === "all" || p.status === filterStatus)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Patients")}</h1>
          <p className="text-muted-foreground">{t("{count} registered", { count: patients.length })}</p>
        </div>
        <Button onClick={onAddPatient}>
          <Plus className="mr-2 h-4 w-4" />
          {t("Register Patient")}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("Search by name (Khmer or Latin), hospital number, phone or ID number")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label={t("Search patients")}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "inactive", "deceased"] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {tAny(status.charAt(0).toUpperCase() + status.slice(1))}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {patients.length === 0 ? t("No patients registered yet.") : t("No patients match your search.")}
            </p>
            {patients.length === 0 && (
              <Button className="mt-4" onClick={onAddPatient}>
                <Plus className="mr-2 h-4 w-4" />
                {t("Register the first patient")}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((patient) => {
            const khmer = khmerFullName(patient);
            return (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {khmer && (
                        <p className="text-lg font-semibold leading-relaxed" lang="km">
                          {khmer}
                        </p>
                      )}
                      <p className={khmer ? "text-sm text-muted-foreground" : "text-lg font-semibold"}>{latinFullName(patient)}</p>
                    </div>
                    <Badge className={STATUS_STYLES[patient.status]}>{tAny(patient.status)}</Badge>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      {patient.patientId} · {patient.sex === "male" ? t("Male") : t("Female")} · {ageLabel(patient, tAny)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      {formatCambodianPhone(patient.phone)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate" lang={language === "km" ? "km" : undefined}>{language === "km" ? patientAddressKm(patient) : patientAddressEn(patient)}</span>
                    </div>
                    {patient.lastVisitAt && <div>{t("Last visit: {date}", { date: fmt(patient.lastVisitAt, "d MMM yyyy") })}</div>}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className={COVERAGE_STYLES[patient.coverage.scheme]}>
                      <ShieldCheck className="mr-1 h-3 w-3" />
                      {tAny(COVERAGE_LABELS[patient.coverage.scheme])}
                    </Badge>
                    {patient.identity.type === "passport" && <Badge variant="outline">{patient.identity.nationality}</Badge>}
                    {patient.allergies && patient.allergies !== "None known" && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {t("Allergy: {allergies}", { allergies: patient.allergies })}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => onViewPatient(patient)}>
                      <Eye className="mr-1 h-3 w-3" />
                      {t("View")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onEditPatient(patient)}>
                      <Edit className="mr-1 h-3 w-3" />
                      {t("Edit")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onScheduleAppointment(patient)}>
                      <Calendar className="mr-1 h-3 w-3" />
                      {t("Book")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
