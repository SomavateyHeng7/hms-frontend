export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type BloodComponent = 'whole-blood' | 'packed-rbc' | 'platelet' | 'plasma' | 'cryoprecipitate';
export type DonorType = 'voluntary' | 'replacement' | 'autologous';
export type ScreeningStatus = 'pending' | 'passed' | 'failed' | 'deferred';
export type BloodUnitStatus = 'available' | 'reserved' | 'issued' | 'expired' | 'discarded' | 'quarantine';

export interface Donor {
  id: string;
  donorNumber: string;
  name: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  bloodGroup: BloodGroup;
  contactNumber: string;
  email?: string;
  address: string;
  
  donorType: DonorType;
  registrationDate: Date;
  lastDonationDate?: Date;
  totalDonations: number;
  
  eligibilityStatus: 'eligible' | 'temporarily-deferred' | 'permanently-deferred';
  deferralReason?: string;
  deferralUntil?: Date;
  
  weight: number;
  height: number;
  
  medicalHistory: {
    chronicDiseases: string[];
    currentMedications: string[];
    allergies: string[];
    surgeries: string[];
  };
  
  emergencyContact: {
    name: string;
    relationship: string;
    contactNumber: string;
  };
  
  isActive: boolean;
  notes?: string;
}

export interface Donation {
  id: string;
  donationNumber: string;
  donorId: string;
  donorName: string;
  donorBloodGroup: BloodGroup;
  
  donationDate: Date;
  donationType: DonorType;
  donationCenter: string;
  
  // Pre-donation screening
  preScreening: {
    hemoglobin: number;
    bloodPressure: string;
    pulse: number;
    temperature: number;
    weight: number;
    medicalOfficer: string;
    screeningStatus: ScreeningStatus;
    screeningNotes?: string;
  };
  
  // Collection details
  collectionDetails: {
    bagNumber: string;
    volumeCollected: number; // in ml
    anticoagulant: string;
    phlebotomist: string;
    armUsed: 'left' | 'right';
    complications?: string;
  };
  
  // Testing
  testingStatus: 'pending' | 'in-progress' | 'completed';
  testResults?: {
    hiv: 'negative' | 'positive' | 'indeterminate';
    hbsag: 'negative' | 'positive' | 'indeterminate';
    hcv: 'negative' | 'positive' | 'indeterminate';
    vdrl: 'negative' | 'positive' | 'indeterminate';
    malaria: 'negative' | 'positive' | 'indeterminate';
    bloodGroupConfirmed: BloodGroup;
    testedBy: string;
    testedDate: Date;
  };
  
  // Component separation
  componentsSeparated: Array<{
    component: BloodComponent;
    unitNumber: string;
    volume: number;
    expiryDate: Date;
  }>;
  
  status: 'collected' | 'tested' | 'processed' | 'ready' | 'rejected';
  rejectionReason?: string;
  
  createdBy: string;
  notes?: string;
}

export interface BloodUnit {
  id: string;
  unitNumber: string;
  bagNumber: string;
  
  donationId: string;
  donorBloodGroup: BloodGroup;
  
  component: BloodComponent;
  volume: number; // in ml
  
  collectionDate: Date;
  expiryDate: Date;
  
  status: BloodUnitStatus;
  storageLocation: string;
  storageTemperature: number;
  
  // Compatibility testing
  crossMatchingRequired: boolean;
  crossMatchingStatus?: 'pending' | 'compatible' | 'incompatible';
  
  // Reservation/Issue
  reservedFor?: {
    patientId: string;
    patientName: string;
    reservedBy: string;
    reservedDate: Date;
    expiresAt: Date;
  };
  
  issuedDetails?: {
    patientId: string;
    patientName: string;
    requisitionNumber: string;
    issuedBy: string;
    issuedDate: Date;
    receivedBy: string;
    purpose: string;
  };
  
  qualityCheck: {
    visualInspection: 'passed' | 'failed';
    temperature: number;
    checkedBy: string;
    checkedDate: Date;
    notes?: string;
  };
  
  isActive: boolean;
  notes?: string;
}

export interface BloodRequest {
  id: string;
  requisitionNumber: string;
  
  patientId: string;
  patientName: string;
  patientBloodGroup: BloodGroup;
  
  requestedBy: string;
  requestedDate: Date;
  requiredBy: Date;
  
  department: string;
  ward?: string;
  bedNumber?: string;
  
  clinicalDiagnosis: string;
  indication: string;
  
  componentsRequested: Array<{
    component: BloodComponent;
    quantity: number;
    urgency: 'routine' | 'urgent' | 'emergency';
  }>;
  
  crossMatchRequired: boolean;
  patientHistory: {
    previousTransfusions: number;
    lastTransfusionDate?: Date;
    reactions?: string;
    pregnancyHistory?: string;
  };
  
  status: 'pending' | 'approved' | 'processing' | 'ready' | 'issued' | 'cancelled';
  
  approvedBy?: string;
  approvedDate?: Date;
  
  issuedUnits?: Array<{
    unitNumber: string;
    component: BloodComponent;
    issuedDate: Date;
  }>;
  
  cancelReason?: string;
  priority: 'routine' | 'urgent' | 'emergency';
  
  notes?: string;
}

export interface BloodInventory {
  bloodGroup: BloodGroup;
  component: BloodComponent;
  available: number;
  reserved: number;
  expired: number;
  expiringIn7Days: number;
  minimumLevel: number;
  status: 'adequate' | 'low' | 'critical';
}

export interface BloodBankStats {
  totalDonors: number;
  activeDonors: number;
  donationsToday: number;
  donationsThisMonth: number;
  totalUnitsAvailable: number;
  unitsIssuedToday: number;
  unitsExpiring7Days: number;
  pendingRequests: number;
  criticalStockItems: number;
}

export interface TransfusionRecord {
  id: string;
  patientId: string;
  patientName: string;
  requisitionNumber: string;
  
  unitNumber: string;
  component: BloodComponent;
  volume: number;
  
  startTime: Date;
  endTime?: Date;
  
  preTransfusion: {
    bloodPressure: string;
    pulse: number;
    temperature: number;
    recordedBy: string;
  };
  
  monitoring: Array<{
    time: Date;
    bloodPressure: string;
    pulse: number;
    temperature: number;
    reactions?: string;
    recordedBy: string;
  }>;
  
  postTransfusion?: {
    bloodPressure: string;
    pulse: number;
    temperature: number;
    outcome: 'successful' | 'adverse-reaction' | 'discontinued';
    reactions?: string;
    recordedBy: string;
  };
  
  status: 'in-progress' | 'completed' | 'discontinued';
  administeredBy: string;
  notes?: string;
}
