export type InstrumentCategory = 'surgical' | 'dental' | 'gynecological' | 'orthopedic' | 'cardiovascular' | 'ophthalmic' | 'ent' | 'general';
export type SterilizationMethod = 'steam-autoclave' | 'ethylene-oxide' | 'hydrogen-peroxide' | 'dry-heat' | 'radiation' | 'chemical';
export type PackStatus = 'awaiting-sterilization' | 'sterilizing' | 'sterilized' | 'dispatched' | 'returned' | 'contaminated' | 'damaged' | 'expired';
export type EquipmentStatus = 'operational' | 'in-use' | 'maintenance' | 'breakdown' | 'calibration';

export interface Instrument {
  id: string;
  instrumentCode: string;
  instrumentName: string;
  category: InstrumentCategory;
  
  manufacturer: string;
  model?: string;
  serialNumber?: string;
  
  material: 'stainless-steel' | 'titanium' | 'plastic' | 'rubber' | 'glass' | 'other';
  
  quantity: number;
  unitCost: number;
  
  reusable: boolean;
  sterilizationMethods: SterilizationMethod[];
  
  cleaningProcedure: string;
  handlingPrecautions?: string;
  
  expectedLifespan: number; // in cycles
  currentCycles: number;
  
  qrCode?: string;
  barcode?: string;
  
  storageLocation: string;
  
  isActive: boolean;
  notes?: string;
  
  lastInspectionDate?: Date;
  nextInspectionDate?: Date;
}

export interface InstrumentSet {
  id: string;
  setCode: string;
  setName: string;
  category: InstrumentCategory;
  
  description: string;
  
  instruments: Array<{
    instrumentId: string;
    instrumentName: string;
    quantity: number;
    isMandatory: boolean;
  }>;
  
  department: string;
  specialty?: string;
  
  sterilizationMethod: SterilizationMethod;
  sterilizationDuration: number; // minutes
  
  totalSets: number;
  availableSets: number;
  
  isActive: boolean;
  notes?: string;
}

export interface SterilizationCycle {
  id: string;
  cycleNumber: string;
  
  sterilizerId: string;
  sterilizerName: string;
  sterilizationMethod: SterilizationMethod;
  
  startTime: Date;
  endTime?: Date;
  
  loadItems: Array<{
    itemId: string;
    itemType: 'instrument' | 'set' | 'linen' | 'other';
    itemName: string;
    packNumber: string;
    quantity: number;
    department: string;
  }>;
  
  parameters: {
    temperature?: number; // Celsius
    pressure?: number; // PSI
    duration: number; // minutes
    cycleType?: string;
  };
  
  biologicalIndicator?: {
    batchNumber: string;
    testResult: 'negative' | 'positive' | 'pending';
    testedBy: string;
    testedDate?: Date;
  };
  
  chemicalIndicator?: {
    batchNumber: string;
    testResult: 'pass' | 'fail' | 'pending';
    testedBy: string;
  };
  
  status: 'in-progress' | 'completed' | 'failed' | 'aborted';
  failureReason?: string;
  
  operatedBy: string;
  verifiedBy?: string;
  
  notes?: string;
}

export interface SterilizationPack {
  id: string;
  packNumber: string;
  barcodeNumber?: string;
  
  itemType: 'instrument' | 'instrument-set' | 'linen' | 'dressing' | 'other';
  itemId?: string;
  itemName: string;
  
  contents: Array<{
    name: string;
    quantity: number;
  }>;
  
  department: string;
  
  // Packaging
  packagingDate: Date;
  packedBy: string;
  packagingMaterial: 'paper' | 'plastic-pouch' | 'wrap' | 'container';
  
  // Sterilization
  sterilizationMethod: SterilizationMethod;
  sterilizationCycleId?: string;
  sterilizationDate?: Date;
  sterilizedBy?: string;
  
  expiryDate: Date;
  
  // Indicators
  chemicalIndicatorResult?: 'pass' | 'fail';
  biologicalIndicatorResult?: 'negative' | 'positive';
  
  // Tracking
  status: PackStatus;
  
  dispatchDetails?: {
    dispatchedTo: string;
    dispatchedBy: string;
    dispatchedDate: Date;
    receivedBy?: string;
  };
  
  usageDetails?: {
    usedBy: string;
    usedDate: Date;
    procedureType: string;
    patientId?: string;
  };
  
  returnDetails?: {
    returnedBy: string;
    returnedDate: Date;
    condition: 'clean' | 'contaminated' | 'damaged';
    notes?: string;
  };
  
  qualityCheck?: {
    checkedBy: string;
    checkDate: Date;
    packIntegrity: 'intact' | 'compromised';
    indicatorStatus: 'acceptable' | 'unacceptable';
    approved: boolean;
    notes?: string;
  };
  
  reprocessingCount: number;
  
  notes?: string;
}

export interface SterilizationEquipment {
  id: string;
  equipmentCode: string;
  equipmentName: string;
  
  type: SterilizationMethod;
  manufacturer: string;
  model: string;
  serialNumber: string;
  
  capacity: number; // liters or cubic feet
  
  installationDate: Date;
  warrantyExpiry?: Date;
  
  // Operational parameters
  specifications: {
    temperatureRange?: { min: number; max: number };
    pressureRange?: { min: number; max: number };
    maxLoadWeight?: number;
  };
  
  status: EquipmentStatus;
  
  // Maintenance
  maintenanceSchedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    lastMaintenance: Date;
    nextMaintenance: Date;
    maintenanceBy?: string;
  };
  
  calibration: {
    lastCalibration: Date;
    nextCalibration: Date;
    calibrationBy?: string;
    certificateNumber?: string;
  };
  
  // Performance
  totalCycles: number;
  cyclesThisMonth: number;
  
  breakdownHistory?: Array<{
    date: Date;
    issue: string;
    resolvedDate?: Date;
    resolvedBy?: string;
    downtime: number; // hours
  }>;
  
  currentLocation: string;
  
  isActive: boolean;
  notes?: string;
}

export interface WashingCycle {
  id: string;
  cycleNumber: string;
  
  washerId: string;
  washerName: string;
  
  startTime: Date;
  endTime?: Date;
  
  loadItems: Array<{
    itemType: 'instrument' | 'set' | 'equipment';
    itemName: string;
    quantity: number;
    department: string;
    contaminationLevel?: 'low' | 'medium' | 'high';
  }>;
  
  washingParameters: {
    temperature: number; // Celsius
    duration: number; // minutes
    detergent: string;
    cycleType: 'regular' | 'intensive' | 'delicate';
  };
  
  dryingParameters?: {
    temperature: number;
    duration: number;
  };
  
  waterQuality: {
    ph?: number;
    hardness?: number;
    tested: boolean;
  };
  
  status: 'in-progress' | 'completed' | 'failed';
  failureReason?: string;
  
  operatedBy: string;
  verifiedBy?: string;
  
  notes?: string;
}

export interface InventoryTracking {
  instrumentId: string;
  instrumentName: string;
  category: InstrumentCategory;
  
  totalQuantity: number;
  
  distribution: {
    inCssd: number;
    inSterilization: number;
    sterileReady: number;
    dispatched: number;
    inUse: number;
    contaminated: number;
    damaged: number;
    underMaintenance: number;
  };
  
  reorderLevel: number;
  status: 'adequate' | 'low' | 'critical';
  
  lastRestockDate?: Date;
  nextRestockDue?: Date;
}

export interface CssdStats {
  totalInstruments: number;
  totalSets: number;
  
  sterilizationCyclesToday: number;
  packsProcessedToday: number;
  
  sterilePacksAvailable: number;
  packsDispatchedToday: number;
  packsReturnedToday: number;
  
  expiringPacks7Days: number;
  
  equipmentOperational: number;
  equipmentMaintenance: number;
  
  averageTurnaroundTime: number; // hours
  
  pendingProcessing: number;
}

export interface DepartmentRequest {
  id: string;
  requestNumber: string;
  
  department: string;
  requestedBy: string;
  requestDate: Date;
  requiredDate: Date;
  
  items: Array<{
    itemType: 'instrument' | 'set';
    itemId: string;
    itemName: string;
    quantity: number;
    urgency: 'routine' | 'urgent' | 'emergency';
  }>;
  
  purpose?: string;
  
  status: 'pending' | 'approved' | 'processing' | 'ready' | 'dispatched' | 'completed' | 'cancelled';
  
  approvedBy?: string;
  approvedDate?: Date;
  
  dispatchedBy?: string;
  dispatchedDate?: Date;
  
  receivedBy?: string;
  receivedDate?: Date;
  
  cancelReason?: string;
  notes?: string;
}

export interface QualityControl {
  id: string;
  qcNumber: string;
  
  qcDate: Date;
  qcType: 'routine' | 'random' | 'post-incident';
  
  inspectedBy: string;
  
  checks: Array<{
    checkItem: string;
    standard: string;
    result: 'pass' | 'fail';
    observations?: string;
  }>;
  
  samplesInspected: Array<{
    packNumber: string;
    itemName: string;
    sterilizationDate: Date;
    packIntegrity: 'intact' | 'compromised';
    indicatorStatus: 'pass' | 'fail';
    overallStatus: 'approved' | 'rejected';
  }>;
  
  overallResult: 'satisfactory' | 'needs-improvement' | 'unsatisfactory';
  
  correctiveActions?: string[];
  
  followUpRequired: boolean;
  followUpDate?: Date;
  
  notes?: string;
}
