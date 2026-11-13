import { z } from "zod";

export const labOrderSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  tests: z.array(z.string()).min(1, "At least one test is required"),
  priority: z.enum(["routine", "urgent", "stat", "asap"]),
  clinicalIndication: z.string().min(1, "Clinical indication is required"),
  notes: z.string().optional(),
  fastingRequired: z.boolean(),
});

export const sampleCollectionSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  sampleType: z.enum(["blood", "serum", "plasma", "urine", "stool", "csf", "tissue", "swab", "sputum", "saliva"]),
  volume: z.number().min(0.1, "Volume must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  collectionDate: z.string().min(1, "Collection date is required"),
  collectedBy: z.string().min(1, "Collector is required"),
  notes: z.string().optional(),
});

export const testResultSchema = z.object({
  sampleId: z.string().min(1, "Sample ID is required"),
  testId: z.string().min(1, "Test ID is required"),
  results: z.array(z.object({
    componentId: z.string().min(1, "Component ID is required"),
    value: z.union([z.string(), z.number()]).refine(val => val !== "" && val !== null, "Value is required"),
    notes: z.string().optional(),
  })).min(1, "At least one result is required"),
  enteredBy: z.string().min(1, "Entered by is required"),
  status: z.enum(["preliminary", "final"]),
});

export const labReportSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  interpretation: z.string().optional(),
  recommendations: z.array(z.string()).optional(),
  deliveryMethod: z.enum(["digital", "print", "both"]),
});

export const qualityControlSchema = z.object({
  equipmentId: z.string().min(1, "Equipment is required"),
  testCode: z.string().min(1, "Test code is required"),
  level: z.enum(["low", "normal", "high"]),
  expectedValue: z.number().min(0, "Expected value must be positive"),
  actualValue: z.number().min(0, "Actual value must be positive"),
  unit: z.string().min(1, "Unit is required"),
  performedBy: z.string().min(1, "Performed by is required"),
  notes: z.string().optional(),
});

export const equipmentMaintenanceSchema = z.object({
  equipmentId: z.string().min(1, "Equipment is required"),
  type: z.enum(["maintenance", "calibration", "repair"]),
  description: z.string().min(1, "Description is required"),
  performedBy: z.string().min(1, "Performed by is required"),
  date: z.string().min(1, "Date is required"),
  nextDueDate: z.string().optional(),
  cost: z.number().min(0, "Cost must be positive").optional(),
  vendor: z.string().optional(),
  notes: z.string().optional(),
});

export const labResultEntrySchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  testCode: z.string().min(1, "Test code is required"),
  value: z.number({ message: "Result value is required" }),
  unit: z.string().min(1, "Unit is required"),
  normalRange: z.string().optional(),
  status: z.enum(["pending", "preliminary", "final"]),
  flag: z.enum(["normal", "high", "low", "critical_high", "critical_low", "abnormal"]),
  method: z.string().optional(),
  enteredBy: z.string().min(1, "Entered by is required"),
  notes: z.string().optional(),
  isCritical: z.boolean(),
});

/** Records that a clinician was told about a critical result: who, how and when. */
export const criticalValueSchema = z.object({
  resultId: z.string().min(1, "Result is required"),
  notificationMethod: z.enum(["phone", "sms", "email", "in_person"]),
  urgency: z.enum(["immediate", "urgent", "routine"]),
  notifiedPerson: z.string().min(2, "Name of the person notified is required"),
  notificationNotes: z.string().optional(),
});

export const batchTestSchema = z.object({
  sampleIds: z.array(z.string()).min(1, "At least one sample is required"),
  testId: z.string().min(1, "Test ID is required"),
  equipmentId: z.string().min(1, "Equipment is required"),
  runDate: z.string().min(1, "Run date is required"),
  operator: z.string().min(1, "Operator is required"),
  notes: z.string().optional(),
});

export type LabOrderFormData = z.infer<typeof labOrderSchema>;
export type SampleCollectionFormData = z.infer<typeof sampleCollectionSchema>;
export type TestResultFormData = z.infer<typeof testResultSchema>;
export type LabReportFormData = z.infer<typeof labReportSchema>;
export type QualityControlFormData = z.infer<typeof qualityControlSchema>;
export type EquipmentMaintenanceFormData = z.infer<typeof equipmentMaintenanceSchema>;
export type CriticalValueFormData = z.infer<typeof criticalValueSchema>;
export type LabResultEntryFormData = z.infer<typeof labResultEntrySchema>;
export type BatchTestFormData = z.infer<typeof batchTestSchema>;