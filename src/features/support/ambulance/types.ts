export type AmbulanceType = 'basic' | 'advanced' | 'air-ambulance' | 'neonatal' | 'bariatric' | 'mobile-icu';
export type AmbulanceStatus = 'available' | 'on-call' | 'en-route-to-pickup' | 'at-scene' | 'transporting' | 'at-destination' | 'returning' | 'maintenance' | 'out-of-service';
export type TripPriority = 'emergency' | 'urgent' | 'routine' | 'transfer';
export type TripStatus = 'scheduled' | 'dispatched' | 'en-route' | 'on-scene' | 'transporting' | 'completed' | 'cancelled';

export interface AmbulanceVehicle {
  id: string;
  vehicleNumber: string;
  registrationNumber: string;
  
  type: AmbulanceType;
  status: AmbulanceStatus;
  
  manufacturer: string;
  model: string;
  yearOfManufacture: number;
  
  capacity: number; // passenger capacity
  stretcherCapacity: number;
  
  baseStation: string;
  currentLocation?: {
    address: string;
    latitude?: number;
    longitude?: number;
    lastUpdated: Date;
  };
  
  equipment: Array<{
    name: string;
    quantity: number;
    status: 'functional' | 'maintenance' | 'missing';
    lastChecked: Date;
  }>;
  
  // Crew assignment
  crew?: Array<{
    staffId: string;
    name: string;
    role: 'driver' | 'paramedic' | 'emt' | 'nurse' | 'doctor';
    contactNumber: string;
  }>;
  
  // Maintenance
  maintenance: {
    lastService: Date;
    nextService: Date;
    mileage: number;
    insuranceExpiry: Date;
    fitnessExpiry: Date;
    pollutionExpiry: Date;
  };
  
  fuelLevel?: number; // percentage
  
  isActive: boolean;
  notes?: string;
}

export interface AmbulanceTrip {
  id: string;
  tripNumber: string;
  
  ambulanceId: string;
  vehicleNumber: string;
  ambulanceType: AmbulanceType;
  
  priority: TripPriority;
  status: TripStatus;
  
  // Request details
  requestedBy: string;
  requestTime: Date;
  requestSource: 'emergency-call' | 'hospital' | 'clinic' | 'police' | 'public';
  callerName?: string;
  callerContact?: string;
  
  // Patient details
  patientName?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  chiefComplaint: string;
  medicalHistory?: string;
  
  // Trip details
  pickupLocation: {
    address: string;
    landmark?: string;
    contactPerson?: string;
    contactNumber?: string;
    latitude?: number;
    longitude?: number;
  };
  
  destination: {
    facilityName: string;
    address: string;
    department?: string;
    contactNumber: string;
    latitude?: number;
    longitude?: number;
  };
  
  // Timeline
  dispatchTime?: Date;
  departureTime?: Date;
  arrivalAtSceneTime?: Date;
  departureFromSceneTime?: Date;
  arrivalAtDestinationTime?: Date;
  completionTime?: Date;
  
  // Distance and duration
  estimatedDistance?: number; // in km
  actualDistance?: number;
  estimatedDuration?: number; // in minutes
  actualDuration?: number;
  
  // Crew
  crew: Array<{
    staffId: string;
    name: string;
    role: 'driver' | 'paramedic' | 'emt' | 'nurse' | 'doctor';
  }>;
  
  // Patient care during transport
  vitalsDuringTransport?: Array<{
    time: Date;
    bloodPressure?: string;
    pulse?: number;
    temperature?: number;
    spo2?: number;
    respiratoryRate?: number;
    gcs?: number;
    recordedBy: string;
  }>;
  
  treatmentProvided?: string[];
  medicationsAdministered?: Array<{
    medication: string;
    dose: string;
    route: string;
    time: Date;
  }>;
  
  // Handover
  handoverDetails?: {
    receivedBy: string;
    designation: string;
    department: string;
    time: Date;
    patientCondition: string;
    notes?: string;
  };
  
  // Billing
  baseFare: number;
  distanceCharges: number;
  additionalCharges?: number;
  totalCharges: number;
  paymentStatus: 'pending' | 'paid' | 'waived';
  
  cancelReason?: string;
  
  notes?: string;
  createdBy: string;
}

export interface AmbulanceRequest {
  id: string;
  requestNumber: string;
  
  requestTime: Date;
  requestedBy: string;
  requestSource: 'emergency-call' | 'hospital' | 'clinic' | 'police' | 'public';
  
  priority: TripPriority;
  status: 'pending' | 'assigned' | 'dispatched' | 'completed' | 'cancelled';
  
  callerDetails: {
    name: string;
    contactNumber: string;
    relationship?: string;
  };
  
  patientInfo: {
    name?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    chiefComplaint: string;
    consciousnessLevel?: 'alert' | 'drowsy' | 'unconscious';
    breathing?: 'normal' | 'difficulty' | 'absent';
    bleeding?: 'none' | 'minor' | 'major';
  };
  
  pickupAddress: string;
  pickupLandmark?: string;
  destinationAddress: string;
  
  assignedAmbulanceId?: string;
  dispatchTime?: Date;
  
  estimatedArrival?: Date;
  
  specialRequirements?: string[];
  notes?: string;
}

export interface DispatchCenter {
  id: string;
  name: string;
  location: string;
  
  totalAmbulances: number;
  availableAmbulances: number;
  onDutyAmbulances: number;
  
  operators: Array<{
    staffId: string;
    name: string;
    shift: string;
    contactNumber: string;
  }>;
  
  coverageArea: string[];
  emergencyNumber: string;
  
  isActive: boolean;
}

export interface AmbulanceStats {
  totalVehicles: number;
  availableVehicles: number;
  onDutyVehicles: number;
  maintenanceVehicles: number;
  
  tripsToday: number;
  emergencyTripsToday: number;
  averageResponseTime: number; // in minutes
  
  pendingRequests: number;
  activeTrips: number;
  completedTripsToday: number;
  
  revenue: {
    today: number;
    thisMonth: number;
    pending: number;
  };
}

export interface CrewMember {
  id: string;
  staffId: string;
  name: string;
  
  role: 'driver' | 'paramedic' | 'emt' | 'nurse' | 'doctor';
  licenseNumber?: string;
  licenseExpiry?: Date;
  
  certifications: Array<{
    name: string;
    issuedDate: Date;
    expiryDate?: Date;
  }>;
  
  currentShift?: {
    shiftId: string;
    startTime: Date;
    endTime: Date;
    assignedAmbulanceId?: string;
  };
  
  contactNumber: string;
  emergencyContact: string;
  
  totalTrips: number;
  rating?: number;
  
  isActive: boolean;
}
