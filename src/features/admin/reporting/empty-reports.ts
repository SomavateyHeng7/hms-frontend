import type { DailyCensusReport } from "./types";

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
