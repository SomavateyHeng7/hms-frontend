import { z } from 'zod';

export const operationTheaterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code is required'),
  floor: z.string().min(1, 'Floor is required'),
  type: z.enum(['general', 'cardiac', 'neuro', 'orthopedic', 'emergency', 'specialized']),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  equipment: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
});

export const surgerySchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  surgeryType: z.string().min(2, 'Surgery type is required'),
  surgeryName: z.string().min(2, 'Surgery name is required'),
  operationTheaterId: z.string().min(1, 'Operation theater is required'),
  scheduledDate: z.date(),
  scheduledStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  scheduledEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  estimatedDuration: z.number().min(15, 'Duration must be at least 15 minutes'),
  priority: z.enum(['emergency', 'urgent', 'elective', 'routine']),
  
  diagnosis: z.string().min(10, 'Diagnosis must be at least 10 characters'),
  surgicalProcedure: z.string().min(10, 'Surgical procedure description is required'),
  anesthesiaType: z.enum(['general', 'regional', 'local', 'sedation']),
  preOpInstructions: z.string().min(10, 'Pre-operative instructions are required'),
  consentObtained: z.boolean().refine((val) => val === true, 'Consent must be obtained'),
  
  surgeonId: z.string().min(1, 'Surgeon is required'),
  anesthesiologistId: z.string().min(1, 'Anesthesiologist is required'),
  
  requiredEquipment: z.array(z.string()).min(1, 'At least one equipment item is required'),
  requiredInstruments: z.array(z.string()).default([]),
  specialRequirements: z.string().optional(),
  notes: z.string().optional(),
});

export const surgicalTeamSchema = z.object({
  name: z.string().min(2, 'Team name is required'),
  specialization: z.string().min(2, 'Specialization is required'),
  members: z.array(z.object({
    staffId: z.string(),
    role: z.enum(['surgeon', 'assistant-surgeon', 'anesthesiologist', 'scrub-nurse', 'circulating-nurse']),
    isLead: z.boolean(),
  })).min(2, 'At least 2 team members are required'),
  availableDays: z.array(z.string()).min(1, 'At least one available day is required'),
});

export const otEquipmentSchema = z.object({
  name: z.string().min(2, 'Equipment name is required'),
  code: z.string().min(2, 'Equipment code is required'),
  category: z.enum(['surgical', 'anesthesia', 'monitoring', 'life-support', 'imaging', 'other']),
  operationTheaterId: z.string().optional(),
  manufacturer: z.string().min(2, 'Manufacturer is required'),
  model: z.string().min(1, 'Model is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  purchaseDate: z.date(),
  maintenanceSchedule: z.enum(['weekly', 'monthly', 'quarterly', 'annually']),
  notes: z.string().optional(),
});

export const preOpChecklistSchema = z.object({
  surgeryId: z.string().min(1, 'Surgery is required'),
  patientId: z.string().min(1, 'Patient is required'),
  items: z.array(z.object({
    category: z.enum(['patient-verification', 'consent', 'medical-history', 'medications', 'allergies', 'pre-op-tests', 'equipment', 'team']),
    item: z.string(),
    checked: z.boolean(),
    notes: z.string().optional(),
  })).min(1, 'At least one checklist item is required'),
});

export const postOpRecordSchema = z.object({
  surgeryId: z.string().min(1, 'Surgery is required'),
  patientId: z.string().min(1, 'Patient is required'),
  vitalSigns: z.object({
    temperature: z.number().min(32).max(45),
    bloodPressure: z.string(),
    heartRate: z.number().min(20).max(250),
    respiratoryRate: z.number().min(5).max(60),
    oxygenSaturation: z.number().min(0).max(100),
  }),
  consciousness: z.enum(['alert', 'drowsy', 'sedated', 'unresponsive']),
  painLevel: z.number().min(0).max(10),
  drainageOutput: z.number().optional(),
  complications: z.string().optional(),
  nursingNotes: z.string().min(10, 'Nursing notes are required'),
});
