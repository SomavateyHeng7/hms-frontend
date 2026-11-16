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
  accessionNumber: string;
  patientId: string;
  patientName: string;
  studyDate: Date;
  studyDescription: string;
  modality: string;
  institutionName: string;
  equipment?: {
    id: string;
    name: string;
  };
  referringPhysician: string;
  status: "pending" | "in_progress" | "completed" | "cancelled" | "archived";
  series: StudySeries[];
  pacsInfo: {
    server: string;
    aeTitle: string;
    stored: boolean;
    archived: boolean;
    retrieveAeTitle?: string;
  };
  qualityControl?: {
    status: "pending" | "passed" | "failed" | "review_required";
    overallQuality?: "excellent" | "good" | "acceptable" | "poor" | "unacceptable";
    technicalAdequacy?: "adequate" | "suboptimal" | "inadequate";
    artifactsPresent?: boolean;
    reviewedBy?: string;
    reviewedAt?: Date;
    comments?: string;
  };
}

export interface StudySeries {
  seriesInstanceUID: string;
  seriesNumber: number;
  seriesDescription: string;
  instanceCount: number;
  bodyPartExamined: string;
  /** Size in bytes */
  imageSize: number;
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
  /** Percentage of available hours in use */
  utilizationRate?: number;
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
  orderId: string;
  orderNumber: string;
  patientName: string;
  patientMRN: string;
  examType: string;
  bodyPart: string;
  urgency: "routine" | "urgent" | "stat" | "emergency";
  scheduledDateTime: Date;
  /** Estimated duration in minutes */
  estimatedDuration: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show" | "rescheduled";
  equipmentId: string;
  equipment?: {
    id: string;
    name: string;
    location: string;
  };
  technicianId: string;
  technician?: {
    id: string;
    name: string;
  };
  notes?: string;
  preparationRequired?: boolean;
  preparationInstructions?: string[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface PACSConfig {
  id: string;
  name: string;
  serverAddress: string;
  port: number;
  aeTitle: string;
  callingAeTitle: string;
  supportedProtocols: string[];
  /** Timeout in seconds */
  timeout: number;
  retryAttempts: number;
  security: {
    tlsEnabled: boolean;
    username?: string;
    password?: string;
    certificatePath?: string;
  };
  storage: {
    compression: "none" | "jpeg" | "jpeg2000" | "jpegls" | "rle";
    /** Max file size in MB */
    maxFileSize: number;
    retentionDays: number;
    autoArchive: boolean;
    archivePath?: string;
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