import { z } from "zod";

export const dietPlanSchema = z.object({
  planName: z.string().min(2, "Plan name is required"),
  dietType: z.enum(["regular", "vegetarian", "vegan", "soft", "liquid", "diabetic", "renal", "cardiac", "low-sodium", "high-protein", "low-fat", "gluten-free", "npil", "tube-feeding"]),
  description: z.string().min(10, "Description is required"),
  minCalories: z.number().min(500),
  maxCalories: z.number().max(5000),
  minProtein: z.number().min(0),
  maxProtein: z.number().max(500),
});

export const menuItemSchema = z.object({
  itemName: z.string().min(2, "Item name is required"),
  category: z.enum(["main-course", "side-dish", "soup", "salad", "dessert", "beverage", "snack"]),
  consistency: z.enum(["regular", "soft", "pureed", "liquid", "semi-solid"]),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbohydrates: z.number().min(0),
  fat: z.number().min(0),
  portionSize: z.number().min(0),
  portionUnit: z.string().min(1, "Portion unit is required"),
  preparationTime: z.number().min(0),
  cost: z.number().min(0),
});

export const patientDietOrderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  patientId: z.string().min(1, "Patient selection is required"),
  ward: z.string().min(1, "Ward is required"),
  bedNumber: z.string().min(1, "Bed number is required"),
  dietType: z.enum(["regular", "vegetarian", "vegan", "soft", "liquid", "diabetic", "renal", "cardiac", "low-sodium", "high-protein", "low-fat", "gluten-free", "npil", "tube-feeding"]),
  consistency: z.enum(["regular", "soft", "pureed", "liquid", "semi-solid"]),
  feedingRoute: z.enum(["oral", "ngt", "peg", "parenteral"]),
  startDate: z.date(),
});

export const nutritionalAssessmentSchema = z.object({
  assessmentNumber: z.string().min(1, "Assessment number is required"),
  patientId: z.string().min(1, "Patient selection is required"),
  height: z.number().min(50).max(250, "Valid height required"),
  weight: z.number().min(10).max(300, "Valid weight required"),
  appetite: z.enum(["good", "fair", "poor"]),
  diagnosis: z.string().min(3, "Clinical diagnosis is required"),
  nutritionalDiagnosis: z.string().min(3, "Nutritional diagnosis is required"),
  dietType: z.enum(["regular", "vegetarian", "vegan", "soft", "liquid", "diabetic", "renal", "cardiac", "low-sodium", "high-protein", "low-fat", "gluten-free", "npil", "tube-feeding"]),
  energyRequirement: z.number().min(500).max(5000),
  proteinRequirement: z.number().min(10).max(500),
  fluidRequirement: z.number().min(500).max(10000),
});

export const mealServiceSchema = z.object({
  serviceNumber: z.string().min(1, "Service number is required"),
  date: z.date(),
  mealType: z.enum(["breakfast", "mid-morning", "lunch", "evening", "dinner", "night"]),
  ward: z.string().min(1, "Ward is required"),
});
