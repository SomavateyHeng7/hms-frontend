export type DietType = 'regular' | 'vegetarian' | 'vegan' | 'soft' | 'liquid' | 'diabetic' | 'renal' | 'cardiac' | 'low-sodium' | 'high-protein' | 'low-fat' | 'gluten-free' | 'npil' | 'tube-feeding';
export type MealType = 'breakfast' | 'mid-morning' | 'lunch' | 'evening' | 'dinner' | 'night';
export type ConsistencyType = 'regular' | 'soft' | 'pureed' | 'liquid' | 'semi-solid';
export type OrderStatus = 'pending' | 'approved' | 'prepared' | 'served' | 'cancelled';

export interface DietPlan {
  id: string;
  planName: string;
  dietType: DietType;
  description: string;
  
  indications: string[];
  contraindications: string[];
  
  nutritionalGuidelines: {
    calories: { min: number; max: number };
    protein: { min: number; max: number }; // grams
    carbohydrates: { min: number; max: number }; // grams
    fat: { min: number; max: number }; // grams
    fiber?: { min: number; max: number }; // grams
    sodium?: { max: number }; // mg
  };
  
  allowedFoods: string[];
  restrictedFoods: string[];
  
  mealFrequency: number;
  fluidRestriction?: number; // ml per day
  
  specialInstructions?: string;
  
  isActive: boolean;
  createdBy: string;
  createdDate: Date;
}

export interface MenuItem {
  id: string;
  itemName: string;
  category: 'main-course' | 'side-dish' | 'soup' | 'salad' | 'dessert' | 'beverage' | 'snack';
  
  dietTypes: DietType[];
  consistency: ConsistencyType;
  
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  
  allergens: string[];
  
  nutritionalInfo: {
    calories: number;
    protein: number; // grams
    carbohydrates: number; // grams
    fat: number; // grams
    fiber: number; // grams
    sodium: number; // mg
    sugar?: number; // grams
  };
  
  portionSize: number;
  portionUnit: string;
  
  preparationTime: number; // minutes
  servingInstructions?: string;
  
  cost: number;
  
  availableMeals: MealType[];
  
  image?: string;
  isActive: boolean;
  notes?: string;
}

export interface PatientDietOrder {
  id: string;
  orderNumber: string;
  
  patientId: string;
  patientName: string;
  admissionId?: string;
  
  ward: string;
  bedNumber: string;
  
  dietType: DietType;
  consistency: ConsistencyType;
  
  dietPlanId?: string;
  
  startDate: Date;
  endDate?: Date;
  
  mealSchedule: Array<{
    mealType: MealType;
    time: string; // HH:mm format
    menuItems: Array<{
      itemId: string;
      itemName: string;
      quantity: number;
      specialInstructions?: string;
    }>;
  }>;
  
  restrictions: {
    allergies: string[];
    intolerances: string[];
    culturalRestrictions: string[];
    religiousRestrictions: string[];
  };
  
  specialRequirements?: string;
  fluidRestriction?: number; // ml per day
  feedingRoute: 'oral' | 'ngt' | 'peg' | 'parenteral';
  
  orderedBy: string;
  orderDate: Date;
  
  approvedBy?: string;
  approvedDate?: Date;
  
  status: 'active' | 'discontinued' | 'on-hold' | 'completed';
  
  nutritionistReview?: {
    reviewedBy: string;
    reviewDate: Date;
    recommendations: string;
    modifications: string[];
  };
  
  notes?: string;
}

export interface MealService {
  id: string;
  serviceNumber: string;
  
  date: Date;
  mealType: MealType;
  serviceTime: Date;
  
  ward: string;
  
  orders: Array<{
    orderId: string;
    patientId: string;
    patientName: string;
    bedNumber: string;
    dietType: DietType;
    items: Array<{
      itemId: string;
      itemName: string;
      quantity: number;
    }>;
    served: boolean;
    servedTime?: Date;
    servedBy?: string;
    notServedReason?: string;
    patientFeedback?: string;
    consumptionPercentage?: number;
  }>;
  
  preparedBy: string;
  preparedTime?: Date;
  
  status: 'scheduled' | 'preparing' | 'ready' | 'serving' | 'completed';
  
  totalMeals: number;
  servedMeals: number;
  
  notes?: string;
}

export interface DietKitchen {
  id: string;
  kitchenName: string;
  location: string;
  
  capacity: number; // meals per service
  
  equipmentList: Array<{
    name: string;
    quantity: number;
    status: 'functional' | 'maintenance' | 'out-of-order';
    lastMaintenance?: Date;
  }>;
  
  staff: Array<{
    staffId: string;
    name: string;
    role: 'chef' | 'cook' | 'helper' | 'dietitian' | 'supervisor';
    shift: string;
  }>;
  
  operatingHours: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
  
  wardsServed: string[];
  
  isActive: boolean;
}

export interface NutritionalAssessment {
  id: string;
  assessmentNumber: string;
  
  patientId: string;
  patientName: string;
  
  assessmentDate: Date;
  assessedBy: string;
  
  anthropometricData: {
    height: number; // cm
    weight: number; // kg
    bmi: number;
    idealBodyWeight: number; // kg
    waistCircumference?: number; // cm
  };
  
  dietaryHistory: {
    usualDiet: string;
    appetite: 'good' | 'fair' | 'poor';
    recentWeightChange: {
      amount: number; // kg
      duration: string;
      type: 'loss' | 'gain' | 'stable';
    };
    foodPreferences: string[];
    foodAversions: string[];
    allergies: string[];
    supplements: string[];
  };
  
  clinicalData: {
    diagnosis: string;
    comorbidities: string[];
    medications: string[];
    laboratoryValues?: {
      hemoglobin?: number;
      albumin?: number;
      totalProtein?: number;
      glucose?: number;
      creatinine?: number;
      sodium?: number;
      potassium?: number;
    };
  };
  
  functionalStatus: {
    abilityToFeed: 'independent' | 'assisted' | 'dependent';
    chewingDifficulty: boolean;
    swallowingDifficulty: boolean;
    nausea: boolean;
    vomiting: boolean;
    diarrhea: boolean;
    constipation: boolean;
  };
  
  nutritionalDiagnosis: string;
  
  recommendations: {
    dietType: DietType;
    consistency: ConsistencyType;
    energyRequirement: number; // kcal/day
    proteinRequirement: number; // g/day
    fluidRequirement: number; // ml/day
    specialConsiderations: string[];
    supplementsRecommended: string[];
  };
  
  followUpDate?: Date;
  
  notes?: string;
}

export interface DietStats {
  totalActiveOrders: number;
  todayMealsScheduled: number;
  mealsServedToday: number;
  pendingOrders: number;
  
  byDietType: {
    [key in DietType]?: number;
  };
  
  kitchenCapacity: {
    total: number;
    utilized: number;
    available: number;
  };
  
  patientSatisfaction: {
    averageRating: number;
    totalResponses: number;
  };
}

export interface MenuPlanning {
  id: string;
  weekNumber: number;
  year: number;
  startDate: Date;
  endDate: Date;
  
  menus: Array<{
    day: string;
    date: Date;
    meals: {
      [key in MealType]?: Array<{
        dietType: DietType;
        items: Array<{
          itemId: string;
          itemName: string;
          category: string;
        }>;
      }>;
    };
  }>;
  
  createdBy: string;
  approvedBy?: string;
  approvedDate?: Date;
  
  status: 'draft' | 'approved' | 'active' | 'completed';
  notes?: string;
}
