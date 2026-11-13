export type Sex = "male" | "female";

export type CoverageScheme = "none" | "nssf" | "hef" | "private";

/** Who pays, as recorded at registration. Eligibility checks and claims happen in billing. */
export interface PatientCoverage {
  scheme: CoverageScheme;
  /** NSSF member number or Health Equity Fund (equity card) number. */
  memberId?: string;
  /** Private insurer name. */
  insurer?: string;
  policyNumber?: string;
}

/** Cambodian address. Area ids refer to src/lib/cambodia/address.ts. */
export interface PatientAddress {
  provinceId: string;
  districtId: string;
  communeId: string;
  village?: string;
  houseStreet?: string;
}

export type IdentityDocument =
  | { type: "national_id"; number: string }
  | { type: "passport"; number: string; nationality: string }
  | { type: "none" };

/**
 * A registered patient. Dates are ISO strings (as a JSON API returns them).
 * Names are stored family name first, as written in Cambodia.
 */
export interface Patient {
  id: string;
  /** Hospital number shown on cards and documents, e.g. "PT-000123". */
  patientId: string;
  khmerName: { family: string; given: string };
  latinName: { family: string; given: string };
  sex: Sex;
  /** Exact date of birth (YYYY-MM-DD) when known. */
  dateOfBirth?: string;
  /** Age in years at registration when the birth date is unknown. */
  estimatedAge?: number;
  identity: IdentityDocument;
  phone: string;
  address: PatientAddress;
  coverage: PatientCoverage;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  currentMedications?: string;
  qrCode: string;
  registeredAt: string;
  lastVisitAt?: string;
  status: "active" | "inactive" | "deceased";
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
  metadata?: Record<string, unknown>;
}