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