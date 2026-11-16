import { z } from "zod";

export const opdRegistrationSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["male", "female", "other"]),
    phoneNumber: z.string().min(10, "Valid phone number is required"),
    email: z.string().email("Valid email is required").optional(),
    emergencyContactName: z.string().min(1, "Emergency contact name is required"),
    emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
    emergencyContactRelation: z.string().min(1, "Emergency contact relation is required"),
  }),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "ZIP code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  insurance: z.object({
    hasInsurance: z.boolean(),
    provider: z.string().optional(),
    policyNumber: z.string().optional(),
    groupNumber: z.string().optional(),
    validUntil: z.string().optional(),
    copay: z.number().min(0).optional(),
  }),
  medicalHistory: z.object({
    allergies: z.string(),
    currentMedications: z.string(),
    pastMedicalHistory: z.string(),
    familyHistory: z.string(),
    socialHistory: z.string(),
  }),
  visitInfo: z.object({
    department: z.string().min(1, "Department is required"),
    visitType: z.enum(["new_patient", "follow_up", "emergency", "consultation"]),
    chiefComplaint: z.string().min(1, "Chief complaint is required"),
    referringDoctor: z.string().optional(),
    preferredAppointmentTime: z.string().optional(),
  }),
});

export const consultationNoteSchema = z.object({
  chiefComplaint: z.string().min(1, "Chief complaint is required"),
  historyOfPresentIllness: z.string().min(1, "History of present illness is required"),
  reviewOfSystems: z.object({
    constitutional: z.string(),
    cardiovascular: z.string(),
    respiratory: z.string(),
    gastrointestinal: z.string(),
    genitourinary: z.string(),
    musculoskeletal: z.string(),
    neurological: z.string(),
    psychiatric: z.string(),
    endocrine: z.string(),
    hematologic: z.string(),
    allergic: z.string(),
  }),
  physicalExamination: z.object({
    vitalSigns: z.object({
      temperature: z.number().min(90).max(110),
      bloodPressure: z.string().min(1, "Blood pressure is required"),
      heartRate: z.number().min(40).max(200),
      respiratoryRate: z.number().min(8).max(40),
      oxygenSaturation: z.number().min(70).max(100),
      height: z.number().min(20).max(300),
      weight: z.number().min(1).max(500),
      bmi: z.number().min(10).max(50),
    }),
    generalAppearance: z.string(),
    heent: z.string(),
    cardiovascular: z.string(),
    pulmonary: z.string(),
    abdominal: z.string(),
    musculoskeletal: z.string(),
    neurological: z.string(),
    skin: z.string(),
    other: z.string(),
  }),
  assessment: z.string().min(1, "Assessment is required"),
  differentialDiagnosis: z.array(z.string()),
  plan: z.string().min(1, "Plan is required"),
  followUpInstructions: z.string(),
  nextAppointment: z.string().optional(),
});

export const diagnosisSchema = z.object({
  icdCode: z.string().min(1, "ICD code is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["primary", "secondary", "rule_out", "differential"]),
  severity: z.enum(["mild", "moderate", "severe", "critical"]),
  status: z.enum(["active", "resolved", "chronic", "inactive"]),
  onsetDate: z.string().min(1, "Onset date is required"),
  notes: z.string().optional(),
});

export const treatmentPlanSchema = z.object({
  planType: z.enum(["medication", "procedure", "therapy", "surgery", "observation", "referral"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  instructions: z.string().min(1, "Instructions are required"),
  duration: z.string().optional(),
  frequency: z.string().optional(),
  dosage: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

export const prescriptionSchema = z.object({
  type: z.enum(["regular", "emergency", "repeat", "discharge"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["active", "completed", "cancelled", "expired", "on_hold"]),
  notes: z.string().optional(),
  medications: z.array(z.object({
    name: z.string().min(1, "Medication name is required"),
    genericName: z.string().optional(),
    dosage: z.string().min(1, "Dosage is required"),
    frequency: z.string().min(1, "Frequency is required"),
    duration: z.string().min(1, "Duration is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    instructions: z.string().optional(),
    route: z.enum(["oral", "topical", "injection", "inhalation", "rectal", "sublingual"]),
  })).min(1, "At least one medication is required"),
});

export const opdBillingSchema = z.object({
  status: z.enum(["draft", "pending", "approved", "partial", "paid", "overdue", "cancelled"]),
  paymentStatus: z.enum(["pending", "partial", "paid", "overdue", "refunded"]),
  items: z.array(z.object({
    serviceCode: z.string().min(1, "Service code is required"),
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Unit price cannot be negative"),
    discount: z.number().min(0).max(100),
    taxRate: z.number().min(0).max(100),
  })).min(1, "At least one billing item is required"),
  discount: z.number().min(0).max(100),
  taxRate: z.number().min(0).max(100),
  notes: z.string().optional(),
});

export type OPDRegistrationFormData = z.infer<typeof opdRegistrationSchema>;
export type ConsultationNoteFormData = z.infer<typeof consultationNoteSchema>;
export type DiagnosisFormData = z.infer<typeof diagnosisSchema>;
export type TreatmentPlanFormData = z.infer<typeof treatmentPlanSchema>;
export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;
export type OPDBillingFormData = z.infer<typeof opdBillingSchema>;

/** Bill form data plus the totals the billing screen computes before saving */
export type OPDBillingSubmission = OPDBillingFormData & {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
};