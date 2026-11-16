"use client";

import React, { useState } from "react";
import { useTabParam } from "@/hooks/use-tab-param";
import { ReportingAnalytics } from "@/components/reporting/reporting-analytics";
import type {
  DailyCensusReport,
  BillingSummary,
  InventoryReport,
  ResourceUtilizationReport,
  DoctorPerformanceReport,
} from "@/types/reporting";

// Placeholder (empty) report data - to be replaced by API calls once the backend exists
function createEmptyReports(now: Date) {
  const dailyCensus: DailyCensusReport = {
    reportDate: now,
    totalPatients: 0,
    inPatients: 0,
    outPatients: 0,
    emergencyPatients: 0,
    dischargedPatients: 0,
    admittedPatients: 0,
    bedOccupancy: { totalBeds: 0, occupiedBeds: 0, availableBeds: 0, occupancyRate: 0 },
    departmentBreakdown: [],
    hourlyBreakdown: [],
  };

  const billingSummary: BillingSummary = {
    reportDate: now,
    totalRevenue: 0,
    collectedAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    insurancePayments: 0,
    outOfPocketPayments: 0,
    refunds: 0,
    adjustments: 0,
    paymentMethods: [],
    departmentRevenue: [],
    topServices: [],
    ageingAnalysis: [],
  };

  const inventoryReport: InventoryReport = {
    reportDate: now,
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    expiringItems: 0,
    totalValue: 0,
    categories: [],
    topUsedItems: [],
    purchaseOrders: { pending: 0, completed: 0, totalValue: 0, averageLeadTime: 0 },
    wasteAnalysis: { expiredItems: 0, expiredValue: 0, damagedItems: 0, damagedValue: 0 },
    costAnalysis: { totalPurchases: 0, averageCostPerItem: 0, savingsFromBulkOrders: 0 },
  };

  const resourceUtilization: ResourceUtilizationReport = {
    reportDate: now,
    rooms: [],
    equipment: [],
    staffUtilization: [],
    energyUsage: { totalUsage: 0, efficiencyScore: 0, costSavings: 0, departmentUsage: [] },
  };

  const doctorPerformance: DoctorPerformanceReport = {
    reportDate: now,
    totalDoctors: 0,
    averageSatisfactionScore: 0,
    averageQualityScore: 0,
    averageEfficiencyScore: 0,
    topPerformers: [],
    doctors: [],
    specialtyPerformance: [],
    trends: { qualityImprovement: 0, satisfactionImprovement: 0, efficiencyImprovement: 0 },
    achievements: { excellenceAwards: 0, qualityTargetsMet: 0, patientAdvocacyScore: 0, efficiencyLeaders: 0 },
  };

  return { dailyCensus, billingSummary, inventoryReport, resourceUtilization, doctorPerformance };
}

export function ReportingManagement() {
  const [data] = useState(() => createEmptyReports(new Date()));
  const [activeTab, setActiveTab] = useTabParam("overview", [
    "overview",
    "census",
    "clinical",
    "billing",
    "inventory",
    "resources",
    "performance",
  ]);

  return (
    <div className="container mx-auto py-8 px-4">
      <ReportingAnalytics
        {...data}
        clinicalReports={[]}
        customDashboards={[]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
