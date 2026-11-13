// Reporting & Analytics Types for Hospital Management System

export interface DailyCensusReport {
  reportDate: Date;
  totalPatients: number;
  inPatients: number;
  outPatients: number;
  emergencyPatients: number;
  dischargedPatients: number;
  admittedPatients: number;
  bedOccupancy: {
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    occupancyRate: number;
  };
  departmentBreakdown: Array<{
    departmentId: string;
    departmentName: string;
    patientCount: number;
    capacity: number;
    utilizationRate: number;
  }>;
  hourlyBreakdown: Array<{
    hour: number;
    admissions: number;
    discharges: number;
    emergencyArrivals: number;
  }>;
}

export interface ClinicalReport {
  id: string;
  reportType: "diagnostic" | "treatment" | "outcome" | "quality" | "safety";
  title: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics: Array<{
    name: string;
    value: number | string;
    unit?: string;
    trend?: "up" | "down" | "stable";
    benchmark?: number;
    category: "primary" | "secondary" | "tertiary";
  }>;
  departmentId?: string;
  doctorId?: string;
  summary: string;
  recommendations?: string[];
  riskFactors?: string[];
  qualityIndicators: Array<{
    indicator: string;
    score: number;
    target: number;
    status: "good" | "warning" | "critical";
  }>;
  generatedAt: Date;
  generatedBy: string;
}

export interface BillingSummary {
  reportDate: Date;
  totalRevenue: number;
  collectedAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  insurancePayments: number;
  outOfPocketPayments: number;
  refunds: number;
  adjustments: number;
  paymentMethods: Array<{
    method: "cash" | "card" | "insurance" | "bank_transfer" | "check";
    amount: number;
    percentage: number;
    transactionCount: number;
  }>;
  departmentRevenue: Array<{
    departmentId: string;
    departmentName: string;
    revenue: number;
    collections: number;
    pending: number;
    growthRate: number;
  }>;
  topServices: Array<{
    serviceCode: string;
    serviceName: string;
    revenue: number;
    quantity: number;
    averagePrice: number;
  }>;
  ageingAnalysis: Array<{
    ageGroup: "0-30" | "31-60" | "61-90" | "90+";
    amount: number;
    percentage: number;
  }>;
}

export interface InventoryReport {
  reportDate: Date;
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringItems: number;
  totalValue: number;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    itemCount: number;
    totalValue: number;
    lowStockCount: number;
    turnoverRate: number;
  }>;
  topUsedItems: Array<{
    itemId: string;
    itemName: string;
    category: string;
    quantityUsed: number;
    cost: number;
    supplier: string;
  }>;
  purchaseOrders: {
    pending: number;
    completed: number;
    totalValue: number;
    averageLeadTime: number;
  };
  wasteAnalysis: {
    expiredItems: number;
    expiredValue: number;
    damagedItems: number;
    damagedValue: number;
  };
  costAnalysis: {
    totalPurchases: number;
    averageCostPerItem: number;
    savingsFromBulkOrders: number;
  };
}

export interface ResourceUtilizationReport {
  reportDate: Date;
  rooms: Array<{
    roomId: string;
    roomNumber: string;
    type: "icu" | "surgery" | "general" | "emergency" | "consultation";
    utilizationRate: number;
    hoursUsed: number;
    hoursAvailable: number;
    revenue: number;
    maintenanceHours: number;
    cleaningTime: number;
  }>;
  equipment: Array<{
    equipmentId: string;
    equipmentName: string;
    type: string;
    utilizationRate: number;
    operationalHours: number;
    maintenanceHours: number;
    downtime: number;
    efficiency: number;
    lastMaintenance: Date;
  }>;
  staff: Array<{
    staffId: string;
    staffName: string;
    role: string;
    department: string;
    hoursWorked: number;
    overtime: number;
    efficiency: number;
    patientLoad: number;
    absenceHours: number;
  }>;
  overall: {
    roomUtilization: number;
    equipmentUtilization: number;
    staffUtilization: number;
    costPerHour: number;
    revenuePerHour: number;
    efficiency: number;
  };
}

export interface DoctorPerformanceReport {
  doctorId: string;
  doctorName: string;
  specialization: string;
  department: string;
  reportPeriod: {
    start: Date;
    end: Date;
  };
  appointmentMetrics: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowRate: number;
    averageConsultationTime: number;
    punctualityScore: number;
    rebookingRate: number;
  };
  financialMetrics: {
    revenue: number;
    collectionsRate: number;
    averageRevenuePerPatient: number;
    productivity: number;
    costPerConsultation: number;
  };
  patientOutcomes: {
    successfulTreatments: number;
    referrals: number;
    readmissions: number;
    complications: number;
    patientSatisfactionScore: number;
    complaintCount: number;
  };
  qualityMetrics: {
    adherenceToGuidelines: number;
    documentationQuality: number;
    safetyIncidents: number;
    continuingEducationHours: number;
    researchPublications: number;
  };
  workloadMetrics: {
    workingHours: number;
    overtime: number;
    patientLoad: number;
    caseComplexity: number;
    burnoutRisk: "low" | "medium" | "high";
  };
}

export interface DashboardWidget {
  id: string;
  type: "chart" | "metric" | "table" | "alert" | "gauge" | "map";
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  dataSource: string;
  chartType?: "line" | "bar" | "pie" | "area" | "scatter" | "donut";
  configuration: Record<string, any>;
  refreshInterval: number; // minutes
  permissions: string[];
  isVisible: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export interface CustomDashboard {
  id: string;
  name: string;
  description?: string;
  category: "clinical" | "financial" | "operational" | "executive" | "custom";
  userId: string;
  isPublic: boolean;
  isDefault: boolean;
  widgets: DashboardWidget[];
  filters: Array<{
    field: string;
    operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "between";
    value: any;
    isRequired: boolean;
  }>;
  layout: "grid" | "free" | "tabs";
  theme: "light" | "dark" | "auto";
  autoRefresh: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  accessCount: number;
}

export interface ReportSchedule {
  id: string;
  reportType: "census" | "clinical" | "billing" | "inventory" | "utilization" | "performance";
  name: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  schedule: {
    time: string; // HH:MM format
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
  };
  recipients: Array<{
    email: string;
    name: string;
    role: string;
  }>;
  filters: Record<string, any>;
  format: "pdf" | "excel" | "csv" | "email";
  isActive: boolean;
  lastSent?: Date;
  nextSend: Date;
  createdBy: string;
}

export interface AlertConfiguration {
  id: string;
  name: string;
  type: "threshold" | "anomaly" | "trend" | "operational";
  metric: string;
  condition: {
    operator: ">" | "<" | "=" | "!=" | ">=" | "<=";
    value: number;
    timeWindow: number; // minutes
  };
  severity: "low" | "medium" | "high" | "critical";
  actions: Array<{
    type: "email" | "sms" | "notification" | "escalate";
    recipients: string[];
    template: string;
  }>;
  isActive: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface ReportExportOptions {
  format: "pdf" | "excel" | "csv" | "json";
  includeCharts: boolean;
  includeRawData: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
  compression?: boolean;
  password?: string;
}