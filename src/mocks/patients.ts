import type { Patient, Appointment, Visit, EHRRecord } from "@/types/patient";

// Placeholder data - to be replaced by API calls once the backend exists
export const mockPatients: Patient[] = [
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
export const mockAppointments: Appointment[] = [
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
export const mockVisits: Visit[] = [
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
export const mockEHRRecords: EHRRecord[] = [
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

