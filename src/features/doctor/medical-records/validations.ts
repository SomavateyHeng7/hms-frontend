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

export const consentFormSchema = z
  .object({
    patientId: z.string().min(1, 'Patient is required'),
    consentType: z.enum(['surgery', 'procedure', 'anesthesia', 'blood-transfusion', 'research', 'photography', 'general-treatment', 'other']),
    procedureName: z.string().trim().min(5, 'Procedure name is required'),
    procedureDescription: z.string().trim().min(20, 'Procedure description must be at least 20 characters'),
    relatedProcedureId: z.string().optional(),
    risks: z.array(z.string().trim().min(1)).min(1, 'At least one risk must be listed'),
    benefits: z.array(z.string().trim().min(1)).min(1, 'At least one benefit must be listed'),
    alternatives: z.array(z.string().trim().min(1)),

    explainedBy: z.string().trim().min(2, 'Name of the clinician who explained the procedure is required'),
    explainedByDesignation: z.string().trim().min(2, 'Designation is required'),

    patientUnderstands: z.boolean().refine((v) => v, 'Confirm the consenter understands the information'),
    questionsAnswered: z.boolean().refine((v) => v, "Confirm the consenter's questions were answered"),

    consentGivenBy: z.enum(['patient', 'guardian', 'legal-representative']),
    guardianName: z.string().trim().optional(),
    guardianRelation: z.string().trim().optional(),
    guardianPhone: z.string().trim().optional(),

    signatureName: z.string().trim().min(2, 'The consenter must sign by typing their full name'),
    witnessName: z.string().trim().min(2, 'Witness name is required'),
  })
  .superRefine((data, ctx) => {
    if (data.signatureName && data.witnessName && data.signatureName.toLowerCase() === data.witnessName.toLowerCase()) {
      ctx.addIssue({ code: 'custom', path: ['witnessName'], message: 'The witness must be a different person from the consenter' });
    }
    if (data.consentGivenBy === 'patient') return;
    if (!data.guardianName || data.guardianName.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['guardianName'], message: 'Name is required when consent is not given by the patient' });
    }
    if (!data.guardianRelation || data.guardianRelation.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['guardianRelation'], message: 'Relationship to the patient is required' });
    }
    if (!data.guardianPhone || !/^\+?[\d\s-]{7,15}$/.test(data.guardianPhone)) {
      ctx.addIssue({ code: 'custom', path: ['guardianPhone'], message: 'A valid phone number is required' });
    }
  });

export type ConsentFormData = z.infer<typeof consentFormSchema>;

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
