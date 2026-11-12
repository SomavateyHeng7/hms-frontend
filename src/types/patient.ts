export interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  bloodType?: string;
  email?: string;
  phone: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
    membershipId: string;
  };
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  qrCode?: string;
  barcode?: string;
  rfidId?: string;
  registrationDate: Date;
  lastVisit?: Date;
  status: 'active' | 'inactive' | 'deceased';
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number; // in minutes
  type: 'consultation' | 'follow-up' | 'surgery' | 'test' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  department: string;
  roomNumber?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  appointmentId?: string;
  visitDate: Date;
  visitTime: string;
  type: 'routine' | 'emergency' | 'follow-up' | 'consultation';
  chiefComplaint: string;
  diagnosis?: string;
  treatment?: string;
  prescriptions?: string;
  vitals?: {
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    respiratoryRate?: number;
    weight?: number;
    height?: number;
  };
  notes?: string;
  doctorId: string;
  doctorName: string;
  department: string;
  status: 'active' | 'completed';
}

export interface EHRRecord {
  id: string;
  patientId: string;
  recordType: 'visit' | 'test' | 'diagnosis' | 'prescription' | 'allergy' | 'vaccination';
  date: Date;
  title: string;
  description: string;
  doctorId: string;
  doctorName: string;
  department: string;
  attachments?: string[];
  metadata?: Record<string, any>;
}