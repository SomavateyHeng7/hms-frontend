"use client";

import { useState } from "react";
import { AlertTriangle, Calendar, Edit, FileText, Heart, IdCard, MapPin, Phone, Pill, Printer, ShieldCheck, User } from "lucide-react";
import QRCodeComponent from "react-qr-code";
import type { Patient, Appointment, Visit, EHRRecord } from "@/features/front-desk/patients/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientInvoices } from "@/integrations/billing/components/patient-invoices";
import { ConsentList } from "@/features/doctor/medical-records/components/consent-list";
import { formatCambodianPhone } from "@/lib/cambodia/phone";
import {
  COVERAGE_LABELS,
  ageLabel,
  coverageSummary,
  displayName,
  khmerFullName,
  latinFullName,
  patientAddressEn,
  patientAddressKm,
} from "@/features/front-desk/patients/patient-utils";
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { PATIENTS_KM } from "../km";

interface PatientDetailsProps {
  patient: Patient;
  appointments?: Appointment[];
  visits?: Visit[];
  ehrRecords?: EHRRecord[];
  onEdit: () => void;
}

const STATUS_STYLES: Record<Patient["status"], string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-yellow-100 text-yellow-800",
  deceased: "bg-gray-100 text-gray-800",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div>{children}</div>
    </div>
  );
}

export function PatientDetails({ patient, appointments = [], visits = [], ehrRecords = [], onEdit }: PatientDetailsProps) {
  const t = useT(PATIENTS_KM);
  const tAny = useTranslateAny(PATIENTS_KM);
  const fmt = useDateFormat();
  const [activeTab, setActiveTab] = useState("overview");

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
    .slice(0, 5);
  const recentVisits = [...visits].sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()).slice(0, 5);
  const recentEHRRecords = [...ehrRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  const khmer = khmerFullName(patient);
  const initials = `${patient.latinName.family.charAt(0)}${patient.latinName.given.charAt(0)}`.toUpperCase();
  const hasAllergy = patient.allergies && patient.allergies !== "None known";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-bold">
            {initials}
          </div>
          <div>
            {khmer && (
              <h1 className="text-3xl font-bold leading-relaxed" lang="km">
                {khmer}
              </h1>
            )}
            <p className={khmer ? "text-lg text-muted-foreground" : "text-3xl font-bold"}>{latinFullName(patient)}</p>
            <p className="text-muted-foreground">
              {patient.patientId} · {patient.sex === "male" ? t("Male") : t("Female")} · {ageLabel(patient, tAny)}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge className={STATUS_STYLES[patient.status]}>{tAny(patient.status)}</Badge>
              <Badge variant="outline">
                <ShieldCheck className="mr-1 h-3 w-3" />
                {tAny(COVERAGE_LABELS[patient.coverage.scheme])}
              </Badge>
              {patient.bloodType && <Badge variant="outline">{t("Blood type {type}", { type: patient.bloodType })}</Badge>}
              {hasAllergy && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {t("Allergy: {allergies}", { allergies: patient.allergies ?? "" })}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled title={t("Patient card printing comes in Phase 4")}>
            <Printer className="mr-2 h-4 w-4" />
            {t("Print Card")}
          </Button>
          <Button onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            {t("Edit")}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex h-auto w-full flex-wrap">
          <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
          <TabsTrigger value="appointments">{t("Appointments")}</TabsTrigger>
          <TabsTrigger value="visits">{t("Visit History")}</TabsTrigger>
          <TabsTrigger value="ehr">{t("EHR Records")}</TabsTrigger>
          <TabsTrigger value="consents">{t("Consent Forms")}</TabsTrigger>
          <TabsTrigger value="invoices">{t("Invoices")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t("Personal Information")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Row label={t("Date of birth")}>
                  {patient.dateOfBirth ? fmt(patient.dateOfBirth, "d MMMM yyyy") : t("Not known")}
                </Row>
                <Row label={t("Age")}>{ageLabel(patient, tAny)}</Row>
                <Row label={t("Registered")}>{fmt(patient.registeredAt, "d MMMM yyyy")}</Row>
                <Row label={t("Last visit")}>{patient.lastVisitAt ? fmt(patient.lastVisitAt, "d MMMM yyyy") : t("None")}</Row>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IdCard className="h-5 w-5" />
                  {t("Identity Document")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {patient.identity.type === "none" ? (
                  <p className="text-muted-foreground col-span-2">{t("No document recorded")}</p>
                ) : (
                  <>
                    <Row label={patient.identity.type === "passport" ? t("Passport") : t("National ID")}>{patient.identity.number}</Row>
                    {patient.identity.type === "passport" && <Row label={t("Nationality")}>{patient.identity.nationality}</Row>}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t("Contact and Address")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{formatCambodianPhone(patient.phone)}</span>
                </div>
                <div className="text-sm space-y-0.5">
                  {patient.address.houseStreet && <p>{patient.address.houseStreet}</p>}
                  <p>{patientAddressEn(patient)}</p>
                  <p className="text-muted-foreground" lang="km">
                    {patientAddressKm(patient)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  {t("Coverage")}
                </CardTitle>
                <CardDescription>{t("Eligibility and claims are handled by the billing system")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{coverageSummary(patient, tAny)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t("Emergency Contact")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.emergencyContact.name ? (
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">{patient.emergencyContact.name}</span>
                      {patient.emergencyContact.relationship && (
                        <span className="text-muted-foreground ml-2">({tAny(patient.emergencyContact.relationship)})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{formatCambodianPhone(patient.emergencyContact.phone)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">{t("Not recorded")}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("Patient QR Code")}</CardTitle>
                <CardDescription>{t("Scan at check-in to find this patient")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-2">
                <div className="p-4 bg-white border rounded-lg w-36">
                  <QRCodeComponent value={patient.qrCode} size={128} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                </div>
                <p className="text-xs text-muted-foreground">{patient.qrCode}</p>
              </CardContent>
            </Card>

            {(patient.medicalHistory || patient.currentMedications) && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t("Medical Information")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patient.medicalHistory && (
                    <Row label={t("Medical history")}>
                      <p className="text-sm whitespace-pre-wrap">{patient.medicalHistory}</p>
                    </Row>
                  )}
                  {patient.currentMedications && (
                    <Row label={t("Current medications")}>
                      <p className="text-sm whitespace-pre-wrap flex gap-2">
                        <Pill className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        {patient.currentMedications}
                      </p>
                    </Row>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Recent Appointments")}</CardTitle>
              <CardDescription>{t("Patient's appointment history and upcoming appointments")}</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 mb-4" />
                  <p>{t("No appointments found")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{appointment.doctorName}</div>
                        <div className="text-sm text-muted-foreground">
                          {t("{date} at {time}", { date: fmt(appointment.appointmentDate, "d MMMM yyyy"), time: appointment.appointmentTime })}
                        </div>
                        <div className="text-sm">{appointment.reason}</div>
                        <div className="text-xs text-muted-foreground">
                          {tAny(appointment.department)} • {t("{count} minutes", { count: appointment.duration })}
                        </div>
                      </div>
                      <Badge className={getAppointmentStatusColor(appointment.status)}>
                        {tAny(appointment.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Visit History")}</CardTitle>
              <CardDescription>{t("Patient's medical visits and consultations")}</CardDescription>
            </CardHeader>
            <CardContent>
              {recentVisits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <p>{t("No visits found")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentVisits.map((visit) => (
                    <div key={visit.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{visit.doctorName}</div>
                          <div className="text-sm text-muted-foreground">
                            {t("{date} at {time}", { date: fmt(visit.visitDate, "d MMMM yyyy"), time: visit.visitTime })}
                          </div>
                        </div>
                        <Badge variant="outline">{tAny(visit.type)}</Badge>
                      </div>
                      <div className="space-y-1">
                        <div><span className="font-medium">{t("Chief Complaint:")}</span> {visit.chiefComplaint}</div>
                        {visit.diagnosis && (
                          <div><span className="font-medium">{t("Diagnosis:")}</span> {visit.diagnosis}</div>
                        )}
                        {visit.treatment && (
                          <div><span className="font-medium">{t("Treatment:")}</span> {visit.treatment}</div>
                        )}
                        {visit.vitals && (
                          <div className="text-sm text-muted-foreground">
                            {t("Vital signs:")}
                            {visit.vitals.temperature && ` ${t("Temp.")} ${visit.vitals.temperature}°C`}
                            {visit.vitals.bloodPressure && ` · ${t("BP")} ${visit.vitals.bloodPressure}`}
                            {visit.vitals.heartRate && ` · ${t("Pulse")} ${visit.vitals.heartRate}/min`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ehr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Electronic Health Records")}</CardTitle>
              <CardDescription>{t("Complete medical record history")}</CardDescription>
            </CardHeader>
            <CardContent>
              {recentEHRRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="mx-auto h-12 w-12 mb-4" />
                  <p>{t("No EHR records found")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEHRRecords.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{record.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.doctorName} • {tAny(record.department)}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{tAny(record.recordType)}</Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            {fmt(record.date, "d MMM yyyy")}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm">{record.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="consents" className="space-y-4">
          {activeTab === "consents" && <ConsentList patient={{ patientId: patient.patientId, name: displayName(patient) }} />}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          {activeTab === "invoices" && <PatientInvoices patientId={patient.patientId} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}