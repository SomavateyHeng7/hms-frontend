import { z } from 'zod';

export const queueTokenSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required'),
  patientPhone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  department: z.string().min(1, 'Department is required'),
  service: z.string().min(1, 'Service is required'),
  serviceType: z.enum(['opd', 'laboratory', 'radiology', 'pharmacy', 'billing', 'registration', 'other']),
  priority: z.enum(['normal', 'senior-citizen', 'disabled', 'pregnant', 'emergency', 'vip']),
  appointmentId: z.string().optional(),
  notes: z.string().optional(),
});

export const queueCounterSchema = z.object({
  counterNumber: z.string().min(1, 'Counter number is required'),
  counterName: z.string().min(2, 'Counter name is required'),
  department: z.string().min(1, 'Department is required'),
  services: z.array(z.string()).min(1, 'At least one service is required'),
  location: z.string().min(1, 'Location is required'),
});

export const queueFeedbackSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  waitTimeRating: z.number().min(1).max(5).optional(),
  serviceQualityRating: z.number().min(1).max(5).optional(),
  staffBehaviorRating: z.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
  complaints: z.string().optional(),
  suggestions: z.string().optional(),
});
