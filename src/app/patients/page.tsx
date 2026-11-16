"use client";

import React, { useState } from "react";
import { Patient, Appointment, Visit, EHRRecord } from "@/types/patient";
import { PatientRegistrationFormData, AppointmentFormData, VisitFormData } from "@/lib/validations/patient";
import { PatientList } from "@/components/patient/patient-list";
import { PatientRegistrationForm } from "@/components/patient/patient-registration-form";
import { PatientDetails } from "@/components/patient/patient-details";
import { AppointmentSchedulingForm } from "@/components/patient/appointment-scheduling-form";
import { VisitRecordForm } from "@/components/patient/visit-record-form";
import { PatientIdentification } from "@/components/patient/patient-identification";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAccess } from "@/lib/access";
import { RoleNotice } from "@/components/layout/role-notice";
import type { Permission } from "@/lib/permissions";
import { useClinicalData } from "@/lib/clinical-store";
import { 
  Users, 
  UserPlus, 
  Calendar, 
  FileText, 
  Search,
  Activity,
  ClipboardList,
  QrCode
} from "lucide-react";

type ViewMode = 
  | "dashboard"
  | "patient-list"
  | "patient-registration"
  | "patient-details"
  | "patient-edit"
  | "appointment-scheduling"
  | "visit-recording"
  | "patient-identification";

export default function PatientManagement() {
  const [currentView, setCurrentView] = useState<ViewMode>("dashboard");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const {
    patients,
    setPatients,
    appointments,
    setAppointments,
    visits,
    setVisits,
    ehrRecords,
    setEHRRecords,
  } = useClinicalData();
  const [isLoading, setIsLoading] = useState(false);
  const { user, can, log } = useAccess();
  const canViewClinical = can("patient.viewClinical");

  // Views that need a permission; everything else is open to anyone with the Patients module.
  const VIEW_PERMISSION: Partial<Record<ViewMode, { permission: Permission; what: string }>> = {
    "patient-registration": { permission: "patient.register", what: "register patients" },
    "patient-edit": { permission: "patient.edit", what: "edit patient records" },
    "appointment-scheduling": { permission: "appointment.book", what: "book appointments" },
    "visit-recording": { permission: "visit.record", what: "record visits" },
  };

  const navigate = (view: ViewMode) => {
    const rule = VIEW_PERMISSION[view];
    if (rule && !can(rule.permission)) {
      toast.error(`Your role can't ${rule.what}`);
      log({ action: "access.denied", summary: `Not permitted to ${rule.what}`, details: [`Missing permission: ${rule.permission}`] });
      return;
    }
    setCurrentView(view);
  };

  const openPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView("patient-details");
    log({
      action: "patient.view",
      entityType: "patient",
      entityId: patient.patientId,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      summary: `Opened the record of ${patient.firstName} ${patient.lastName}`,
    });
  };

  const handlePatientRegistration = async (data: PatientRegistrationFormData) => {
    if (!can("patient.register")) {
      toast.error("Your role can't register patients");
      return;
    }
    setIsLoading(true);
    try {
      const newPatient: Patient = {
        id: Date.now().toString(),
        patientId: `PAT${String(patients.length + 1).padStart(3, '0')}`,
        ...data,
        qrCode: `QR-PAT${String(patients.length + 1).padStart(3, '0')}-2024`,
        barcode: `BC${Date.now()}`,
        rfidId: `RFID${String(patients.length + 1).padStart(3, '0')}`,
        registrationDate: new Date(),
        status: "active"
      };
      
      setPatients([...patients, newPatient]);
      setCurrentView("patient-list");
      toast.success("Patient registered");
      log({
        action: "patient.register",
        entityType: "patient",
        entityId: newPatient.patientId,
        patientId: newPatient.id,
        patientName: `${newPatient.firstName} ${newPatient.lastName}`,
        summary: `Registered ${newPatient.firstName} ${newPatient.lastName} (${newPatient.patientId})`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientEdit = async (data: PatientRegistrationFormData) => {
    if (!selectedPatient) return;
    if (!can("patient.edit")) {
      toast.error("Your role can't edit patient records");
      return;
    }
    
    setIsLoading(true);
    try {
      const updatedPatient: Patient = {
        ...selectedPatient,
        ...data
      };
      
      setPatients(patients.map(p => p.id === selectedPatient.id ? updatedPatient : p));
      setSelectedPatient(updatedPatient);
      setCurrentView("patient-details");
      toast.success("Patient updated");
      log({
        action: "patient.update",
        entityType: "patient",
        entityId: selectedPatient.patientId,
        patientId: selectedPatient.id,
        patientName: `${data.firstName} ${data.lastName}`,
        summary: `Updated the record of ${data.firstName} ${data.lastName}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointmentScheduling = async (data: AppointmentFormData) => {
    setIsLoading(true);
    try {
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        ...data,
        status: "scheduled"
      };
      
      setAppointments([...appointments, newAppointment]);
      setCurrentView("patient-details");
      toast.success("Appointment scheduled");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisitRecording = async (data: VisitFormData) => {
    setIsLoading(true);
    try {
      const newVisit: Visit = {
        id: Date.now().toString(),
        ...data,
        status: "completed"
      };
      
      // Update visit history
      setVisits([...visits, newVisit]);
      
      // Create EHR record
      const ehrRecord: EHRRecord = {
        id: Date.now().toString() + "_ehr",
        patientId: data.patientId,
        recordType: "visit",
        date: data.visitDate,
        title: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Visit`,
        description: `Chief Complaint: ${data.chiefComplaint}. ${data.diagnosis ? `Diagnosis: ${data.diagnosis}.` : ''} ${data.treatment ? `Treatment: ${data.treatment}.` : ''}`,
        doctorId: data.doctorId,
        doctorName: data.doctorName,
        department: data.department
      };
      
      setEHRRecords([...ehrRecords, ehrRecord]);
      
      // Update patient's last visit date
      if (selectedPatient) {
        const updatedPatient = {
          ...selectedPatient,
          lastVisit: data.visitDate
        };
        setPatients(patients.map(p => p.id === selectedPatient.id ? updatedPatient : p));
        setSelectedPatient(updatedPatient);
      }
      
      setCurrentView("patient-details");
      toast.success("Visit recorded");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientIdentification = (patientId: string, method: string) => {
    // In a real app, this would search for the patient in the database
    const patient = patients.find(p => 
      p.patientId === patientId || 
      p.qrCode === patientId || 
      p.barcode === patientId || 
      p.rfidId === patientId ||
      p.firstName.toLowerCase().includes(patientId.toLowerCase()) ||
      p.lastName.toLowerCase().includes(patientId.toLowerCase()) ||
      p.phone.includes(patientId)
    );
    
    if (patient) {
      openPatient(patient);
    } else {
      toast.error("Patient not found", { description: "No patient matches that identification." });
    }
  };

  const getPatientAppointments = (patientId: string) => {
    return appointments.filter(a => a.patientId === patientId);
  };

  const getPatientVisits = (patientId: string) => {
    return canViewClinical ? visits.filter(v => v.patientId === patientId) : [];
  };

  const getPatientEHRRecords = (patientId: string) => {
    return canViewClinical ? ehrRecords.filter(r => r.patientId === patientId) : [];
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Patient Management Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive patient care and record management system
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setCurrentView("patient-identification")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Patient Check-in</CardTitle>
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Quick patient identification and check-in
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("patient-registration")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Register Patient</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Register new patients to the system
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setCurrentView("patient-list")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Patient Records</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    View and manage patient records
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("appointment-scheduling")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Schedule Appointment</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Schedule patient appointments
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{patients.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered in system
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{patients.filter(p => p.status === "active").length}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appointments.filter(a => {
                      const today = new Date();
                      const appointmentDate = new Date(a.appointmentDate);
                      return appointmentDate.toDateString() === today.toDateString();
                    }).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Scheduled for today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{visits.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Medical visits recorded
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "patient-identification":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Patient Identification</h1>
                <p className="text-muted-foreground">
                  Identify patients using QR codes, barcodes, RFID, or manual search
                </p>
              </div>
              <Button variant="outline" onClick={() => setCurrentView("dashboard")}>
                Back to Dashboard
              </Button>
            </div>
            <PatientIdentification
              onPatientFound={handlePatientIdentification}
              onError={(error) => toast.error(error)}
            />
          </div>
        );

      case "patient-list":
        return (
          <PatientList
            patients={patients}
            onAddPatient={() => navigate("patient-registration")}
            onViewPatient={openPatient}
            onEditPatient={(patient) => {
              setSelectedPatient(patient);
              navigate("patient-edit");
            }}
            onViewEHR={openPatient}
            onScheduleAppointment={(patient) => {
              setSelectedPatient(patient);
              navigate("appointment-scheduling");
            }}
          />
        );

      case "patient-registration":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Patient Registration</h1>
                <p className="text-muted-foreground">
                  Register a new patient in the system
                </p>
              </div>
              <Button variant="outline" onClick={() => setCurrentView("dashboard")}>
                Back to Dashboard
              </Button>
            </div>
            <PatientRegistrationForm
              onSubmit={handlePatientRegistration}
              onCancel={() => setCurrentView("dashboard")}
            />
          </div>
        );

      case "patient-details":
        return selectedPatient ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={() => setCurrentView("patient-list")}>
                ← Back to Patient List
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => navigate("visit-recording")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Record Visit
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate("appointment-scheduling")}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
              </div>
            </div>
            <PatientDetails
              patient={selectedPatient}
              appointments={getPatientAppointments(selectedPatient.patientId)}
              visits={getPatientVisits(selectedPatient.patientId)}
              ehrRecords={getPatientEHRRecords(selectedPatient.patientId)}
              onEdit={() => navigate("patient-edit")}
              onClose={() => setCurrentView("patient-list")}
            />
          </div>
        ) : null;

      case "patient-edit":
        return selectedPatient ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Edit Patient Information</h1>
                <p className="text-muted-foreground">
                  Update {selectedPatient.firstName} {selectedPatient.lastName}'s information
                </p>
              </div>
              <Button variant="outline" onClick={() => setCurrentView("patient-details")}>
                Cancel
              </Button>
            </div>
            <PatientRegistrationForm
              onSubmit={handlePatientEdit}
              onCancel={() => setCurrentView("patient-details")}
              initialData={selectedPatient}
              isEditing={true}
            />
          </div>
        ) : null;

      case "appointment-scheduling":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Schedule Appointment</h1>
                <p className="text-muted-foreground">
                  {selectedPatient 
                    ? `Schedule appointment for ${selectedPatient.firstName} ${selectedPatient.lastName}`
                    : "Schedule a new patient appointment"
                  }
                </p>
              </div>
              <Button variant="outline" onClick={() => setCurrentView(selectedPatient ? "patient-details" : "dashboard")}>
                Cancel
              </Button>
            </div>
            <AppointmentSchedulingForm
              onSubmit={handleAppointmentScheduling}
              onCancel={() => setCurrentView(selectedPatient ? "patient-details" : "dashboard")}
              preSelectedPatientId={selectedPatient?.patientId}
              preSelectedPatientName={selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : undefined}
            />
          </div>
        );

      case "visit-recording":
        return selectedPatient ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={() => setCurrentView("patient-details")}>
                ← Back to Patient Details
              </Button>
            </div>
            <VisitRecordForm
              onSubmit={handleVisitRecording}
              onCancel={() => setCurrentView("patient-details")}
              preSelectedPatientId={selectedPatient.patientId}
              preSelectedPatientName={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
            />
          </div>
        ) : null;

      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        {user && (
          <RoleNotice
            role={user.role}
            limits={[
              !can("patient.register") && "you can't register patients",
              !can("patient.edit") && "you can't edit patient records",
              !canViewClinical && "clinical records are hidden",
            ].filter(Boolean) as string[]}
          />
        )}
        {renderCurrentView()}
      </div>
    </div>
  );
}