"use client";

import React, { useState, useEffect } from "react";
import { Patient, Appointment, Visit, EHRRecord } from "@/features/front-desk/patients/types";
import { PatientRegistrationFormData, AppointmentFormData, VisitFormData } from "@/features/front-desk/patients/validations";
import { PatientList } from "@/features/front-desk/patients/components/patient-list";
import { PatientRegistrationForm } from "@/features/front-desk/patients/components/patient-registration-form";
import { PatientDetails } from "@/features/front-desk/patients/components/patient-details";
import { AppointmentSchedulingForm } from "@/features/front-desk/patients/components/appointment-scheduling-form";
import { VisitRecordForm } from "@/features/front-desk/patients/components/visit-record-form";
import { PatientIdentification } from "@/features/front-desk/patients/components/patient-identification";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [ehrRecords, setEHRRecords] = useState<EHRRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load mock data on component mount
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock patients data
    const mockPatients: Patient[] = [
      {
        id: "1",
        patientId: "PAT001",
        firstName: "John",
        lastName: "Smith",
        dateOfBirth: new Date("1985-03-15"),
        gender: "male",
        bloodType: "O+",
        email: "john.smith@email.com",
        phone: "555-123-4567",
        emergencyContact: {
          name: "Jane Smith",
          relationship: "Spouse",
          phone: "555-123-4568"
        },
        address: {
          street: "123 Main St",
          city: "Anytown",
          state: "CA",
          zipCode: "12345",
          country: "USA"
        },
        insurance: {
          provider: "Blue Cross Blue Shield",
          policyNumber: "BC123456789",
          membershipId: "BCBS001"
        },
        medicalHistory: "No significant medical history",
        allergies: "Penicillin",
        currentMedications: "None",
        qrCode: "QR-PAT001-2024",
        barcode: "BC001234567890",
        rfidId: "RFID001",
        registrationDate: new Date("2024-01-15"),
        lastVisit: new Date("2024-10-01"),
        status: "active"
      },
      {
        id: "2",
        patientId: "PAT002",
        firstName: "Mary",
        lastName: "Johnson",
        dateOfBirth: new Date("1978-08-22"),
        gender: "female",
        bloodType: "A-",
        email: "mary.johnson@email.com",
        phone: "555-234-5678",
        emergencyContact: {
          name: "Robert Johnson",
          relationship: "Spouse",
          phone: "555-234-5679"
        },
        address: {
          street: "456 Oak Ave",
          city: "Springfield",
          state: "IL",
          zipCode: "62701",
          country: "USA"
        },
        medicalHistory: "Diabetes Type 2, diagnosed 2020",
        allergies: "Shellfish",
        currentMedications: "Metformin 500mg twice daily",
        qrCode: "QR-PAT002-2024",
        registrationDate: new Date("2024-02-10"),
        status: "active"
      }
    ];

    // Mock appointments
    const mockAppointments: Appointment[] = [
      {
        id: "1",
        patientId: "PAT001",
        doctorId: "DOC001",
        doctorName: "Dr. Sarah Johnson",
        appointmentDate: new Date("2024-11-20"),
        appointmentTime: "10:00",
        duration: 30,
        type: "consultation",
        status: "scheduled",
        reason: "Annual checkup",
        department: "General Medicine"
      }
    ];

    // Mock visits
    const mockVisits: Visit[] = [
      {
        id: "1",
        patientId: "PAT001",
        visitDate: new Date("2024-10-01"),
        visitTime: "14:30",
        type: "routine",
        chiefComplaint: "Annual physical examination",
        diagnosis: "Overall good health",
        treatment: "Continue current lifestyle",
        vitals: {
          temperature: 98.6,
          bloodPressure: "120/80",
          heartRate: 72,
          weight: 175,
          height: 70
        },
        doctorId: "DOC002",
        doctorName: "Dr. Michael Chen",
        department: "General Medicine",
        status: "completed"
      }
    ];

    // Mock EHR records
    const mockEHRRecords: EHRRecord[] = [
      {
        id: "1",
        patientId: "PAT001",
        recordType: "visit",
        date: new Date("2024-10-01"),
        title: "Annual Physical Examination",
        description: "Comprehensive physical examination. Patient in good health.",
        doctorId: "DOC002",
        doctorName: "Dr. Michael Chen",
        department: "General Medicine"
      }
    ];

    setPatients(mockPatients);
    setAppointments(mockAppointments);
    setVisits(mockVisits);
    setEHRRecords(mockEHRRecords);
  };

  const handlePatientRegistration = async (data: PatientRegistrationFormData) => {
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
      // In a real app, you'd show a success toast here
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientEdit = async (data: PatientRegistrationFormData) => {
    if (!selectedPatient) return;
    
    setIsLoading(true);
    try {
      const updatedPatient: Patient = {
        ...selectedPatient,
        ...data
      };
      
      setPatients(patients.map(p => p.id === selectedPatient.id ? updatedPatient : p));
      setSelectedPatient(updatedPatient);
      setCurrentView("patient-details");
      // In a real app, you'd show a success toast here
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
      // In a real app, you'd show a success toast here
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
      // In a real app, you'd show a success toast here
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
      setSelectedPatient(patient);
      setCurrentView("patient-details");
    } else {
      // In a real app, you'd show an error toast here
      alert("Patient not found. Please check the identifier and try again.");
    }
  };

  const getPatientAppointments = (patientId: string) => {
    return appointments.filter(a => a.patientId === patientId);
  };

  const getPatientVisits = (patientId: string) => {
    return visits.filter(v => v.patientId === patientId);
  };

  const getPatientEHRRecords = (patientId: string) => {
    return ehrRecords.filter(r => r.patientId === patientId);
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

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setCurrentView("patient-registration")}>
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

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setCurrentView("appointment-scheduling")}>
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
              onError={(error) => alert(error)} // In a real app, use a toast
            />
          </div>
        );

      case "patient-list":
        return (
          <PatientList
            patients={patients}
            onAddPatient={() => setCurrentView("patient-registration")}
            onViewPatient={(patient) => {
              setSelectedPatient(patient);
              setCurrentView("patient-details");
            }}
            onEditPatient={(patient) => {
              setSelectedPatient(patient);
              setCurrentView("patient-edit");
            }}
            onViewEHR={(patient) => {
              setSelectedPatient(patient);
              setCurrentView("patient-details");
            }}
            onScheduleAppointment={(patient) => {
              setSelectedPatient(patient);
              setCurrentView("appointment-scheduling");
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
                  onClick={() => setCurrentView("visit-recording")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Record Visit
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setCurrentView("appointment-scheduling")}
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
              onEdit={() => setCurrentView("patient-edit")}
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
        {renderCurrentView()}
      </div>
    </div>
  );
}