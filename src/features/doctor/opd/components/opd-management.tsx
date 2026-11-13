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

export function OPDManagement() {
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
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: new Date("1990-01-01"),
      gender: "male",
      phoneNumber: "+1234567890",
      email: "john.doe@example.com",
      emergencyContact: {
        name: "Jane Doe",
        relationship: "spouse",
        phoneNumber: "+1234567891"
      }
    },
    address: {
      street: "123 Main St",
      city: "Anytown",
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="registration">Registration</TabsTrigger>
            <TabsTrigger value="consultation">Consultation</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="prescription">Prescription</TabsTrigger>
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
                alert("Patient registration functionality would be implemented here");
              }}
              onCancel={() => handleNavigateToTab("dashboard")}
              departments={[
                { id: "1", name: "General Medicine" },
                { id: "2", name: "Cardiology" },
                { id: "3", name: "Emergency" },
                { id: "4", name: "Pediatrics" }
              ]}
              doctors={[
                { id: "1", name: "Dr. Smith", department: "General Medicine" },
                { id: "2", name: "Dr. Johnson", department: "Cardiology" },
                { id: "3", name: "Dr. Brown", department: "Emergency" }
              ]}
            />
          </TabsContent>

          <TabsContent value="consultation" className="space-y-6">
            <ConsultationNotes
              patient={mockPatient}
              onSave={async (data) => {
                console.log("Consultation data:", data);
                alert("Consultation save functionality would be implemented here");
              }}
              onCancel={() => handleNavigateToTab("dashboard")}
              doctorInfo={{
                id: "doc-1",
                name: "Dr. Smith",
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
                alert("Diagnosis addition functionality would be implemented here");
              }}
              onUpdateDiagnosis={async (id, data) => {
                console.log("Update diagnosis:", id, data);
                alert("Diagnosis update functionality would be implemented here");
              }}
              onDeleteDiagnosis={async (id) => {
                console.log("Delete diagnosis:", id);
                alert("Diagnosis deletion functionality would be implemented here");
              }}
              onAddTreatmentPlan={async (data) => {
                console.log("Add treatment:", data);
                alert("Treatment plan addition functionality would be implemented here");
              }}
              onUpdateTreatmentPlan={async (id, data) => {
                console.log("Update treatment:", id, data);
                alert("Treatment plan update functionality would be implemented here");
              }}
              onDeleteTreatmentPlan={async (id) => {
                console.log("Delete treatment:", id);
                alert("Treatment plan deletion functionality would be implemented here");
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
                alert("Prescription creation functionality would be implemented here");
              }}
              onUpdatePrescription={async (id, data) => {
                console.log("Update prescription:", id, data);
                alert("Prescription update functionality would be implemented here");
              }}
              onDeletePrescription={async (id) => {
                console.log("Delete prescription:", id);
                alert("Prescription deletion functionality would be implemented here");
              }}
              onPrintPrescription={(id) => {
                console.log("Print prescription:", id);
                alert("Prescription printing functionality would be implemented here");
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}