export interface Bed {
  id: string;
  bedNumber: string;
  wardId: string;
  wardName: string;
  bedType: 'general' | 'icu' | 'private' | 'semi-private' | 'isolation';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  floor: string;
  features: string[];
  dailyRate: number;
  currentPatientId?: string;
  lastCleaned?: Date;
  notes?: string;
}

export interface Ward {
  id: string;
  name: string;
  code: string;
  department: string;
  floor: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  wardType: 'general' | 'icu' | 'nicu' | 'pediatric' | 'maternity' | 'isolation';
  nursingStationId: string;
  features: string[];
  capacity: number;
}

export interface Admission {
  id: string;
  patientId: string;
  patientName: string;
  admissionNumber: string;
  admissionDate: Date;
  admittingDoctorId: string;
  admittingDoctorName: string;
  department: string;
  wardId: string;
  wardName: string;
  bedId: string;
  bedNumber: string;
  admissionType: 'emergency' | 'elective' | 'transfer' | 'delivery';
  diagnosis: string;
  chiefComplaint: string;
  status: 'active' | 'discharged' | 'transferred' | 'deceased';
  estimatedDuration?: number;
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    coverage: number;
  };
  dischargeDate?: Date;
  dischargeSummary?: string;
  totalCost?: number;
  notes?: string;
}

export interface VitalSigns {
  id: string;
  patientId: string;
  admissionId: string;
  recordedAt: Date;
  recordedBy: string;
  temperature: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  bloodGlucose?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  painLevel?: number;
  consciousness: 'alert' | 'verbal' | 'pain' | 'unresponsive';
  notes?: string;
}

export interface NursingNote {
  id: string;
  admissionId: string;
  patientId: string;
  recordedAt: Date;
  nurseId: string;
  nurseName: string;
  shift: 'morning' | 'afternoon' | 'night';
  noteType: 'assessment' | 'intervention' | 'evaluation' | 'handover';
  category: 'general' | 'medication' | 'wound-care' | 'mobility' | 'nutrition' | 'elimination' | 'safety';
  note: string;
  actionTaken?: string;
  followUpRequired: boolean;
  priority: 'routine' | 'important' | 'urgent';
}

export interface Transfer {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  transferDate: Date;
  fromWardId: string;
  fromWardName: string;
  fromBedId: string;
  fromBedNumber: string;
  toWardId: string;
  toWardName: string;
  toBedId: string;
  toBedNumber: string;
  reason: string;
  requestedBy: string;
  approvedBy: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Discharge {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  dischargeDate: Date;
  dischargeTime: string;
  dischargingDoctorId: string;
  dischargingDoctorName: string;
  dischargeType: 'routine' | 'against-medical-advice' | 'transfer' | 'deceased' | 'absconded';
  finalDiagnosis: string;
  dischargeSummary: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  followUpDate?: Date;
  followUpInstructions?: string;
  dietaryInstructions?: string;
  activityRestrictions?: string;
  warningSignsEducation?: string;
  dischargeCondition: 'improved' | 'stable' | 'critical' | 'deceased';
  homeCarePlan?: string;
  referralRequired: boolean;
  referralDetails?: string;
}

export interface MedicationAdministration {
  id: string;
  admissionId: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  route: 'oral' | 'iv' | 'im' | 'subcutaneous' | 'topical' | 'inhalation';
  scheduledTime: Date;
  administeredTime?: Date;
  administeredBy?: string;
  status: 'pending' | 'administered' | 'skipped' | 'refused';
  reason?: string;
  sideEffects?: string;
  notes?: string;
}
