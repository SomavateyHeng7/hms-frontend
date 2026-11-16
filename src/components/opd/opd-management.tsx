"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTabParam } from "@/hooks/use-tab-param";
import { toast } from "sonner";
import { useClinicalData } from "@/lib/clinical-store";
import { useAccess } from "@/lib/access";
import { RoleNotice } from "@/components/layout/role-notice";
import { PatientFilterBanner, useSelectedPatient } from "@/components/layout/patient-filter-banner";
import type { PrescriptionFormData, OPDBillingSubmission } from "@/lib/validations/opd";
import { printDocument, prescriptionHtml, billHtml } from "@/lib/print";
import type { PrescriptionSafetyMeta } from "@/components/opd/prescription-generation";
import { OPDDashboard } from "@/components/opd/opd-dashboard";
import { OPDRegistration } from "@/components/opd/opd-registration";
import { ConsultationNotes } from "@/components/opd/consultation-notes";
import { DiagnosisTreatment } from "@/components/opd/diagnosis-treatment";
import { PrescriptionGeneration } from "@/components/opd/prescription-generation";
import { OPDBilling } from "@/components/opd/opd-billing";
import { OPDPatient, ConsultationNote, Diagnosis, TreatmentPlan, Prescription, OPDBilling as OPDBillingType } from "@/types/opd";

export function OPDManagement() {
  const { user, can, log: audit } = useAccess();
  // Tabs depend on role: clinical tabs need clinical access, billing needs a billing permission
  const canViewClinical = can("patient.viewClinical");
  const canSeeBilling = can("bill.create") || can("bill.payment") || can("bill.print");
  const allowedTabs = [
    "dashboard",
    ...(can("patient.register") ? ["registration"] : []),
    ...(canViewClinical ? ["consultation", "diagnosis", "prescription"] : []),
    ...(canSeeBilling ? ["billing"] : []),
  ];
  const [activeTab, setActiveTab] = useTabParam("dashboard", allowedTabs);
  
  // Mock data - in real app, this would come from API/database
  const mockPatients: OPDPatient[] = [];
  const mockConsultations: ConsultationNote[] = [];
  const mockDiagnoses: Diagnosis[] = [];
  const mockTreatments: TreatmentPlan[] = [];
  const { patients, prescriptions, addPrescription, bills, addBill, recordBillPayment, getPatient } = useClinicalData();
  const selectedPatient = useSelectedPatient();
  // Prescriptions are written for the patient chosen via ?patient=, else the first patient
  const activePatient = selectedPatient ?? patients[0];
  const patientPrescriptions: Prescription[] = prescriptions.filter((p) => p.patientId === activePatient?.id);
  const patientBills: OPDBillingType[] = bills.filter((b) => b.patientId === activePatient?.id);

  const handleCreatePrescription = async (data: PrescriptionFormData, meta?: PrescriptionSafetyMeta) => {
    if (!can("prescription.create")) {
      toast.error("Your role can't create prescriptions");
      return;
    }
    if (!activePatient) {
      toast.error("No patient selected");
      return;
    }
    const rx = addPrescription(data, activePatient.id, meta);
    if (rx) {
      toast.success(`Prescription ${rx.prescriptionNumber} created`, {
        description: `For ${activePatient.firstName} ${activePatient.lastName}`,
      });
    }
  };

  const handleCreateBill = async (data: OPDBillingSubmission) => {
    if (!can("bill.create")) {
      toast.error("Your role can't create bills");
      return;
    }
    if (!activePatient) {
      toast.error("No patient selected");
      return;
    }
    const bill = addBill(data, activePatient.id);
    if (bill) {
      toast.success(`Bill ${bill.billNumber} created`, { description: `Total $${bill.totalAmount.toFixed(2)}` });
    }
  };

  const handlePrintPrescription = (id: string) => {
    const rx = prescriptions.find((p) => p.id === id);
    const patient = rx ? getPatient(rx.patientId) : undefined;
    if (!rx || !patient) {
      toast.error("Could not print prescription", { description: "Prescription or patient not found." });
      return;
    }
    if (!can("prescription.print")) {
      toast.error("Your role can't print prescriptions");
      return;
    }
    audit({
      action: "document.print",
      entityType: "prescription",
      entityId: rx.prescriptionNumber,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      summary: `Printed prescription ${rx.prescriptionNumber}`,
    });
    printDocument(prescriptionHtml(rx, patient, { printedBy: user?.name }));
  };

  const handlePrintBill = (id: string) => {
    const bill = bills.find((b) => b.id === id);
    const patient = bill ? getPatient(bill.patientId) : undefined;
    if (!bill || !patient) {
      toast.error("Could not print bill", { description: "Bill or patient not found." });
      return;
    }
    if (!can("bill.print")) {
      toast.error("Your role can't print bills");
      return;
    }
    audit({
      action: "document.print",
      entityType: "bill",
      entityId: bill.billNumber,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      summary: `Printed bill ${bill.billNumber}`,
    });
    printDocument(billHtml(bill, patient, { printedBy: user?.name }));
  };

  const notAvailable = (what: string) => async () => {
    toast.info(`${what} isn't available in the demo yet`);
  };

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
      <div className="container mx-auto px-4">
        {user && (
          <RoleNotice
            role={user.role}
            limits={[
              !can("prescription.create") && "you can view but not write prescriptions",
              !can("bill.create") && "you can't create bills",
            ].filter(Boolean) as string[]}
          />
        )}
        <PatientFilterBanner patient={activePatient} selectable clinical={canViewClinical} />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex h-auto w-full flex-wrap justify-start">
            {allowedTabs.includes("dashboard") && <TabsTrigger value="dashboard">Dashboard</TabsTrigger>}
            {allowedTabs.includes("registration") && <TabsTrigger value="registration">Registration</TabsTrigger>}
            {allowedTabs.includes("consultation") && <TabsTrigger value="consultation">Consultation</TabsTrigger>}
            {allowedTabs.includes("diagnosis") && <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>}
            {allowedTabs.includes("prescription") && <TabsTrigger value="prescription">Prescription</TabsTrigger>}
            {allowedTabs.includes("billing") && <TabsTrigger value="billing">Billing</TabsTrigger>}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <OPDDashboard
              patients={mockPatients}
              consultations={mockConsultations}
              diagnoses={mockDiagnoses}
              treatments={mockTreatments}
              prescriptions={canViewClinical ? patientPrescriptions : []}
              bills={canSeeBilling ? patientBills : []}
              onNavigateToRegistration={() => handleNavigateToTab("registration")}
              onNavigateToConsultation={() => handleNavigateToTab("consultation")}
              onNavigateToDiagnosis={() => handleNavigateToTab("diagnosis")}
              onNavigateToPrescription={() => handleNavigateToTab("prescription")}
              onNavigateToBilling={() => handleNavigateToTab("billing")}
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
              patientId={activePatient?.id ?? ""}
              consultationId=""
              prescriptions={patientPrescriptions}
              patientAllergies={activePatient?.allergies}
              patientCurrentMedications={activePatient?.currentMedications}
              canCreate={can("prescription.create")}
              onCreatePrescription={handleCreatePrescription}
              onUpdatePrescription={notAvailable("Editing prescriptions")}
              onDeletePrescription={notAvailable("Deleting prescriptions")}
              onPrintPrescription={handlePrintPrescription}
            />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <OPDBilling
              patientId={activePatient?.id ?? ""}
              consultationId=""
              bills={patientBills}
              canCreate={can("bill.create")}
              canRecordPayment={can("bill.payment")}
              onCreateBill={handleCreateBill}
              onUpdateBill={notAvailable("Editing bills")}
              onDeleteBill={notAvailable("Deleting bills")}
              onProcessPayment={async (billId, paymentMethod, amount) => {
                if (!can("bill.payment") || !recordBillPayment(billId, paymentMethod, amount)) {
                  toast.error("Could not record payment", { description: "Your role can't record payments, or the amount is invalid." });
                  return;
                }
                toast.success("Payment recorded", { description: `$${amount.toFixed(2)} via ${paymentMethod}` });
              }}
              onPrintBill={handlePrintBill}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}