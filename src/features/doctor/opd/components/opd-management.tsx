"use client";


import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OPDDashboard } from "@/features/doctor/opd/components/opd-dashboard";
import { OPDRegistration } from "@/features/doctor/opd/components/opd-registration";
import { ConsultationNotes } from "@/features/doctor/opd/components/consultation-notes";
import { DiagnosisTreatment } from "@/features/doctor/opd/components/diagnosis-treatment";
import { PrescriptionGeneration } from "@/features/doctor/opd/components/prescription-generation";
import { OPDPatient, ConsultationNote, Diagnosis, TreatmentPlan, Prescription } from "@/features/doctor/opd/types";
import { useTabParam } from "@/hooks/use-tab-param";
import { useT } from "@/lib/i18n/messages";
import { OPD_KM } from "@/features/doctor/opd/km";

export function OPDManagement() {
  const t = useT(OPD_KM);
  const [activeTab, setActiveTab] = useTabParam("dashboard", ["dashboard", "registration", "consultation", "diagnosis", "prescription"] as const);
  
  // Mock data - in real app, this would come from API/database
  const mockPatients: OPDPatient[] = [];
  const mockConsultations: ConsultationNote[] = [];
  const mockDiagnoses: Diagnosis[] = [];
  const mockTreatments: TreatmentPlan[] = [];
  const mockPrescriptions: Prescription[] = [];

  // Navigation handlers
  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  // Mock patient for consultation
  const mockPatient: OPDPatient = {
    id: "patient-1",
    registrationNumber: "REG-001",
    visitNumber: "V-001",
    personalInfo: {
      firstName: "Dara",
      lastName: "Sok",
      dateOfBirth: new Date("1990-01-01"),
      gender: "male",
      phoneNumber: "+1234567890",
      email: "john.doe@example.com",
      emergencyContact: {
        name: "Chan Sreymom",
        relationship: "spouse",
        phoneNumber: "+1234567891"
      }
    },
    address: {
      street: "123 Main St",
      city: "Phnom Penh",
      state: "State",
      zipCode: "12345",
      country: "Country"
    },
    medicalHistory: {
      allergies: [],
      currentMedications: [],
      pastMedicalHistory: [],
      familyHistory: [],
      socialHistory: ""
    },
    visitInfo: {
      registrationDate: new Date(),
      department: "General Medicine",
      visitType: "new_patient",
      priority: "routine",
      chiefComplaint: "General checkup"
    },
    status: "registered"
  };

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">{t("Dashboard")}</TabsTrigger>
            <TabsTrigger value="registration">{t("Registration")}</TabsTrigger>
            <TabsTrigger value="consultation">{t("Consultation")}</TabsTrigger>
            <TabsTrigger value="diagnosis">{t("Diagnosis")}</TabsTrigger>
            <TabsTrigger value="prescription">{t("Prescription")}</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <OPDDashboard
              patients={mockPatients}
              consultations={mockConsultations}
              diagnoses={mockDiagnoses}
              treatments={mockTreatments}
              prescriptions={mockPrescriptions}
              onNavigateToRegistration={() => handleNavigateToTab("registration")}
              onNavigateToConsultation={() => handleNavigateToTab("consultation")}
              onNavigateToDiagnosis={() => handleNavigateToTab("diagnosis")}
              onNavigateToPrescription={() => handleNavigateToTab("prescription")}
            />
          </TabsContent>

          <TabsContent value="registration" className="space-y-6">
            <OPDRegistration 
              onSubmit={async (data) => {
                console.log("Registration data:", data);
                alert(t("Patient registration functionality would be implemented here"));
              }}
              onCancel={() => handleNavigateToTab("dashboard")}
              departments={[
                { id: "1", name: "General Medicine" },
                { id: "2", name: "Cardiology" },
                { id: "3", name: "Emergency" },
                { id: "4", name: "Pediatrics" }
              ]}
              doctors={[
                { id: "1", name: "Dr. Chea Sovann", department: "General Medicine" },
                { id: "2", name: "Dr. Lim Pisey", department: "Cardiology" },
                { id: "3", name: "Dr. Seng Malis", department: "Emergency" }
              ]}
            />
          </TabsContent>

          <TabsContent value="consultation" className="space-y-6">
            <ConsultationNotes
              patient={mockPatient}
              onSave={async (data) => {
                console.log("Consultation data:", data);
                alert(t("Consultation save functionality would be implemented here"));
              }}
              onCancel={() => handleNavigateToTab("dashboard")}
              doctorInfo={{
                id: "doc-1",
                name: "Dr. Chea Sovann",
                department: "General Medicine",
                license: "MD12345"
              }}
            />
          </TabsContent>

          <TabsContent value="diagnosis" className="space-y-6">
            <DiagnosisTreatment
              patientId=""
              consultationId=""
              diagnoses={mockDiagnoses}
              treatmentPlans={mockTreatments}
              onAddDiagnosis={async (data) => {
                console.log("Add diagnosis:", data);
                alert(t("Diagnosis addition functionality would be implemented here"));
              }}
              onUpdateDiagnosis={async (id, data) => {
                console.log("Update diagnosis:", id, data);
                alert(t("Diagnosis update functionality would be implemented here"));
              }}
              onDeleteDiagnosis={async (id) => {
                console.log("Delete diagnosis:", id);
                alert(t("Diagnosis deletion functionality would be implemented here"));
              }}
              onAddTreatmentPlan={async (data) => {
                console.log("Add treatment:", data);
                alert(t("Treatment plan addition functionality would be implemented here"));
              }}
              onUpdateTreatmentPlan={async (id, data) => {
                console.log("Update treatment:", id, data);
                alert(t("Treatment plan update functionality would be implemented here"));
              }}
              onDeleteTreatmentPlan={async (id) => {
                console.log("Delete treatment:", id);
                alert(t("Treatment plan deletion functionality would be implemented here"));
              }}
            />
          </TabsContent>

          <TabsContent value="prescription" className="space-y-6">
            <PrescriptionGeneration
              patientId=""
              consultationId=""
              prescriptions={mockPrescriptions}
              onCreatePrescription={async (data) => {
                console.log("Create prescription:", data);
                alert(t("Prescription creation functionality would be implemented here"));
              }}
              onUpdatePrescription={async (id, data) => {
                console.log("Update prescription:", id, data);
                alert(t("Prescription update functionality would be implemented here"));
              }}
              onDeletePrescription={async (id) => {
                console.log("Delete prescription:", id);
                alert(t("Prescription deletion functionality would be implemented here"));
              }}
              onPrintPrescription={(id) => {
                console.log("Print prescription:", id);
                alert(t("Prescription printing functionality would be implemented here"));
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}