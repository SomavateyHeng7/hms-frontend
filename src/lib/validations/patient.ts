import { z } from "zod";

export const patientRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  middleName: z.string().max(50, "Middle name must be less than 50 characters").optional(),
  dateOfBirth: z.date({
    message: "Date of birth is required",
  }),
  gender: z.enum(["male", "female", "other"], {
    message: "Gender is required",
  }),
  bloodType: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number must be less than 15 digits"),
  emergencyContact: z.object({
    name: z.string().min(1, "Emergency contact name is required"),
    relationship: z.string().min(1, "Relationship is required"),
    phone: z.string().min(10, "Emergency contact phone must be at least 10 digits"),
  }),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(5, "Zip code must be at least 5 digits"),
    country: z.string().min(1, "Country is required"),
  }),
  insurance: z.object({
    provider: z.string().min(1, "Insurance provider is required"),
    policyNumber: z.string().min(1, "Policy number is required"),
    groupNumber: z.string().optional(),
    membershipId: z.string().min(1, "Membership ID is required"),
  }).optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
});

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  doctorName: z.string().min(1, "Doctor name is required"),
  appointmentDate: z.date({
    message: "Appointment date is required",
  }),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  duration: z.number().min(15, "Duration must be at least 15 minutes").max(480, "Duration cannot exceed 8 hours"),
  type: z.enum(["consultation", "follow-up", "surgery", "test", "emergency"], {
    message: "Appointment type is required",
  }),
  reason: z.string().min(1, "Reason for appointment is required"),
  notes: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  roomNumber: z.string().optional(),
});

export const visitSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  appointmentId: z.string().optional(),
  visitDate: z.date({
    message: "Visit date is required",
  }),
  visitTime: z.string().min(1, "Visit time is required"),
  type: z.enum(["routine", "emergency", "follow-up", "consultation"], {
    message: "Visit type is required",
  }),
  chiefComplaint: z.string().min(1, "Chief complaint is required"),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  prescriptions: z.string().optional(),
  vitals: z.object({
    temperature: z.number().optional(),
    bloodPressure: z.string().optional(),
    heartRate: z.number().optional(),
    respiratoryRate: z.number().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  notes: z.string().optional(),
  doctorId: z.string().min(1, "Doctor is required"),
  doctorName: z.string().min(1, "Doctor name is required"),
  department: z.string().min(1, "Department is required"),
});

export type PatientRegistrationFormData = z.infer<typeof patientRegistrationSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type VisitFormData = z.infer<typeof visitSchema>;