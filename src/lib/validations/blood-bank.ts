import { z } from "zod";

export const donorSchema = z.object({
  donorNumber: z.string().min(1, "Donor number is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  dateOfBirth: z.date(),
  gender: z.enum(["male", "female", "other"]),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  contactNumber: z.string().min(10, "Valid contact number required"),
  email: z.string().email().optional(),
  address: z.string().min(5, "Address is required"),
  donorType: z.enum(["voluntary", "replacement", "autologous"]),
  weight: z.number().min(45, "Minimum weight should be 45kg"),
  height: z.number().min(100, "Valid height required"),
});

export const donationSchema = z.object({
  donationNumber: z.string().min(1, "Donation number is required"),
  donorId: z.string().min(1, "Donor selection is required"),
  donationType: z.enum(["voluntary", "replacement", "autologous"]),
  donationCenter: z.string().min(1, "Donation center is required"),
  hemoglobin: z.number().min(12.5, "Hemoglobin should be at least 12.5 g/dL"),
  bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, "Invalid blood pressure format"),
  pulse: z.number().min(50).max(100, "Pulse should be between 50-100"),
  temperature: z.number().min(36).max(37.5, "Temperature should be normal"),
  bagNumber: z.string().min(1, "Bag number is required"),
  volumeCollected: z.number().min(350).max(500, "Volume should be between 350-500ml"),
});

export const bloodRequestSchema = z.object({
  requisitionNumber: z.string().min(1, "Requisition number is required"),
  patientId: z.string().min(1, "Patient selection is required"),
  patientBloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  department: z.string().min(1, "Department is required"),
  clinicalDiagnosis: z.string().min(3, "Clinical diagnosis is required"),
  indication: z.string().min(3, "Indication for transfusion is required"),
  priority: z.enum(["routine", "urgent", "emergency"]),
  requiredBy: z.date(),
});

export const bloodUnitSchema = z.object({
  unitNumber: z.string().min(1, "Unit number is required"),
  bagNumber: z.string().min(1, "Bag number is required"),
  component: z.enum(["whole-blood", "packed-rbc", "platelet", "plasma", "cryoprecipitate"]),
  volume: z.number().min(50, "Valid volume required"),
  collectionDate: z.date(),
  expiryDate: z.date(),
  storageLocation: z.string().min(1, "Storage location is required"),
  storageTemperature: z.number(),
});

export const transfusionRecordSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  unitNumber: z.string().min(1, "Unit number is required"),
  component: z.enum(["whole-blood", "packed-rbc", "platelet", "plasma", "cryoprecipitate"]),
  startTime: z.date(),
  bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, "Invalid blood pressure format"),
  pulse: z.number().min(40).max(150),
  temperature: z.number().min(35).max(40),
});
