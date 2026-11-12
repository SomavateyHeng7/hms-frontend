import { Appointment } from "./patient";

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  department: string;
  licenseNumber: string;
  email: string;
  phone: string;
  schedule: DoctorSchedule;
  isAvailable: boolean;
  consultationFee: number;
  experience: number; // years
  qualifications: string[];
  telemedicineEnabled: boolean;
}

export interface DoctorSchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  slotDuration: number; // minutes
  maxAppointments: number;
  appointmentType?: 'consultation' | 'surgery' | 'emergency' | 'telemedicine';
}

export interface Department {
  id: string;
  name: string;
  description: string;
  headOfDepartment: string;
  location: string;
  contactNumber: string;
  email: string;
  operatingHours: {
    weekdays: TimeSlot;
    weekends: TimeSlot;
  };
  emergencyAvailable: boolean;
  telemedicineAvailable: boolean;
  services: string[];
}

export interface AppointmentSlot {
  id: string;
  doctorId: string;
  departmentId: string;
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  appointmentType: 'consultation' | 'follow-up' | 'surgery' | 'test' | 'emergency' | 'telemedicine';
  maxAppointments: number;
  currentAppointments: number;
  consultationFee: number;
}

export interface EmergencyQueue {
  id: string;
  patientId: string;
  patientName: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  triageNotes: string;
  arrivalTime: Date;
  estimatedWaitTime: number; // minutes
  status: 'waiting' | 'in-progress' | 'completed' | 'transferred';
  assignedDoctor?: string;
  department: string;
}

export interface Reminder {
  id: string;
  appointmentId: string;
  patientId: string;
  type: 'sms' | 'email' | 'push';
  scheduledTime: Date;
  status: 'pending' | 'sent' | 'failed';
  message: string;
  retryCount: number;
}

export interface TelemedicineSession {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  sessionUrl: string;
  sessionToken: string;
  scheduledStart: Date;
  actualStart?: Date;
  actualEnd?: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  recordingEnabled: boolean;
  recordingUrl?: string;
  chatEnabled: boolean;
  screenSharingEnabled: boolean;
  prescriptionsIssued: string[];
  followUpRequired: boolean;
}

export interface SchedulingRule {
  id: string;
  name: string;
  description: string;
  type: 'booking_window' | 'cancellation_policy' | 'rescheduling_policy' | 'emergency_override';
  isActive: boolean;
  conditions: Record<string, any>;
  actions: Record<string, any>;
}

// Extended Appointment interface for scheduling system
export interface SchedulingAppointment extends Appointment {
  slotId: string;
  consultationFee: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  remindersSent: string[];
  telemedicineSessionId?: string;
  isTelemedicine: boolean;
  cancellationReason?: string;
  rescheduledFrom?: string;
  rescheduledTo?: string;
  waitingListPosition?: number;
  priorityScore: number;
}