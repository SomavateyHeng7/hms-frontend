import { z } from "zod";

export const instrumentSchema = z.object({
  instrumentCode: z.string().min(1, "Instrument code is required"),
  instrumentName: z.string().min(2, "Instrument name is required"),
  category: z.enum(["surgical", "dental", "gynecological", "orthopedic", "cardiovascular", "ophthalmic", "ent", "general"]),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  material: z.enum(["stainless-steel", "titanium", "plastic", "rubber", "glass", "other"]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitCost: z.number().min(0, "Unit cost is required"),
  reusable: z.boolean(),
  expectedLifespan: z.number().min(1),
  storageLocation: z.string().min(1, "Storage location is required"),
});

export const instrumentSetSchema = z.object({
  setCode: z.string().min(1, "Set code is required"),
  setName: z.string().min(2, "Set name is required"),
  category: z.enum(["surgical", "dental", "gynecological", "orthopedic", "cardiovascular", "ophthalmic", "ent", "general"]),
  description: z.string().min(10, "Description is required"),
  department: z.string().min(1, "Department is required"),
  sterilizationMethod: z.enum(["steam-autoclave", "ethylene-oxide", "hydrogen-peroxide", "dry-heat", "radiation", "chemical"]),
  sterilizationDuration: z.number().min(1, "Sterilization duration is required"),
  totalSets: z.number().min(1, "Total sets must be at least 1"),
});

export const sterilizationCycleSchema = z.object({
  cycleNumber: z.string().min(1, "Cycle number is required"),
  sterilizerId: z.string().min(1, "Sterilizer selection is required"),
  sterilizationMethod: z.enum(["steam-autoclave", "ethylene-oxide", "hydrogen-peroxide", "dry-heat", "radiation", "chemical"]),
  temperature: z.number().optional(),
  pressure: z.number().optional(),
  duration: z.number().min(1, "Duration is required"),
  operatedBy: z.string().min(1, "Operator is required"),
});

export const sterilizationPackSchema = z.object({
  packNumber: z.string().min(1, "Pack number is required"),
  itemType: z.enum(["instrument", "instrument-set", "linen", "dressing", "other"]),
  itemName: z.string().min(2, "Item name is required"),
  department: z.string().min(1, "Department is required"),
  packagingMaterial: z.enum(["paper", "plastic-pouch", "wrap", "container"]),
  sterilizationMethod: z.enum(["steam-autoclave", "ethylene-oxide", "hydrogen-peroxide", "dry-heat", "radiation", "chemical"]),
  expiryDate: z.date(),
});

export const sterilizationEquipmentSchema = z.object({
  equipmentCode: z.string().min(1, "Equipment code is required"),
  equipmentName: z.string().min(2, "Equipment name is required"),
  type: z.enum(["steam-autoclave", "ethylene-oxide", "hydrogen-peroxide", "dry-heat", "radiation", "chemical"]),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  model: z.string().min(1, "Model is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  capacity: z.number().min(1, "Capacity is required"),
  installationDate: z.date(),
  currentLocation: z.string().min(1, "Location is required"),
});

export const departmentRequestSchema = z.object({
  requestNumber: z.string().min(1, "Request number is required"),
  department: z.string().min(1, "Department is required"),
  requestedBy: z.string().min(1, "Requester name is required"),
  requiredDate: z.date(),
  urgency: z.enum(["routine", "urgent", "emergency"]),
});

export const washingCycleSchema = z.object({
  cycleNumber: z.string().min(1, "Cycle number is required"),
  washerId: z.string().min(1, "Washer selection is required"),
  temperature: z.number().min(30).max(100, "Temperature should be between 30-100°C"),
  duration: z.number().min(1, "Duration is required"),
  detergent: z.string().min(1, "Detergent is required"),
  cycleType: z.enum(["regular", "intensive", "delicate"]),
  operatedBy: z.string().min(1, "Operator is required"),
});
