import { z } from "zod";

export const ambulanceVehicleSchema = z.object({
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  type: z.enum(["basic", "advanced", "air-ambulance", "neonatal", "bariatric", "mobile-icu"]),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  model: z.string().min(1, "Model is required"),
  yearOfManufacture: z.number().min(2000).max(new Date().getFullYear()),
  capacity: z.number().min(1).max(20),
  stretcherCapacity: z.number().min(1).max(10),
  baseStation: z.string().min(1, "Base station is required"),
});

export const ambulanceTripSchema = z.object({
  tripNumber: z.string().min(1, "Trip number is required"),
  ambulanceId: z.string().min(1, "Ambulance selection is required"),
  priority: z.enum(["emergency", "urgent", "routine", "transfer"]),
  requestSource: z.enum(["emergency-call", "hospital", "clinic", "police", "public"]),
  chiefComplaint: z.string().min(3, "Chief complaint is required"),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  pickupContactNumber: z.string().min(10, "Pickup contact number is required"),
  destinationFacility: z.string().min(1, "Destination facility is required"),
  destinationAddress: z.string().min(5, "Destination address is required"),
  estimatedDistance: z.number().min(0).optional(),
});

export const ambulanceRequestSchema = z.object({
  requestNumber: z.string().min(1, "Request number is required"),
  priority: z.enum(["emergency", "urgent", "routine", "transfer"]),
  requestSource: z.enum(["emergency-call", "hospital", "clinic", "police", "public"]),
  callerName: z.string().min(2, "Caller name is required"),
  callerContactNumber: z.string().min(10, "Valid contact number required"),
  patientChiefComplaint: z.string().min(3, "Chief complaint is required"),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  destinationAddress: z.string().min(5, "Destination address is required"),
});

export const crewMemberSchema = z.object({
  staffId: z.string().min(1, "Staff selection is required"),
  role: z.enum(["driver", "paramedic", "emt", "nurse", "doctor"]),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.date().optional(),
  contactNumber: z.string().min(10, "Valid contact number required"),
  emergencyContact: z.string().min(10, "Emergency contact required"),
});
