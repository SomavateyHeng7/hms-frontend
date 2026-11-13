import { z } from 'zod';

export const bedSchema = z.object({
  bedNumber: z.string().min(1, 'Bed number is required'),
  wardId: z.string().min(1, 'Ward is required'),
  bedType: z.enum(['general', 'icu', 'private', 'semi-private', 'isolation']),
  status: z.enum(['available', 'occupied', 'maintenance', 'reserved']),
  floor: z.string().min(1, 'Floor is required'),
  features: z.array(z.string()).default([]),
  dailyRate: z.number().min(0, 'Daily rate must be positive'),
  notes: z.string().optional(),
});

export const wardSchema = z.object({
  name: z.string().min(1, 'Ward name is required'),
  code: z.string().min(1, 'Ward code is required'),
  department: z.string().min(1, 'Department is required'),
  floor: z.string().min(1, 'Floor is required'),
  wardType: z.enum(['general', 'icu', 'nicu', 'pediatric', 'maternity', 'isolation']),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  features: z.array(z.string()).default([]),
});

export const admissionSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  admissionDate: z.date(),
  admittingDoctorId: z.string().min(1, 'Admitting doctor is required'),
  department: z.string().min(1, 'Department is required'),
  wardId: z.string().min(1, 'Ward is required'),
  bedId: z.string().min(1, 'Bed is required'),
  admissionType: z.enum(['emergency', 'elective', 'transfer', 'delivery']),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  chiefComplaint: z.string().min(1, 'Chief complaint is required'),
  estimatedDuration: z.number().optional(),
  insuranceInfo: z.object({
    provider: z.string(),
    policyNumber: z.string(),
    coverage: z.number(),
  }).optional(),
  notes: z.string().optional(),
});

export const vitalSignsSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  admissionId: z.string().min(1, 'Admission is required'),
  recordedAt: z.date(),
  temperature: z.number().min(32).max(45, 'Temperature must be between 32°C and 45°C'),
  bloodPressureSystolic: z.number().min(50).max(250, 'Systolic BP must be between 50 and 250'),
  bloodPressureDiastolic: z.number().min(30).max(150, 'Diastolic BP must be between 30 and 150'),
  heartRate: z.number().min(20).max(250, 'Heart rate must be between 20 and 250'),
  respiratoryRate: z.number().min(5).max(60, 'Respiratory rate must be between 5 and 60'),
  oxygenSaturation: z.number().min(0).max(100, 'O2 saturation must be between 0 and 100'),
  bloodGlucose: z.number().optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
  painLevel: z.number().min(0).max(10).optional(),
  consciousness: z.enum(['alert', 'verbal', 'pain', 'unresponsive']),
  notes: z.string().optional(),
});

export const nursingNoteSchema = z.object({
  admissionId: z.string().min(1, 'Admission is required'),
  patientId: z.string().min(1, 'Patient is required'),
  shift: z.enum(['morning', 'afternoon', 'night']),
  noteType: z.enum(['assessment', 'intervention', 'evaluation', 'handover']),
  category: z.enum(['general', 'medication', 'wound-care', 'mobility', 'nutrition', 'elimination', 'safety']),
  note: z.string().min(10, 'Note must be at least 10 characters'),
  actionTaken: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  priority: z.enum(['routine', 'important', 'urgent']),
});

export const transferSchema = z.object({
  admissionId: z.string().min(1, 'Admission is required'),
  toWardId: z.string().min(1, 'Destination ward is required'),
  toBedId: z.string().min(1, 'Destination bed is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  notes: z.string().optional(),
});

export const dischargeSchema = z.object({
  admissionId: z.string().min(1, 'Admission is required'),
  dischargeDate: z.date(),
  dischargeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  dischargeType: z.enum(['routine', 'against-medical-advice', 'transfer', 'deceased', 'absconded']),
  finalDiagnosis: z.string().min(10, 'Final diagnosis is required'),
  dischargeSummary: z.string().min(50, 'Discharge summary must be at least 50 characters'),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
  })).default([]),
  followUpDate: z.date().optional(),
  followUpInstructions: z.string().optional(),
  dietaryInstructions: z.string().optional(),
  activityRestrictions: z.string().optional(),
  warningSignsEducation: z.string().optional(),
  dischargeCondition: z.enum(['improved', 'stable', 'critical', 'deceased']),
  homeCarePlan: z.string().optional(),
  referralRequired: z.boolean().default(false),
  referralDetails: z.string().optional(),
});

export const medicationAdministrationSchema = z.object({
  admissionId: z.string().min(1, 'Admission is required'),
  patientId: z.string().min(1, 'Patient is required'),
  medicationName: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  route: z.enum(['oral', 'iv', 'im', 'subcutaneous', 'topical', 'inhalation']),
  scheduledTime: z.date(),
  notes: z.string().optional(),
});
