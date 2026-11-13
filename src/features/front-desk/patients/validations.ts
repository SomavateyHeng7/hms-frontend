import { z } from "zod";
import { isCambodianPhone } from "@/lib/cambodia/phone";

const KHMER_SCRIPT = /[\u1780-\u17FF]/;
const LATIN_NAME = /^[A-Za-z][A-Za-z\s'.-]*$/;

// Khmer names are required except for foreign patients (registered with a passport); see superRefine.
const khmerName = (label: string) =>
  z.string().trim().refine((v) => v === "" || KHMER_SCRIPT.test(v), `${label} must be written in Khmer script`);
const latinName = (label: string) =>
  z.string().trim().min(1, `${label} is required`).regex(LATIN_NAME, `${label} must use Latin letters only`);

/**
 * Patient registration (Cambodian identity, roadmap F6). Flat so it maps 1:1 to form fields;
 * `toPatientFields()` in patient-utils.ts turns it into the stored Patient shape.
 */
export const patientRegistrationSchema = z
  .object({
    khmerFamilyName: khmerName("Khmer family name"),
    khmerGivenName: khmerName("Khmer given name"),
    latinFamilyName: latinName("Latin family name"),
    latinGivenName: latinName("Latin given name"),
    // A string with a refine (not z.enum): an unpicked value must not stop the cross-field
    // rules below from running, or the form would reveal its errors in two rounds.
    sex: z.string().refine((v) => v === "male" || v === "female", "Sex is required"),

    birthDateKnown: z.boolean(),
    dateOfBirth: z.string().optional(),
    estimatedAge: z.number().optional(),

    identityType: z.enum(["national_id", "passport", "none"]),
    identityNumber: z.string().trim().optional(),
    nationality: z.string().trim().optional(),

    phone: z.string().trim().refine(isCambodianPhone, "Enter a Cambodian phone number, e.g. 012 345 678"),

    provinceId: z.string().min(1, "Province is required"),
    districtId: z.string().min(1, "District / Khan is required"),
    communeId: z.string().min(1, "Commune / Sangkat is required"),
    village: z.string().trim().optional(),
    houseStreet: z.string().trim().optional(),

    coverageScheme: z.enum(["none", "nssf", "hef", "private"]),
    coverageMemberId: z.string().trim().optional(),
    insurer: z.string().trim().optional(),
    policyNumber: z.string().trim().optional(),

    emergencyName: z.string().trim().optional(),
    emergencyRelationship: z.string().trim().optional(),
    emergencyPhone: z.string().trim().optional(),

    bloodType: z.string().optional(),
    allergies: z.string().trim().optional(),
    medicalHistory: z.string().trim().optional(),
    currentMedications: z.string().trim().optional(),
  })
  .superRefine((d, ctx) => {
    const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });

    if (d.identityType !== "passport") {
      if (!d.khmerFamilyName) issue("khmerFamilyName", "Khmer family name is required");
      if (!d.khmerGivenName) issue("khmerGivenName", "Khmer given name is required");
    }

    if (d.birthDateKnown) {
      if (!d.dateOfBirth) issue("dateOfBirth", "Date of birth is required");
      else if (new Date(d.dateOfBirth) > new Date()) issue("dateOfBirth", "Date of birth cannot be in the future");
    } else if (d.estimatedAge === undefined || Number.isNaN(d.estimatedAge) || d.estimatedAge < 0 || d.estimatedAge > 120) {
      issue("estimatedAge", "Enter an estimated age between 0 and 120");
    }

    if (d.identityType === "national_id" && !/^\d{8,12}$/.test(d.identityNumber ?? "")) {
      issue("identityNumber", "National ID number must be 8 to 12 digits");
    }
    if (d.identityType === "passport") {
      if (!/^[A-Za-z0-9]{6,12}$/.test(d.identityNumber ?? "")) issue("identityNumber", "Passport number must be 6 to 12 letters or digits");
      if (!d.nationality) issue("nationality", "Nationality is required for a passport");
    }

    if (d.coverageScheme === "nssf" && !d.coverageMemberId) issue("coverageMemberId", "NSSF member number is required");
    if (d.coverageScheme === "hef" && !d.coverageMemberId) issue("coverageMemberId", "Equity card number is required");
    if (d.coverageScheme === "private") {
      if (!d.insurer) issue("insurer", "Insurer is required");
      if (!d.policyNumber) issue("policyNumber", "Policy number is required");
    }

    if (d.emergencyName && !d.emergencyPhone) issue("emergencyPhone", "Phone is required for the emergency contact");
    if (d.emergencyPhone && !isCambodianPhone(d.emergencyPhone)) issue("emergencyPhone", "Enter a Cambodian phone number");
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