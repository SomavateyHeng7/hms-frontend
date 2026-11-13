export interface EmergencyCase {
  id: string;
  caseNumber: string;
  patientId?: string;
  patientName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  
  arrivalTime: Date;
  arrivalMode: 'walk-in' | 'ambulance' | 'police' | 'referral' | 'other';
  ambulanceNumber?: string;
  
  chiefComplaint: string;
  presentingSymptoms: string[];
  triageCategory: 'resuscitation' | 'emergent' | 'urgent' | 'semi-urgent' | 'non-urgent';
  triageScore: number;
  
  vitalSigns: {
    temperature: number;
    bloodPressure: string;
    heartRate: number;
    respiratoryRate: number;
    oxygenSaturation: number;
    consciousness: 'alert' | 'verbal' | 'pain' | 'unresponsive';
  };
  
  initialAssessment: string;
  provisionalDiagnosis?: string;
  
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  assignedNurseId?: string;
  assignedNurseName?: string;
  
  status: 'waiting' | 'in-treatment' | 'observation' | 'admitted' | 'discharged' | 'referred' | 'deceased' | 'left-ama';
  
  bedId?: string;
  bedNumber?: string;
  
  investigations: string[];
  treatments: string[];
  medications: Array<{
    name: string;
    dosage: string;
    route: string;
    time: Date;
  }>;
  
  disposition?: 'admitted' | 'discharged' | 'transferred' | 'referred' | 'ama' | 'deceased';
  admittedToWard?: string;
  dischargeTime?: Date;
  followUpRequired: boolean;
  followUpInstructions?: string;
  
  totalTimeInER?: number; // minutes
  waitingTime?: number; // minutes
  treatmentTime?: number; // minutes
  
  notes?: string;
  createdBy: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: Date;
}

export interface ERBed {
  id: string;
  bedNumber: string;
  location: string;
  bedType: 'resuscitation' | 'critical' | 'observation' | 'isolation' | 'general';
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  currentPatientId?: string;
  currentPatientName?: string;
  occupiedSince?: Date;
  equipment: string[];
  lastCleaned?: Date;
}

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  type: 'basic' | 'advanced' | 'air-ambulance' | 'neonatal' | 'bariatric';
  status: 'available' | 'on-call' | 'en-route' | 'at-scene' | 'transporting' | 'at-hospital' | 'maintenance' | 'out-of-service';
  
  equipment: string[];
  capacity: number;
  
  currentLocation?: string;
  destination?: string;
  
  crew: Array<{
    staffId: string;
    name: string;
    role: 'driver' | 'paramedic' | 'emt' | 'nurse' | 'doctor';
  }>;
  
  currentTrip?: {
    tripId: string;
    patientName: string;
    pickupLocation: string;
    pickupTime: Date;
    dropLocation: string;
    estimatedArrival?: Date;
    priority: 'emergency' | 'urgent' | 'routine';
  };
  
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  mileage: number;
  fuelLevel?: number;
  
  isActive: boolean;
  notes?: string;
}

export interface AmbulanceTrip {
  id: string;
  tripNumber: string;
  ambulanceId: string;
  ambulanceNumber: string;
  
  requestTime: Date;
  dispatchTime?: Date;
  arrivalAtSceneTime?: Date;
  departureFromSceneTime?: Date;
  arrivalAtHospitalTime?: Date;
  tripCompletedTime?: Date;
  
  priority: 'emergency' | 'urgent' | 'routine' | 'non-emergency';
  
  patientName: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  
  pickupLocation: string;
  pickupAddress: string;
  pickupCoordinates?: {
    latitude: number;
    longitude: number;
  };
  
  dropLocation: string;
  dropAddress: string;
  
  chiefComplaint?: string;
  vitalSigns?: {
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    oxygenSaturation?: number;
  };
  
  treatmentProvided?: string[];
  
  crew: Array<{
    staffId: string;
    name: string;
    role: string;
  }>;
  
  distance?: number; // km
  duration?: number; // minutes
  
  status: 'requested' | 'dispatched' | 'en-route-to-scene' | 'at-scene' | 'transporting' | 'arrived' | 'completed' | 'cancelled';
  
  requestedBy: string;
  cancellationReason?: string;
  notes?: string;
}

export interface ERShift {
  id: string;
  date: Date;
  shiftType: 'morning' | 'afternoon' | 'night';
  startTime: string;
  endTime: string;
  
  staff: Array<{
    staffId: string;
    name: string;
    role: 'doctor' | 'nurse' | 'paramedic' | 'technician' | 'receptionist';
    isInCharge: boolean;
  }>;
  
  totalCases: number;
  criticalCases: number;
  admissions: number;
  discharges: number;
  deaths: number;
  
  notes?: string;
}

export interface ERDashboardStats {
  date: Date;
  totalCases: number;
  currentlyInER: number;
  waiting: number;
  inTreatment: number;
  inObservation: number;
  
  triageCounts: {
    resuscitation: number;
    emergent: number;
    urgent: number;
    semiUrgent: number;
    nonUrgent: number;
  };
  
  averageWaitTime: number; // minutes
  averageTreatmentTime: number; // minutes
  averageTotalTime: number; // minutes
  
  admissions: number;
  discharges: number;
  transfers: number;
  deaths: number;
  ama: number; // Against Medical Advice
  
  bedOccupancy: {
    total: number;
    occupied: number;
    available: number;
    occupancyRate: number;
  };
  
  ambulanceActivity: {
    totalTrips: number;
    activeTrips: number;
    completedTrips: number;
    availableAmbulances: number;
  };
}
