import { z } from 'zod';

export const staffSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  alternatePhone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits').optional().or(z.literal('')),
  dateOfBirth: z.date(),
  gender: z.enum(['male', 'female', 'other']),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().regex(/^[0-9]{6}$/, 'Postal code must be 6 digits'),
  nationality: z.string().min(2, 'Nationality is required'),
  
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  role: z.enum(['doctor', 'nurse', 'technician', 'admin', 'support', 'management']),
  specialization: z.string().optional(),
  qualification: z.string().min(1, 'Qualification is required'),
  experience: z.number().min(0, 'Experience must be positive'),
  joiningDate: z.date(),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'consultant']),
  
  licenseNumber: z.string().optional(),
  licenseExpiryDate: z.date().optional(),
  certifications: z.array(z.string()).default([]),
  
  shiftType: z.enum(['morning', 'afternoon', 'night', 'rotating', 'flexible']),
  workingHoursPerWeek: z.number().min(1).max(168, 'Working hours must be between 1 and 168'),
  
  salary: z.number().min(0, 'Salary must be positive'),
  salaryGrade: z.string().optional(),
  
  emergencyContact: z.object({
    name: z.string().min(2, 'Emergency contact name is required'),
    relationship: z.string().min(2, 'Relationship is required'),
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  }),
  
  notes: z.string().optional(),
});

export const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  code: z.string().min(2, 'Department code is required').max(10, 'Code must be at most 10 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['medical', 'surgical', 'diagnostic', 'support', 'administrative']),
  floor: z.string().min(1, 'Floor is required'),
  extension: z.string().optional(),
  operatingHours: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  }),
});

export const shiftSchema = z.object({
  name: z.string().min(2, 'Shift name is required'),
  type: z.enum(['morning', 'afternoon', 'night', 'general']),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  duration: z.number().min(1).max(24, 'Duration must be between 1 and 24 hours'),
  breakTime: z.number().min(0).max(240, 'Break time must be between 0 and 240 minutes'),
  department: z.string().optional(),
  requiredStaff: z.number().min(1, 'At least 1 staff member is required'),
});

export const staffScheduleSchema = z.object({
  staffId: z.string().min(1, 'Staff member is required'),
  date: z.date(),
  shiftId: z.string().min(1, 'Shift is required'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const attendanceSchema = z.object({
  staffId: z.string().min(1, 'Staff member is required'),
  date: z.date(),
  checkInTime: z.date().optional(),
  checkOutTime: z.date().optional(),
  status: z.enum(['present', 'absent', 'late', 'half-day', 'on-leave']),
  notes: z.string().optional(),
});

export const leaveSchema = z.object({
  staffId: z.string().min(1, 'Staff member is required'),
  leaveType: z.enum(['sick', 'casual', 'earned', 'maternity', 'paternity', 'unpaid', 'compensatory']),
  startDate: z.date(),
  endDate: z.date(),
  halfDay: z.boolean().default(false),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  supportingDocument: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const trainingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  trainingType: z.enum(['orientation', 'skill-development', 'certification', 'safety', 'compliance']),
  instructor: z.string().min(2, 'Instructor name is required'),
  startDate: z.date(),
  endDate: z.date(),
  duration: z.number().min(0.5, 'Duration must be at least 0.5 hours'),
  venue: z.string().min(2, 'Venue is required'),
  maxParticipants: z.number().min(1, 'At least 1 participant is required'),
  department: z.string().optional(),
  isMandatory: z.boolean().default(false),
  materials: z.array(z.string()).default([]),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const performanceSchema = z.object({
  staffId: z.string().min(1, 'Staff member is required'),
  reviewPeriod: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }),
  reviewDate: z.date(),
  overallRating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  categories: z.array(z.object({
    name: z.string(),
    rating: z.number().min(1).max(5),
    comments: z.string(),
  })).min(1, 'At least one category is required'),
  strengths: z.array(z.string()).default([]),
  areasOfImprovement: z.array(z.string()).default([]),
  goals: z.array(z.object({
    description: z.string(),
    targetDate: z.date(),
    status: z.enum(['pending', 'in-progress', 'completed']),
  })).default([]),
  comments: z.string().min(20, 'Comments must be at least 20 characters'),
});

export const payrollSchema = z.object({
  staffId: z.string().min(1, 'Staff member is required'),
  month: z.number().min(1).max(12, 'Month must be between 1 and 12'),
  year: z.number().min(2020).max(2100, 'Invalid year'),
  basicSalary: z.number().min(0, 'Basic salary must be positive'),
  allowances: z.object({
    hra: z.number().min(0).default(0),
    medical: z.number().min(0).default(0),
    transport: z.number().min(0).default(0),
    other: z.number().min(0).default(0),
  }),
  deductions: z.object({
    tax: z.number().min(0).default(0),
    insurance: z.number().min(0).default(0),
    providentFund: z.number().min(0).default(0),
    other: z.number().min(0).default(0),
  }),
  overtime: z.number().min(0).default(0),
  bonus: z.number().min(0).default(0),
  workingDays: z.number().min(0).max(31),
  presentDays: z.number().min(0).max(31),
  leaveDays: z.number().min(0).max(31),
  paymentMethod: z.enum(['bank-transfer', 'cheque', 'cash']),
});
