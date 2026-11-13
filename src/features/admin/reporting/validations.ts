import { z } from "zod";

// Report Generation Schemas
export const reportFiltersSchema = z.object({
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }),
  departmentIds: z.array(z.string()).optional(),
  doctorIds: z.array(z.string()).optional(),
  patientTypes: z.array(z.enum(["inpatient", "outpatient", "emergency"])).optional(),
  includeWeekends: z.boolean().default(true),
  groupBy: z.enum(["day", "week", "month", "department", "doctor"]).optional()
});

export const dailyCensusSchema = z.object({
  reportDate: z.date(),
  includeHourlyBreakdown: z.boolean().default(false),
  includeDepartmentDetails: z.boolean().default(true),
  includeDischargeAnalysis: z.boolean().default(false)
});

export const clinicalReportSchema = z.object({
  reportType: z.enum(["diagnostic", "treatment", "outcome", "quality", "safety"]),
  title: z.string().min(1, "Report title is required"),
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }),
  departmentId: z.string().optional(),
  doctorId: z.string().optional(),
  includeRecommendations: z.boolean(),
  includeBenchmarks: z.boolean()
});

export const billingSummarySchema = z.object({
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }),
  includeDepartmentBreakdown: z.boolean().default(true),
  includeAgeingAnalysis: z.boolean().default(true),
  includePaymentMethods: z.boolean().default(true),
  groupBy: z.enum(["day", "week", "month"]).default("month")
});

export const inventoryReportSchema = z.object({
  reportDate: z.date(),
  includeCategories: z.boolean().default(true),
  includeSupplierAnalysis: z.boolean().default(false),
  includeWasteAnalysis: z.boolean().default(true),
  lowStockThreshold: z.number().min(1).default(10),
  expiryDays: z.number().min(1).default(30)
});

export const resourceUtilizationSchema = z.object({
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }),
  includeRooms: z.boolean().default(true),
  includeEquipment: z.boolean().default(true),
  includeStaff: z.boolean().default(true),
  departmentIds: z.array(z.string()).optional()
});

export const doctorPerformanceSchema = z.object({
  doctorId: z.string().min(1, "Doctor selection is required"),
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }),
  includeFinancials: z.boolean().default(true),
  includeQuality: z.boolean().default(true),
  includePatientOutcomes: z.boolean().default(true),
  compareWithPeers: z.boolean().default(false)
});

// Dashboard Configuration Schemas
export const dashboardWidgetSchema = z.object({
  type: z.enum(["chart", "metric", "table", "alert", "gauge", "map"]),
  title: z.string().min(1, "Widget title is required"),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().min(1).max(12),
    height: z.number().min(1).max(6)
  }),
  dataSource: z.string().min(1, "Data source is required"),
  chartType: z.enum(["line", "bar", "pie", "area", "scatter", "donut"]).optional(),
  refreshInterval: z.number().min(1).max(1440).default(60),
  isVisible: z.boolean().default(true),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional()
});

export const customDashboardSchema = z.object({
  name: z.string().min(1, "Dashboard name is required"),
  description: z.string().optional(),
  category: z.enum(["clinical", "financial", "operational", "executive", "custom"]),
  isPublic: z.boolean().default(false),
  isDefault: z.boolean().default(false),
  widgets: z.array(dashboardWidgetSchema),
  filters: z.array(z.object({
    field: z.string(),
    operator: z.enum(["equals", "not_equals", "greater_than", "less_than", "contains", "between"]),
    value: z.any(),
    isRequired: z.boolean().default(false)
  })),
  layout: z.enum(["grid", "free", "tabs"]).default("grid"),
  theme: z.enum(["light", "dark", "auto"]).default("light"),
  autoRefresh: z.boolean().default(false)
});

// Report Scheduling Schemas
export const reportScheduleSchema = z.object({
  reportType: z.enum(["census", "clinical", "billing", "inventory", "utilization", "performance"]),
  name: z.string().min(1, "Schedule name is required"),
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
  schedule: z.object({
    time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional()
  }),
  recipients: z.array(z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(1, "Recipient name is required"),
    role: z.string().min(1, "Recipient role is required")
  })).min(1, "At least one recipient is required"),
  format: z.enum(["pdf", "excel", "csv", "email"]),
  isActive: z.boolean().default(true)
});

// Alert Configuration Schemas
export const alertConfigurationSchema = z.object({
  name: z.string().min(1, "Alert name is required"),
  type: z.enum(["threshold", "anomaly", "trend", "operational"]),
  metric: z.string().min(1, "Metric is required"),
  condition: z.object({
    operator: z.enum([">", "<", "=", "!=", ">=", "<="]),
    value: z.number(),
    timeWindow: z.number().min(1).max(1440)
  }),
  severity: z.enum(["low", "medium", "high", "critical"]),
  actions: z.array(z.object({
    type: z.enum(["email", "sms", "notification", "escalate"]),
    recipients: z.array(z.string().email()),
    template: z.string().min(1, "Action template is required")
  })).min(1, "At least one action is required"),
  isActive: z.boolean().default(true)
});

// Export Options Schema
export const reportExportSchema = z.object({
  format: z.enum(["pdf", "excel", "csv", "json"]),
  includeCharts: z.boolean().default(true),
  includeRawData: z.boolean().default(false),
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }).optional(),
  compression: z.boolean().default(false),
  password: z.string().min(6, "Password must be at least 6 characters").optional()
});

// Form Data Types
export type ReportFiltersFormData = z.infer<typeof reportFiltersSchema>;
export type DailyCensusFormData = z.infer<typeof dailyCensusSchema>;
export type ClinicalReportFormData = z.infer<typeof clinicalReportSchema>;
export type BillingSummaryFormData = z.infer<typeof billingSummarySchema>;
export type InventoryReportFormData = z.infer<typeof inventoryReportSchema>;
export type ResourceUtilizationFormData = z.infer<typeof resourceUtilizationSchema>;
export type DoctorPerformanceFormData = z.infer<typeof doctorPerformanceSchema>;
export type DashboardWidgetFormData = z.infer<typeof dashboardWidgetSchema>;
export type CustomDashboardFormData = z.infer<typeof customDashboardSchema>;
export type ReportScheduleFormData = z.infer<typeof reportScheduleSchema>;
export type AlertConfigurationFormData = z.infer<typeof alertConfigurationSchema>;
export type ReportExportFormData = z.infer<typeof reportExportSchema>;