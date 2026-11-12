export interface QueueToken {
  id: string;
  tokenNumber: string;
  displayNumber: string; // e.g., "A001", "B025"
  
  patientId?: string;
  patientName: string;
  patientPhone: string;
  
  department: string;
  service: string;
  serviceType: 'opd' | 'laboratory' | 'radiology' | 'pharmacy' | 'billing' | 'registration' | 'other';
  
  priority: 'normal' | 'senior-citizen' | 'disabled' | 'pregnant' | 'emergency' | 'vip';
  
  issueTime: Date;
  calledTime?: Date;
  serviceStartTime?: Date;
  serviceEndTime?: Date;
  
  status: 'waiting' | 'called' | 'in-service' | 'completed' | 'cancelled' | 'no-show' | 'transferred';
  
  counterNumber?: string;
  servedBy?: string;
  
  estimatedWaitTime?: number; // minutes
  actualWaitTime?: number; // minutes
  serviceTime?: number; // minutes
  
  appointmentId?: string;
  notes?: string;
}

export interface QueueCounter {
  id: string;
  counterNumber: string;
  counterName: string;
  department: string;
  services: string[];
  
  status: 'active' | 'inactive' | 'break' | 'closed';
  
  currentTokenId?: string;
  currentTokenNumber?: string;
  currentPatientName?: string;
  
  staffId?: string;
  staffName?: string;
  
  location: string;
  
  tokensServedToday: number;
  averageServiceTime: number; // minutes
  
  isActive: boolean;
}

export interface QueueDisplay {
  id: string;
  displayName: string;
  location: string;
  department?: string;
  
  currentlyServing: Array<{
    tokenNumber: string;
    counterNumber: string;
    patientName?: string;
  }>;
  
  lastCalled: Array<{
    tokenNumber: string;
    counterNumber: string;
    calledTime: Date;
  }>;
  
  waitingCount: number;
  averageWaitTime: number;
  
  announcements: Array<{
    message: string;
    priority: 'info' | 'warning' | 'urgent';
    timestamp: Date;
  }>;
  
  isActive: boolean;
}

export interface QueueSettings {
  id: string;
  department: string;
  
  tokenPrefix: string; // e.g., "A", "B", "LAB"
  tokenFormat: string; // e.g., "A###", "LAB-###"
  
  startNumber: number;
  resetDaily: boolean;
  resetTime?: string;
  
  enablePriority: boolean;
  enableAppointments: boolean;
  
  estimatedServiceTime: number; // minutes per token
  maxTokensPerCounter: number;
  
  workingHours: {
    start: string;
    end: string;
  };
  
  breaks: Array<{
    name: string;
    start: string;
    end: string;
  }>;
  
  autoCallNext: boolean;
  callNotificationSound: boolean;
  
  displaySettings: {
    showPatientName: boolean;
    showWaitTime: boolean;
    showCounterStatus: boolean;
  };
}

export interface QueueStats {
  date: Date;
  department: string;
  
  totalTokensIssued: number;
  tokensServed: number;
  tokensCancelled: number;
  tokensNoShow: number;
  
  averageWaitTime: number; // minutes
  maxWaitTime: number; // minutes
  minWaitTime: number; // minutes
  
  averageServiceTime: number; // minutes
  maxServiceTime: number; // minutes
  minServiceTime: number; // minutes
  
  peakHour: string;
  peakHourTokens: number;
  
  countersActive: number;
  totalCounters: number;
  
  patientSatisfactionScore?: number;
  
  hourlyBreakdown: Array<{
    hour: string;
    tokensIssued: number;
    tokensServed: number;
    averageWaitTime: number;
  }>;
}

export interface QueueTransfer {
  id: string;
  tokenId: string;
  tokenNumber: string;
  
  fromDepartment: string;
  fromCounter?: string;
  
  toDepartment: string;
  toCounter?: string;
  
  reason: string;
  transferTime: Date;
  transferredBy: string;
  
  status: 'pending' | 'accepted' | 'rejected';
  acceptedBy?: string;
  acceptedTime?: Date;
}

export interface QueueAppointment {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  
  department: string;
  service: string;
  
  appointmentTime: Date;
  appointmentSlot: string;
  
  tokenGenerated: boolean;
  tokenId?: string;
  tokenNumber?: string;
  
  checkInTime?: Date;
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
}

export interface QueueFeedback {
  id: string;
  tokenId: string;
  tokenNumber: string;
  
  patientName?: string;
  department: string;
  counterNumber?: string;
  
  rating: number; // 1-5
  waitTimeRating?: number;
  serviceQualityRating?: number;
  staffBehaviorRating?: number;
  
  feedback?: string;
  complaints?: string;
  suggestions?: string;
  
  submittedAt: Date;
  
  followUpRequired: boolean;
  followUpNotes?: string;
}
