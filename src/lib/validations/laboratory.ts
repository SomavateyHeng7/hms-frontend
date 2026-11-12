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

export const criticalValueSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  testName: z.string().min(1, "Test name is required"),
  componentName: z.string().min(1, "Component name is required"),
  value: z.union([z.string(), z.number()]),
  unit: z.string().min(1, "Unit is required"),
  criticalRange: z.string().min(1, "Critical range is required"),
  notificationRecipients: z.string().min(1, "Recipients are required"),
  urgency: z.enum(["immediate", "within_1_hour", "within_4_hours"]),
  additionalNotes: z.string().optional(),
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
export type BatchTestFormData = z.infer<typeof batchTestSchema>;