import { z } from 'zod';

export const emergencyCaseSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required'),
  age: z.number().min(0).max(150, 'Invalid age'),
  gender: z.enum(['male', 'female', 'other']),
  
  arrivalMode: z.enum(['walk-in', 'ambulance', 'police', 'referral', 'other']),
  ambulanceNumber: z.string().optional(),
  
  chiefComplaint: z.string().min(5, 'Chief complaint is required'),
  presentingSymptoms: z.array(z.string()).min(1, 'At least one symptom is required'),
  triageCategory: z.enum(['resuscitation', 'emergent', 'urgent', 'semi-urgent', 'non-urgent']),
  
  vitalSigns: z.object({
    temperature: z.number().min(32).max(45),
    bloodPressure: z.string().min(5),
    heartRate: z.number().min(20).max(250),
    respiratoryRate: z.number().min(5).max(60),
    oxygenSaturation: z.number().min(0).max(100),
    consciousness: z.enum(['alert', 'verbal', 'pain', 'unresponsive']),
  }),
  
  initialAssessment: z.string().min(10, 'Initial assessment is required'),
  
  notes: z.string().optional(),
});

export const erBedSchema = z.object({
  bedNumber: z.string().min(1, 'Bed number is required'),
  location: z.string().min(1, 'Location is required'),
  bedType: z.enum(['resuscitation', 'critical', 'observation', 'isolation', 'general']),
  equipment: z.array(z.string()).default([]),
});

export const ambulanceSchema = z.object({
  vehicleNumber: z.string().min(2, 'Vehicle number is required'),
  type: z.enum(['basic', 'advanced', 'air-ambulance', 'neonatal', 'bariatric']),
  equipment: z.array(z.string()).min(1, 'At least one equipment item is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  mileage: z.number().min(0, 'Mileage cannot be negative'),
  fuelLevel: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export const ambulanceTripSchema = z.object({
  ambulanceId: z.string().min(1, 'Ambulance is required'),
  priority: z.enum(['emergency', 'urgent', 'routine', 'non-emergency']),
  
  patientName: z.string().min(2, 'Patient name is required'),
  patientAge: z.number().min(0).max(150).optional(),
  patientGender: z.enum(['male', 'female', 'other']).optional(),
  
  pickupLocation: z.string().min(2, 'Pickup location is required'),
  pickupAddress: z.string().min(10, 'Pickup address is required'),
  
  dropLocation: z.string().min(2, 'Drop location is required'),
  dropAddress: z.string().min(10, 'Drop address is required'),
  
  chiefComplaint: z.string().optional(),
  
  crew: z.array(z.object({
    staffId: z.string(),
    role: z.string(),
  })).min(1, 'At least one crew member is required'),
  
  notes: z.string().optional(),
});

export const erShiftSchema = z.object({
  date: z.date(),
  shiftType: z.enum(['morning', 'afternoon', 'night']),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  
  staff: z.array(z.object({
    staffId: z.string(),
    role: z.enum(['doctor', 'nurse', 'paramedic', 'technician', 'receptionist']),
    isInCharge: z.boolean(),
  })).min(1, 'At least one staff member is required'),
  
  notes: z.string().optional(),
});
