import type { BillingSummary, DailyCensusReport, InventoryReport } from "./types";

/**
 * Zero-value reports so the Reporting screens render before the mock data layer
 * (roadmap Phase 1) computes real figures from the other modules.
 */
export function emptyDailyCensus(date = new Date()): DailyCensusReport {
  return {
    reportDate: date,
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
}

export function emptyBillingSummary(date = new Date()): BillingSummary {
  return {
    reportDate: date,
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
}

export function emptyInventoryReport(date = new Date()): InventoryReport {
  return {
    reportDate: date,
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
}
