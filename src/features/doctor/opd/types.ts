export interface OPDPatient {
  id: string;
  registrationNumber: string;
  visitNumber: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: "male" | "female" | "other";
    phoneNumber: string;
    email?: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phoneNumber: string;
    };
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
    groupNumber: string;
    validUntil: Date;
    copay: number;
  };
  medicalHistory: {
    allergies: string[];
    currentMedications: string[];
    pastMedicalHistory: string[];
    familyHistory: string[];
    socialHistory: string;
  };
  visitInfo: {
    registrationDate: Date;
    appointmentTime?: Date;
    department: string;
    referringDoctor?: string;
    visitType: "new_patient" | "follow_up" | "emergency" | "consultation";
    priority: "routine" | "urgent" | "emergency";
    chiefComplaint: string;
  };
  status: "registered" | "waiting" | "in_consultation" | "completed" | "cancelled";
}

export interface ConsultationNote {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  visitDate: Date;
  department: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  reviewOfSystems: {
    constitutional: string;
    cardiovascular: string;
    respiratory: string;
    gastrointestinal: string;
    genitourinary: string;
    musculoskeletal: string;
    neurological: string;
    psychiatric: string;
    endocrine: string;
    hematologic: string;
    allergic: string;
  };
  physicalExamination: {
    vitalSigns: {
      temperature: number;
      bloodPressure: string;
      heartRate: number;
      respiratoryRate: number;
      oxygenSaturation: number;
      height: number;
      weight: number;
      bmi: number;
    };
    generalAppearance: string;
    heent: string; // Head, Eyes, Ears, Nose, Throat
    cardiovascular: string;
    pulmonary: string;
    abdominal: string;
    musculoskeletal: string;
    neurological: string;
    skin: string;
    other: string;
  };
  assessment: string;
  differentialDiagnosis: string[];
  plan: string;
  followUpInstructions: string;
  nextAppointment?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Diagnosis {
  id: string;
  patientId: string;
  consultationId: string;
  icdCode: string;
  description: string;
  type: "primary" | "secondary" | "rule_out" | "differential";
  severity: "mild" | "moderate" | "severe" | "critical";
  status: "active" | "resolved" | "chronic" | "inactive";
  onsetDate: Date;
  diagnosedBy: string;
  notes?: string;
  createdAt: Date;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  consultationId: string;
  doctorId: string;
  planType: "medication" | "procedure" | "therapy" | "surgery" | "observation" | "referral";
  title: string;
  description: string;
  instructions: string;
  duration?: string;
  frequency?: string;
  dosage?: string;
  startDate: Date;
  endDate?: Date;
  priority: "low" | "medium" | "high" | "urgent";
  status: "planned" | "in_progress" | "completed" | "cancelled" | "on_hold";
  assignedTo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  consultationId: string;
  doctorId: string;
  doctorName: string;
  doctorSignature?: string;
  licenseNumber: string;
  medications: PrescriptionMedication[];
  instructions: string;
  duration: string;
  followUpDate?: Date;
  status: "active" | "completed" | "cancelled" | "expired";
  issuedDate: Date;
  validUntil: Date;
  pharmacyNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrescriptionMedication {
  id: string;
  drugName: string;
  genericName?: string;
  strength: string;
  dosageForm: "tablet" | "capsule" | "syrup" | "injection" | "cream" | "drops" | "inhaler" | "patch";
  quantity: number;
  dosage: string;
  frequency: string;
  route: "oral" | "iv" | "im" | "sc" | "topical" | "inhalation" | "rectal" | "sublingual";
  duration: string;
  instructions: string;
  substitutionAllowed: boolean;
  refills: number;
  remainingRefills: number;
  drugInteractions?: string[];
  warnings?: string[];
  sideEffects?: string[];
}

export interface OPDRegistrationForm {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: "male" | "female" | "other";
    phoneNumber: string;
    email: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  insurance: {
    hasInsurance: boolean;
    provider: string;
    policyNumber: string;
    groupNumber: string;
    validUntil: string;
    copay: number;
  };
  medicalHistory: {
    allergies: string;
    currentMedications: string;
    pastMedicalHistory: string;
    familyHistory: string;
    socialHistory: string;
  };
  visitInfo: {
    department: string;
    visitType: "new_patient" | "follow_up" | "emergency" | "consultation";
    chiefComplaint: string;
    referringDoctor: string;
    preferredAppointmentTime: string;
  };
}