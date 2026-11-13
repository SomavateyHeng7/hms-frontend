export interface OperationTheater {
  id: string;
  name: string;
  code: string;
  floor: string;
  type: 'general' | 'cardiac' | 'neuro' | 'orthopedic' | 'emergency' | 'specialized';
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'reserved';
  capacity: number;
  equipment: string[];
  features: string[];
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  isActive: boolean;
}

export interface Surgery {
  id: string;
  surgeryNumber: string;
  patientId: string;
  patientName: string;
  surgeryType: string;
  surgeryName: string;
  operationTheaterId: string;
  operationTheaterName: string;
  scheduledDate: Date;
  scheduledStartTime: string;
  scheduledEndTime: string;
  estimatedDuration: number; // minutes
  actualStartTime?: Date;
  actualEndTime?: Date;
  actualDuration?: number;
  priority: 'emergency' | 'urgent' | 'elective' | 'routine';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'delayed';
  
  // Pre-operative
  diagnosis: string;
  surgicalProcedure: string;
  anesthesiaType: 'general' | 'regional' | 'local' | 'sedation';
  preOpInstructions: string;
  consentObtained: boolean;
  
  // Team
  surgeonId: string;
  surgeonName: string;
  assistantSurgeons: Array<{
    id: string;
    name: string;
  }>;
  anesthesiologistId: string;
  anesthesiologistName: string;
  nurses: Array<{
    id: string;
    name: string;
    role: 'scrub' | 'circulating' | 'anesthesia';
  }>;
  
  // Equipment & Supplies
  requiredEquipment: string[];
  requiredInstruments: string[];
  specialRequirements?: string;
  
  // Post-operative
  complications?: string;
  bloodLoss?: number;
  findings?: string;
  postOpInstructions?: string;
  recoveryRoomTime?: number;
  
  notes?: string;
}

export interface OTSchedule {
  id: string;
  operationTheaterId: string;
  operationTheaterName: string;
  date: Date;
  surgeries: Surgery[];
  totalScheduledTime: number;
  availableTime: number;
  isFullyBooked: boolean;
}

export interface SurgicalTeam {
  id: string;
  name: string;
  specialization: string;
  members: Array<{
    staffId: string;
    staffName: string;
    role: 'surgeon' | 'assistant-surgeon' | 'anesthesiologist' | 'scrub-nurse' | 'circulating-nurse';
    isLead: boolean;
  }>;
  availableDays: string[];
  isActive: boolean;
}

export interface OTEquipment {
  id: string;
  name: string;
  code: string;
  category: 'surgical' | 'anesthesia' | 'monitoring' | 'life-support' | 'imaging' | 'other';
  operationTheaterId?: string;
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-service';
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  maintenanceSchedule: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  warrantyExpiry?: Date;
  notes?: string;
}

export interface PreOpChecklist {
  id: string;
  surgeryId: string;
  patientId: string;
  completedBy: string;
  completedAt: Date;
  items: Array<{
    category: 'patient-verification' | 'consent' | 'medical-history' | 'medications' | 'allergies' | 'pre-op-tests' | 'equipment' | 'team';
    item: string;
    checked: boolean;
    notes?: string;
  }>;
  allItemsChecked: boolean;
  signedBy: string;
}

export interface PostOpRecord {
  id: string;
  surgeryId: string;
  patientId: string;
  recordedBy: string;
  recordedAt: Date;
  vitalSigns: {
    temperature: number;
    bloodPressure: string;
    heartRate: number;
    respiratoryRate: number;
    oxygenSaturation: number;
  };
  consciousness: 'alert' | 'drowsy' | 'sedated' | 'unresponsive';
  painLevel: number;
  drainageOutput?: number;
  complications?: string;
  medications: Array<{
    name: string;
    dosage: string;
    time: Date;
  }>;
  nursingNotes: string;
  dischargeFromRecovery?: Date;
}

export interface OTUtilization {
  operationTheaterId: string;
  operationTheaterName: string;
  date: Date;
  totalAvailableMinutes: number;
  scheduledMinutes: number;
  actualUsedMinutes: number;
  utilizationRate: number; // percentage
  numberOfSurgeries: number;
  completedSurgeries: number;
  cancelledSurgeries: number;
  delayedSurgeries: number;
  averageTurnoverTime: number; // minutes between surgeries
}
