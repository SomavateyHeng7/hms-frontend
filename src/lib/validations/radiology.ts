import { z } from "zod";

export const imagingOrderSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  imagingType: z.enum(["xray", "mri", "ct", "ultrasound", "mammography", "nuclear_medicine", "pet_scan", "fluoroscopy"]),
  examType: z.string().min(1, "Exam type is required"),
  bodyPart: z.string().min(1, "Body part is required"),
  clinicalIndication: z.string().min(1, "Clinical indication is required"),
  urgency: z.enum(["routine", "urgent", "stat", "emergency"]),
  contrast: z.object({
    required: z.boolean(),
    type: z.enum(["oral", "iv", "both"]).optional(),
    agent: z.string().optional(),
    allergies: z.array(z.string()).optional(),
  }),
  specialInstructions: z.string().optional(),
  preparationInstructions: z.array(z.string()).min(0),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
});

export const imagingScheduleSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  equipmentId: z.string().min(1, "Equipment selection is required"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  scheduledTime: z.string().min(1, "Scheduled time is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  technologistId: z.string().min(1, "Technologist assignment is required"),
  specialNotes: z.string().optional(),
});

export const radiologyReportSchema = z.object({
  studyId: z.string().min(1, "Study ID is required"),
  reportType: z.enum(["preliminary", "final", "addendum", "corrected"]),
  clinicalHistory: z.string().min(1, "Clinical history is required"),
  technique: z.string().min(1, "Technique is required"),
  findings: z.string().min(1, "Findings are required"),
  impression: z.string().min(1, "Impression is required"),
  recommendations: z.string().optional(),
  criticalFindings: z.object({
    present: z.boolean(),
    description: z.string().optional(),
  }).optional(),
  comparison: z.object({
    priorStudyDate: z.string().optional(),
    priorStudyDescription: z.string().optional(),
    comparison: z.string().optional(),
  }).optional(),
});

export const equipmentMaintenanceSchema = z.object({
  equipmentId: z.string().min(1, "Equipment ID is required"),
  maintenanceType: z.enum(["routine", "repair", "calibration", "upgrade"]),
  description: z.string().min(1, "Description is required"),
  technician: z.string().min(1, "Technician name is required"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  estimatedDuration: z.number().min(1, "Duration must be at least 1 hour"),
  cost: z.number().min(0).optional(),
  parts: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const pacsConfigSchema = z.object({
  name: z.string().min(1, "PACS name is required"),
  host: z.string().min(1, "Host address is required"),
  port: z.number().min(1).max(65535, "Port must be between 1 and 65535"),
  aeTitle: z.string().min(1, "AE Title is required"),
  protocol: z.enum(["DICOM", "HL7", "REST"]),
  authentication: z.object({
    required: z.boolean(),
    username: z.string().optional(),
    password: z.string().optional(),
    certificate: z.string().optional(),
  }),
  storageLocation: z.string().min(1, "Storage location is required"),
  maxConnections: z.number().min(1).max(100, "Max connections must be between 1 and 100"),
  timeout: z.number().min(1000, "Timeout must be at least 1000ms"),
  retryAttempts: z.number().min(0).max(10, "Retry attempts must be between 0 and 10"),
  backupEnabled: z.boolean(),
  backupLocation: z.string().optional(),
  archivePolicy: z.object({
    enabled: z.boolean(),
    archiveAfterDays: z.number().min(1).optional(),
    archiveLocation: z.string().optional(),
  }),
});

export const studyQualityControlSchema = z.object({
  studyId: z.string().min(1, "Study ID is required"),
  status: z.enum(["passed", "failed", "needs_repeat"]),
  reviewer: z.string().min(1, "Reviewer name is required"),
  comments: z.string().optional(),
  technicalIssues: z.array(z.string()).optional(),
  imageQualityScore: z.number().min(1).max(5, "Quality score must be between 1 and 5"),
  recommendations: z.string().optional(),
});

export const criticalFindingSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
  finding: z.string().min(1, "Critical finding description is required"),
  severity: z.enum(["high", "medium", "low"]),
  notificationMethod: z.enum(["phone", "email", "page", "in_person"]),
  notifiedPersonnel: z.array(z.string()).min(1, "At least one person must be notified"),
  notificationTime: z.string().min(1, "Notification time is required"),
  acknowledgment: z.object({
    acknowledged: z.boolean(),
    acknowledgedBy: z.string().optional(),
    acknowledgedAt: z.string().optional(),
  }).optional(),
});

export type ImagingOrderFormData = z.infer<typeof imagingOrderSchema>;
export type ImagingScheduleFormData = z.infer<typeof imagingScheduleSchema>;
export type RadiologyReportFormData = z.infer<typeof radiologyReportSchema>;
export type EquipmentMaintenanceFormData = z.infer<typeof equipmentMaintenanceSchema>;
export type PACSConfigFormData = z.infer<typeof pacsConfigSchema>;
export type StudyQualityControlFormData = z.infer<typeof studyQualityControlSchema>;
export type CriticalFindingFormData = z.infer<typeof criticalFindingSchema>;