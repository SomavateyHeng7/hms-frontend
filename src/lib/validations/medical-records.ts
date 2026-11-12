import { z } from 'zod';

export const medicalCertificateSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  certificateType: z.enum(['sick-leave', 'fitness', 'disability', 'death', 'birth', 'vaccination', 'medical-examination', 'other']),
  purpose: z.string().min(10, 'Purpose is required'),
  diagnosis: z.string().optional(),
  recommendations: z.string().optional(),
  restrictions: z.string().optional(),
  leaveDays: z.number().min(1).optional(),
  validFrom: z.date().optional(),
  validTo: z.date().optional(),
  certificateText: z.string().min(50, 'Certificate text must be at least 50 characters'),
  notes: z.string().optional(),
});

export const dischargeSummarySchema = z.object({
  admissionId: z.string().min(1, 'Admission is required'),
  patientId: z.string().min(1, 'Patient is required'),
  reasonForAdmission: z.string().min(10, 'Reason for admission is required'),
  clinicalFindings: z.string().min(20, 'Clinical findings are required'),
  primaryDiagnosis: z.string().min(5, 'Primary diagnosis is required'),
  treatmentGiven: z.string().min(20, 'Treatment given is required'),
  courseInHospital: z.string().min(20, 'Course in hospital is required'),
  conditionAtDischarge: z.enum(['improved', 'same', 'worse', 'deceased']),
  followUpInstructions: z.string().min(20, 'Follow-up instructions are required'),
  warningSignsToWatch: z.array(z.string()).min(1, 'At least one warning sign is required'),
});

export const consentFormSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  consentType: z.enum(['surgery', 'procedure', 'anesthesia', 'blood-transfusion', 'research', 'photography', 'general-treatment', 'other']),
  procedureName: z.string().min(5, 'Procedure name is required'),
  procedureDescription: z.string().min(20, 'Procedure description is required'),
  risks: z.array(z.string()).min(1, 'At least one risk must be listed'),
  benefits: z.array(z.string()).min(1, 'At least one benefit must be listed'),
  alternatives: z.array(z.string()).default([]),
  consentGivenBy: z.enum(['patient', 'guardian', 'legal-representative']),
  guardianName: z.string().optional(),
  guardianRelation: z.string().optional(),
  witnessName: z.string().min(2, 'Witness name is required'),
});

export const referralLetterSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  referredTo: z.string().min(2, 'Referred to is required'),
  referredDepartment: z.string().min(2, 'Department is required'),
  referredSpecialization: z.string().min(2, 'Specialization is required'),
  urgency: z.enum(['emergency', 'urgent', 'routine']),
  reasonForReferral: z.string().min(20, 'Reason for referral is required'),
  clinicalSummary: z.string().min(30, 'Clinical summary is required'),
  provisionalDiagnosis: z.string().min(5, 'Provisional diagnosis is required'),
  notes: z.string().optional(),
});
