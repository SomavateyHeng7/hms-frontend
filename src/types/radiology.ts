export interface ImagingOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientMRN: string;
  orderingPhysician: {
    id: string;
    name: string;
    department: string;
    license: string;
  };
  imagingType: "xray" | "mri" | "ct" | "ultrasound" | "mammography" | "nuclear_medicine" | "pet_scan" | "fluoroscopy";
  examType: string;
  bodyPart: string;
  clinicalIndication: string;
  urgency: "routine" | "urgent" | "stat" | "emergency";
  contrast: {
    required: boolean;
    type?: "oral" | "iv" | "both";
    agent?: string;
    allergies?: string[];
  };
  scheduledDateTime?: Date;
  estimatedDuration: number; // in minutes
  specialInstructions?: string;
  preparationInstructions: string[];
  status: "ordered" | "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
  orderDate: Date;
  completedDate?: Date;
  technologist?: {
    id: string;
    name: string;
    license: string;
  };
  radiologist?: {
    id: string;
    name: string;
    license: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImagingStudy {
  id: string;
  studyInstanceUID: string;
  orderId: string;
  patientId: string;
  accessionNumber: string;
  studyDate: Date;
  studyTime: string;
  modality: string;
  bodyPartExamined: string;
  studyDescription: string;
  seriesCount: number;
  instanceCount: number;
  studyStatus: "in_progress" | "completed" | "verified" | "archived";
  acquisitionDate: Date;
  technologist: {
    id: string;
    name: string;
    license: string;
  };
  equipment: {
    manufacturer: string;
    model: string;
    serialNumber: string;
    stationName: string;
  };
  acquisitionParameters: {
    kvp?: number;
    mas?: number;
    sliceThickness?: number;
    pixelSpacing?: string;
    imageOrientation?: string;
    contrastUsed?: boolean;
    contrastAgent?: string;
  };
  fileSize: number; // in bytes
  imageCount: number;
  pacsLocation: string;
  backupLocation?: string;
  qualityControl: {
    status: "pending" | "passed" | "failed" | "needs_repeat";
    reviewer?: string;
    reviewDate?: Date;
    comments?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RadiologyReport {
  id: string;
  reportNumber: string;
  studyId: string;
  orderId: string;
  patientId: string;
  patientName: string;
  studyInstanceUID: string;
  radiologist: {
    id: string;
    name: string;
    license: string;
    signature: string;
  };
  reportType: "preliminary" | "final" | "addendum" | "corrected";
  clinicalHistory: string;
  technique: string;
  findings: string;
  impression: string;
  recommendations?: string;
  criticalFindings?: {
    present: boolean;
    description?: string;
    notificationDate?: Date;
    notifiedPersonnel?: string[];
  };
  comparison?: {
    priorStudyDate?: Date;
    priorStudyDescription?: string;
    comparison?: string;
  };
  reportStatus: "draft" | "preliminary" | "final" | "signed" | "amended";
  status: "draft" | "pending_review" | "reviewed" | "finalized" | "signed";
  priority: "routine" | "urgent" | "stat";
  reportDate: Date;
  dictationDate: Date;
  transcriptionDate?: Date;
  signDate?: Date;
  signedAt?: Date;
  verificationDate?: Date;
  radiologistId: string;
  template?: string;
  macros?: string[];
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ImagingEquipment {
  id: string;
  name: string;
  type: "xray" | "mri" | "ct" | "ultrasound" | "mammography" | "nuclear_medicine" | "pet_scan" | "fluoroscopy";
  manufacturer: string;
  model: string;
  serialNumber: string;
  installationDate: Date;
  lastMaintenanceDate: Date;
  nextMaintenanceDate: Date;
  location: {
    building: string;
    floor: string;
    room: string;
  };
  status: "operational" | "maintenance" | "out_of_order" | "calibration";
  capabilities: string[];
  maxPatientWeight: number;
  powerRequirements: string;
  operatingHours: {
    start: string;
    end: string;
    daysOfWeek: number[];
  };
  technicalSpecs: {
    [key: string]: string | number;
  };
  maintenanceHistory: {
    date: Date;
    type: "routine" | "repair" | "calibration" | "upgrade";
    description: string;
    technician: string;
    cost?: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ImagingSchedule {
  id: string;
  date: Date;
  equipmentId: string;
  timeSlots: {
    startTime: string;
    endTime: string;
    duration: number;
    status: "available" | "booked" | "blocked" | "maintenance";
    orderId?: string;
    patientId?: string;
    examType?: string;
    technologist?: string;
  }[];
  capacity: {
    total: number;
    booked: number;
    available: number;
    blocked: number;
  };
  specialNotes?: string;
  emergencySlots: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PACSConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  aeTitle: string;
  protocol: "DICOM" | "HL7" | "REST";
  authentication: {
    required: boolean;
    username?: string;
    password?: string;
    certificate?: string;
  };
  storageClass: string[];
  transferSyntax: string[];
  compression: {
    enabled: boolean;
    algorithm?: "JPEG" | "JPEG2000" | "RLE";
  };
  queryRetrieveLevel: "PATIENT" | "STUDY" | "SERIES" | "IMAGE";
  maxConnections: number;
  timeout: number;
  retryAttempts: number;
  storageLocation: string;
  backupEnabled: boolean;
  backupLocation?: string;
  archivePolicy: {
    enabled: boolean;
    archiveAfterDays: number;
    archiveLocation: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImagingMetrics {
  date: Date;
  totalOrders: number;
  completedStudies: number;
  pendingReports: number;
  averageReportTurnaround: number; // hours
  equipmentUtilization: {
    equipmentId: string;
    utilizationRate: number; // percentage
    totalExams: number;
    downtime: number; // minutes
  }[];
  modalityStats: {
    modality: string;
    orderCount: number;
    completionRate: number;
    avgDuration: number;
  }[];
  criticalFindings: number;
  noShows: number;
  cancellations: number;
  emergencyExams: number;
}

// Form Data Types
export interface ImagingOrderFormData {
  patientId: string;
  imagingType: "xray" | "mri" | "ct" | "ultrasound" | "mammography" | "nuclear_medicine" | "pet_scan" | "fluoroscopy";
  examType: string;
  bodyPart: string;
  clinicalIndication: string;
  urgency: "routine" | "urgent" | "stat" | "emergency";
  contrast: {
    required: boolean;
    type?: "oral" | "iv" | "both";
    agent?: string;
    allergies?: string[];
  };
  specialInstructions?: string;
  preparationInstructions: string[];
  preferredDate?: string;
  preferredTime?: string;
}

export interface ImagingScheduleFormData {
  orderId: string;
  equipmentId: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  technologistId: string;
  specialNotes?: string;
}

export interface RadiologyReportFormData {
  studyId: string;
  reportType: "preliminary" | "final" | "addendum" | "corrected";
  clinicalHistory: string;
  technique: string;
  findings: string;
  impression: string;
  recommendations?: string;
  criticalFindings?: {
    present: boolean;
    description?: string;
  };
  comparison?: {
    priorStudyDate?: string;
    priorStudyDescription?: string;
    comparison?: string;
  };
}

export interface CriticalFindingFormData {
  reportId: string;
  finding: string;
  severity: "high" | "medium" | "low";
  notificationMethod: "phone" | "email" | "page" | "in_person";
  notifiedPersonnel: string[];
  notificationTime: string;
  acknowledgment?: {
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: string;
  };
}

export interface StudyViewerProps {
  studyId: string;
  studyInstanceUID: string;
  pacsConfig: PACSConfig;
  onClose: () => void;
  onReportCreate: (studyId: string) => void;
}

export interface PACSIntegrationProps {
  config: PACSConfig;
  onStudyReceived: (study: ImagingStudy) => void;
  onError: (error: string) => void;
}