import { z } from "zod";

export const doctorScheduleSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required"),
  department: z.string().min(1, "Department is required"),
  schedule: z.object({
    monday: z.array(z.object({
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      slotDuration: z.number().min(5, "Minimum 5 minutes").max(480, "Maximum 8 hours"),
      maxAppointments: z.number().min(1, "At least 1 appointment per slot"),
      appointmentType: z.enum(["consultation", "surgery", "emergency", "telemedicine"]).optional(),
    })),
    tuesday: z.array(z.object({
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      slotDuration: z.number().min(5).max(480),
      maxAppointments: z.number().min(1),
      appointmentType: z.enum(["consultation", "surgery", "emergency", "telemedicine"]).optional(),
    })),
    wednesday: z.array(z.object({
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      slotDuration: z.number().min(5).max(480),
      maxAppointments: z.number().min(1),
      appointmentType: z.enum(["consultation", "surgery", "emergency", "telemedicine"]).optional(),
    })),
    thursday: z.array(z.object({
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      slotDuration: z.number().min(5).max(480),
      maxAppointments: z.number().min(1),
      appointmentType: z.enum(["consultation", "surgery", "emergency", "telemedicine"]).optional(),
    })),
    friday: z.array(z.object({
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      slotDuration: z.number().min(5).max(480),
      maxAppointments: z.number().min(1),
      appointmentType: z.enum(["consultation", "surgery", "emergency", "telemedicine"]).optional(),
    })),
    saturday: z.array(z.object({
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      slotDuration: z.number().min(5).max(480),
      maxAppointments: z.number().min(1),
      appointmentType: z.enum(["consultation", "surgery", "emergency", "telemedicine"]).optional(),
    })),
    sunday: z.array(z.object({
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      slotDuration: z.number().min(5).max(480),
      maxAppointments: z.number().min(1),
      appointmentType: z.enum(["consultation", "surgery", "emergency", "telemedicine"]).optional(),
    })),
  }),
  consultationFee: z.number().min(0, "Fee cannot be negative"),
  telemedicineEnabled: z.boolean(),
});

export const appointmentBookingSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  departmentId: z.string().min(1, "Department is required"),
  slotId: z.string().min(1, "Time slot is required"),
  appointmentDate: z.date({
    message: "Appointment date is required",
  }),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  duration: z.number().min(15, "Minimum 15 minutes").max(480, "Maximum 8 hours"),
  type: z.enum(["consultation", "follow-up", "surgery", "test", "emergency", "telemedicine"], {
    message: "Appointment type is required",
  }),
  isTelemedicine: z.boolean(),
  reason: z.string().min(1, "Reason is required").max(500, "Reason too long"),
  notes: z.string().max(1000, "Notes too long").optional(),
  reminderPreferences: z.object({
    sms: z.boolean(),
    email: z.boolean(),
    push: z.boolean(),
    reminderTimes: z.array(z.number()), // minutes before appointment
  }),
  emergencyContact: z.object({
    name: z.string().min(1, "Emergency contact name required"),
    phone: z.string().min(10, "Valid phone number required"),
  }).optional(),
});

export const emergencyTriageSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  patientName: z.string().min(1, "Patient name is required"),
  chiefComplaint: z.string().min(1, "Chief complaint is required"),
  vitalSigns: z.object({
    temperature: z.number().optional(),
    bloodPressure: z.string().optional(),
    heartRate: z.number().optional(),
    respiratoryRate: z.number().optional(),
    oxygenSaturation: z.number().min(0).max(100).optional(),
    painLevel: z.number().min(0).max(10).optional(),
  }),
  priority: z.enum(["critical", "high", "medium", "low"], {
    message: "Priority level is required",
  }),
  triageNotes: z.string().min(1, "Triage notes are required"),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  arrivalMode: z.enum(["walk-in", "ambulance", "transfer"], {
    message: "Arrival mode is required",
  }),
  consciousness: z.enum(["alert", "drowsy", "unconscious"], {
    message: "Consciousness level is required",
  }),
});

export const telemedicineSessionSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  doctorId: z.string().min(1, "Doctor ID is required"),
  scheduledStart: z.date({
    message: "Scheduled start time is required",
  }),
  estimatedDuration: z.number().min(15, "Minimum 15 minutes").max(120, "Maximum 2 hours"),
  sessionType: z.enum(["video", "audio", "chat"], {
    message: "Session type is required",
  }),
  recordingEnabled: z.boolean(),
  chatEnabled: z.boolean(),
  screenSharingEnabled: z.boolean(),
  requiresSpecialEquipment: z.boolean(),
  equipmentNotes: z.string().optional(),
  patientInstructions: z.string().optional(),
});

export const reminderConfigSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  reminderTypes: z.array(z.enum(["sms", "email", "push"])),
  scheduleTimes: z.array(z.number().min(1).max(10080)), // 1 minute to 1 week in minutes
  customMessage: z.string().max(500).optional(),
  language: z.enum(["en", "es", "fr", "de"]).default("en"),
  timezone: z.string().default("UTC"),
});

export const departmentScheduleSchema = z.object({
  departmentId: z.string().min(1, "Department ID is required"),
  name: z.string().min(1, "Department name is required"),
  operatingHours: z.object({
    weekdays: z.object({
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      slotDuration: z.number().min(5).max(480),
      maxAppointments: z.number().min(1),
    }),
    weekends: z.object({
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      slotDuration: z.number().min(5).max(480),
      maxAppointments: z.number().min(1),
    }),
  }),
  emergencyAvailable: z.boolean(),
  telemedicineAvailable: z.boolean(),
  location: z.string().min(1, "Location is required"),
  contactNumber: z.string().min(10, "Valid contact number required"),
  email: z.string().email("Valid email required"),
  services: z.array(z.string()),
  headOfDepartment: z.string().min(1, "Head of department is required"),
});

export type DoctorScheduleFormData = z.infer<typeof doctorScheduleSchema>;
export type AppointmentBookingFormData = z.infer<typeof appointmentBookingSchema>;
export type EmergencyTriageFormData = z.infer<typeof emergencyTriageSchema>;
export type TelemedicineSessionFormData = z.infer<typeof telemedicineSessionSchema>;
export type ReminderConfigFormData = z.infer<typeof reminderConfigSchema>;
export type DepartmentScheduleFormData = z.infer<typeof departmentScheduleSchema>;