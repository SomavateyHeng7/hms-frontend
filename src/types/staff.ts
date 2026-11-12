export interface Staff {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address: string;
  city: string;
  state: string;
  postalCode: string;
  nationality: string;
  
  // Employment Details
  department: string;
  position: string;
  role: 'doctor' | 'nurse' | 'technician' | 'admin' | 'support' | 'management';
  specialization?: string;
  qualification: string;
  experience: number; // years
  joiningDate: Date;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'consultant';
  employmentStatus: 'active' | 'on-leave' | 'suspended' | 'terminated';
  
  // Professional Details
  licenseNumber?: string;
  licenseExpiryDate?: Date;
  certifications: string[];
  
  // Work Schedule
  shiftType: 'morning' | 'afternoon' | 'night' | 'rotating' | 'flexible';
  workingHoursPerWeek: number;
  
  // Financial
  salary: number;
  salaryGrade?: string;
  bankAccount?: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  
  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  
  // System
  userId?: string;
  permissions: string[];
  isActive: boolean;
  profilePhoto?: string;
  notes?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headOfDepartmentId?: string;
  headOfDepartmentName?: string;
  category: 'medical' | 'surgical' | 'diagnostic' | 'support' | 'administrative';
  floor: string;
  extension?: string;
  totalStaff: number;
  operatingHours: {
    start: string;
    end: string;
  };
  isActive: boolean;
}

export interface Shift {
  id: string;
  name: string;
  type: 'morning' | 'afternoon' | 'night' | 'general';
  startTime: string;
  endTime: string;
  duration: number; // hours
  breakTime: number; // minutes
  department?: string;
  requiredStaff: number;
  isActive: boolean;
}

export interface StaffSchedule {
  id: string;
  staffId: string;
  staffName: string;
  date: Date;
  shiftId: string;
  shiftName: string;
  shiftType: 'morning' | 'afternoon' | 'night' | 'general';
  startTime: string;
  endTime: string;
  department: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  location?: string;
  assignedBy: string;
  notes?: string;
}

export interface Attendance {
  id: string;
  staffId: string;
  staffName: string;
  date: Date;
  scheduleId?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
  totalHours?: number;
  overtimeHours?: number;
  lateBy?: number; // minutes
  earlyLeaveBy?: number; // minutes
  location?: string;
  notes?: string;
  approvedBy?: string;
}

export interface Leave {
  id: string;
  leaveId: string;
  staffId: string;
  staffName: string;
  department: string;
  leaveType: 'sick' | 'casual' | 'earned' | 'maternity' | 'paternity' | 'unpaid' | 'compensatory';
  startDate: Date;
  endDate: Date;
  totalDays: number;
  halfDay: boolean;
  reason: string;
  supportingDocument?: string;
  appliedDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reviewedBy?: string;
  reviewedDate?: Date;
  reviewComments?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

export interface LeaveBalance {
  staffId: string;
  year: number;
  casual: {
    allocated: number;
    used: number;
    balance: number;
  };
  sick: {
    allocated: number;
    used: number;
    balance: number;
  };
  earned: {
    allocated: number;
    used: number;
    balance: number;
  };
  compensatory: {
    allocated: number;
    used: number;
    balance: number;
  };
}

export interface Training {
  id: string;
  title: string;
  description: string;
  trainingType: 'orientation' | 'skill-development' | 'certification' | 'safety' | 'compliance';
  instructor: string;
  startDate: Date;
  endDate: Date;
  duration: number; // hours
  venue: string;
  maxParticipants: number;
  department?: string;
  isMandatory: boolean;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  materials?: string[];
}

export interface TrainingAttendance {
  id: string;
  trainingId: string;
  staffId: string;
  staffName: string;
  department: string;
  attendanceStatus: 'registered' | 'attended' | 'absent' | 'cancelled';
  completionStatus: 'incomplete' | 'completed' | 'failed';
  score?: number;
  certificateIssued: boolean;
  certificateNumber?: string;
  feedback?: string;
  rating?: number;
}

export interface Performance {
  id: string;
  staffId: string;
  staffName: string;
  reviewPeriod: {
    startDate: Date;
    endDate: Date;
  };
  reviewDate: Date;
  reviewedBy: string;
  reviewerName: string;
  overallRating: number; // 1-5
  categories: Array<{
    name: string;
    rating: number;
    comments: string;
  }>;
  strengths: string[];
  areasOfImprovement: string[];
  goals: Array<{
    description: string;
    targetDate: Date;
    status: 'pending' | 'in-progress' | 'completed';
  }>;
  comments: string;
  status: 'draft' | 'submitted' | 'acknowledged';
  acknowledgedDate?: Date;
  staffComments?: string;
}

export interface Payroll {
  id: string;
  staffId: string;
  staffName: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: {
    hra: number;
    medical: number;
    transport: number;
    other: number;
  };
  deductions: {
    tax: number;
    insurance: number;
    providentFund: number;
    other: number;
  };
  overtime: number;
  bonus: number;
  grossSalary: number;
  netSalary: number;
  workingDays: number;
  presentDays: number;
  leaveDays: number;
  paymentDate?: Date;
  paymentMethod: 'bank-transfer' | 'cheque' | 'cash';
  status: 'pending' | 'processed' | 'paid';
  generatedBy: string;
  generatedDate: Date;
}
