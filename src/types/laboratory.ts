export interface LabTest {
  id: string;
  code: string;
  name: string;
  category: LabTestCategory;
  sampleType: SampleType;
  methodology: string;
  normalRange: {
    min?: number;
    max?: number;
    unit: string;
    reference: string;
  };
  turnaroundTime: number; // in hours
  fastingRequired: boolean;
  price: number;
  isActive: boolean;
  instructions?: string;
  components?: LabTestComponent[];
}

export interface LabTestComponent {
  id: string;
  name: string;
  unit: string;
  normalRange: {
    min?: number;
    max?: number;
    reference: string;
  };
  criticalValues: {
    low?: number;
    high?: number;
  };
}

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientMRN: string;
  patientDOB: Date;
  patientGender: string;
  orderingPhysician: {
    id: string;
    name: string;
    department: string;
    license: string;
  };
  tests: LabOrderTest[];
  priority: "routine" | "urgent" | "stat" | "asap";
  clinicalIndication: string;
  notes?: string;
  status: "ordered" | "collected" | "processing" | "completed" | "cancelled";
  orderDate: Date;
  collectionDate?: Date;
  completionDate?: Date;
  fastingRequired: boolean;
  totalAmount: number;
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
}

export interface LabOrderTest {
  testId: string;
  testName: string;
  testCode: string;
  sampleId?: string;
  status: "pending" | "collected" | "processing" | "completed" | "cancelled";
  results?: LabTestResult[];
  collectedBy?: string;
  collectedAt?: Date;
  processedBy?: string;
  processedAt?: Date;
  validatedBy?: string;
  validatedAt?: Date;
}

export interface LabSample {
  id: string;
  sampleId: string;
  barcode: string;
  orderId: string;
  orderNumber: string;
  patientName: string;
  patientMRN: string;
  sampleType: SampleType;
  collectionDate: Date;
  collectedBy: string;
  status: "collected" | "received" | "processing" | "completed" | "rejected";
  rejectionReason?: string;
  tests: string[]; // test IDs
  storageLocation?: string;
  temperature?: number;
  expiryDate?: Date;
  volume: number;
  unit: string;
  notes?: string;
}

export interface LabTestResult {
  id: string;
  testComponentId: string;
  componentName: string;
  value: string | number;
  unit: string;
  normalRange: string;
  flag: "normal" | "high" | "low" | "critical_high" | "critical_low" | "abnormal";
  status: "pending" | "preliminary" | "final" | "corrected" | "cancelled";
  enteredBy: string;
  enteredAt: Date;
  validatedBy?: string;
  validatedAt?: Date;
  notes?: string;
  orderId: string;
  testCode: string;
  referenceRange?: string;
  method?: string;
  comments?: string;
  validationComments?: string;
  isCritical?: boolean;
  /** Set when the result is stored against a known patient */
  patientId?: string;
  /** Id of the staff member who entered the result */
  enteredById?: string;
}

export type LabReportDeliveryMethod = "digital" | "email" | "print" | "fax";

export interface LabReport {
  id: string;
  reportNumber: string;
  orderId: string;
  patientId: string;
  patientName: string;
  patientMRN: string;
  patientDOB: Date;
  patientGender: string;
  orderingPhysician: {
    name: string;
    department: string;
  };
  tests: LabReportTest[];
  reportDate: Date;
  status: "preliminary" | "final" | "amended" | "cancelled";
  technologist: {
    id: string;
    name: string;
    license: string;
  };
  pathologist?: {
    id: string;
    name: string;
    license: string;
  };
  clinicalIndication: string;
  interpretation?: string;
  recommendations?: string[];
  criticalValues: boolean;
  notificationSent: boolean;
  printedAt?: Date;
  deliveryMethod: LabReportDeliveryMethod[];
  template?: string;
  generatedAt?: Date;
  generatedBy?: string;
  comments?: string;
  deliveryStatus?: Record<string, string>;
}

export interface LabReportTest {
  testId: string;
  testName: string;
  testCode: string;
  methodology: string;
  sampleType: string;
  collectionDate: Date;
  results: LabTestResult[];
  interpretation?: string;
  referenceRanges: string;
}

export interface LabEquipment {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  type: LabEquipmentType;
  location: string;
  status: "operational" | "maintenance" | "calibration" | "out_of_service";
  installDate: Date;
  lastCalibration: Date;
  nextCalibration: Date;
  lastMaintenance: Date;
  nextMaintenance: Date;
  supportedTests: string[]; // test codes
  interfaceType: "HL7" | "LIS" | "ASTM" | "manual";
  connectionStatus: "connected" | "disconnected" | "error";
  lastDataReceived?: Date;
  qualityControls: QualityControl[];
}

export interface QualityControl {
  id: string;
  date: Date;
  level: "low" | "normal" | "high";
  testCode: string;
  expectedValue: number;
  actualValue: number;
  unit: string;
  status: "pass" | "fail" | "warning";
  performedBy: string;
  notes?: string;
}

export interface LabMetrics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  urgentOrders: number;
  averageTurnaroundTime: number;
  criticalResults: number;
  equipmentUptime: number;
  sampleRejectionRate: number;
}

export type LabTestCategory = 
  | "hematology" 
  | "chemistry" 
  | "immunology" 
  | "microbiology" 
  | "molecular" 
  | "pathology" 
  | "toxicology" 
  | "coagulation"
  | "endocrinology"
  | "cardiology";

export type SampleType = 
  | "blood" 
  | "serum" 
  | "plasma" 
  | "urine" 
  | "stool" 
  | "csf" 
  | "tissue" 
  | "swab" 
  | "sputum" 
  | "saliva";

export type LabEquipmentType = 
  | "analyzer" 
  | "centrifuge" 
  | "microscope" 
  | "incubator" 
  | "pcr" 
  | "mass_spectrometer" 
  | "coagulation_analyzer" 
  | "blood_gas_analyzer"
  | "immunoassay_analyzer";

// Form data interfaces
// LabOrderFormData is now exported from validations file as Zod inferred type

export interface SampleCollectionFormData {
  orderId: string;
  sampleType: SampleType;
  volume: number;
  unit: string;
  collectionDate: Date;
  collectedBy: string;
  notes?: string;
}

export interface TestResultFormData {
  sampleId: string;
  testId: string;
  results: {
    componentId: string;
    value: string | number;
    notes?: string;
  }[];
  enteredBy: string;
  status: "preliminary" | "final";
}

export interface QualityControlFormData {
  equipmentId: string;
  testCode: string;
  level: "low" | "normal" | "high";
  expectedValue: number;
  actualValue: number;
  unit: string;
  performedBy: string;
  notes?: string;
}