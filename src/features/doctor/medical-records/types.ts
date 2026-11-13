export interface MedicalRecord {
  id: string;
  recordNumber: string;
  patientId: string;
  patientName: string;
  
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  
  // Medical History
  allergies: Array<{
    allergen: string;
    reaction: string;
    severity: 'mild' | 'moderate' | 'severe';
    dateIdentified: Date;
  }>;
  
  chronicConditions: Array<{
    condition: string;
    diagnosedDate: Date;
    status: 'active' | 'resolved' | 'managed';
    notes?: string;
  }>;
  
  surgicalHistory: Array<{
    procedure: string;
    date: Date;
    hospital: string;
    surgeon?: string;
    complications?: string;
    notes?: string;
  }>;
  
  familyHistory: Array<{
    relation: string;
    condition: string;
    ageOfOnset?: number;
    notes?: string;
  }>;
  
  socialHistory: {
    smokingStatus?: 'never' | 'former' | 'current';
    alcoholConsumption?: 'never' | 'occasional' | 'moderate' | 'heavy';
    occupation?: string;
    maritalStatus?: string;
    livingArrangement?: string;
  };
  
  currentMedications: Array<{
    medicationName: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate?: Date;
    prescribedBy: string;
    indication: string;
  }>;
  
  immunizations: Array<{
    vaccine: string;
    dateAdministered: Date;
    nextDue?: Date;
    administeredBy?: string;
    batchNumber?: string;
    site?: string;
  }>;
  
  lastUpdated: Date;
  lastUpdatedBy: string;
}

export interface ClinicalVisit {
  id: string;
  visitNumber: string;
  patientId: string;
  patientName: string;
  
  visitDate: Date;
  visitType: 'opd' | 'ipd' | 'emergency' | 'follow-up' | 'telemedicine';
  
  department: string;
  doctorId: string;
  doctorName: string;
  
  chiefComplaint: string;
  historyOfPresentIllness: string;
  
  vitalSigns: {
    temperature: number;
    bloodPressure: string;
    heartRate: number;
    respiratoryRate: number;
    oxygenSaturation: number;
    weight?: number;
    height?: number;
    bmi?: number;
  };
  
  physicalExamination: string;
  systemicExamination?: string;
  
  provisionalDiagnosis: string;
  finalDiagnosis?: string;
  
  investigations: Array<{
    test: string;
    orderedDate: Date;
    result?: string;
    resultDate?: Date;
    abnormal: boolean;
  }>;
  
  prescription: Array<{
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  
  advice: string;
  followUpDate?: Date;
  followUpInstructions?: string;
  
  referrals?: Array<{
    specialization: string;
    doctorName?: string;
    reason: string;
    urgent: boolean;
  }>;
  
  notes?: string;
  
  createdAt: Date;
  createdBy: string;
}

export interface MedicalDocument {
  id: string;
  documentNumber: string;
  patientId: string;
  patientName: string;
  
  documentType: 'lab-report' | 'radiology-report' | 'prescription' | 'discharge-summary' | 'medical-certificate' | 'consent-form' | 'referral-letter' | 'insurance-form' | 'other';
  
  title: string;
  description?: string;
  
  relatedVisitId?: string;
  relatedAdmissionId?: string;
  
  uploadedDate: Date;
  uploadedBy: string;
  
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  
  tags: string[];
  category: string;
  
  isVerified: boolean;
  verifiedBy?: string;
  verifiedDate?: Date;
  
  isConfidential: boolean;
  accessLevel: 'public' | 'restricted' | 'confidential';
  
  expiryDate?: Date;
  
  notes?: string;
}

export interface MedicalCertificate {
  id: string;
  certificateNumber: string;
  patientId: string;
  patientName: string;
  
  certificateType: 'sick-leave' | 'fitness' | 'disability' | 'death' | 'birth' | 'vaccination' | 'medical-examination' | 'other';
  
  issueDate: Date;
  validFrom?: Date;
  validTo?: Date;
  
  issuedBy: string;
  issuedByDesignation: string;
  
  diagnosis?: string;
  purpose: string;
  
  recommendations?: string;
  restrictions?: string;
  
  leaveDays?: number;
  
  certificateText: string;
  
  isVerified: boolean;
  verificationCode?: string;
  
  relatedVisitId?: string;
  
  status: 'active' | 'expired' | 'cancelled';
  
  notes?: string;
}

export interface DischargeSummary {
  id: string;
  summaryNumber: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  
  admissionDate: Date;
  dischargeDate: Date;
  lengthOfStay: number; // days
  
  admittingDepartment: string;
  dischargedFrom: string;
  
  admittingDoctorName: string;
  dischargingDoctorName: string;
  consultants: string[];
  
  reasonForAdmission: string;
  chiefComplaints: string;
  
  historyOfPresentIllness: string;
  pastMedicalHistory?: string;
  
  clinicalFindings: string;
  
  investigationsPerformed: Array<{
    investigation: string;
    date: Date;
    result: string;
  }>;
  
  diagnosis: {
    primary: string;
    secondary: string[];
  };
  
  treatmentGiven: string;
  proceduresPerformed: Array<{
    procedure: string;
    date: Date;
    surgeon?: string;
  }>;
  
  courseInHospital: string;
  complications?: string;
  
  conditionAtDischarge: 'improved' | 'same' | 'worse' | 'deceased';
  
  dischargeMedications: Array<{
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  
  dietaryInstructions?: string;
  activityRestrictions?: string;
  
  followUpInstructions: string;
  followUpDate?: Date;
  followUpWith?: string;
  
  warningSignsToWatch: string[];
  
  medicalCertificateIssued: boolean;
  certificateId?: string;
  
  preparedBy: string;
  preparedDate: Date;
  
  approvedBy?: string;
  approvedDate?: Date;
  
  deliveredTo?: string;
  deliveredDate?: Date;
}

export interface ConsentForm {
  id: string;
  formNumber: string;
  patientId: string;
  patientName: string;
  
  consentType: 'surgery' | 'procedure' | 'anesthesia' | 'blood-transfusion' | 'research' | 'photography' | 'general-treatment' | 'other';
  
  procedureName: string;
  procedureDescription: string;
  
  risks: string[];
  benefits: string[];
  alternatives: string[];
  
  explainedBy: string;
  explainedByDesignation: string;
  explainedDate: Date;
  
  patientUnderstands: boolean;
  questionsAnswered: boolean;
  
  consentGivenBy: 'patient' | 'guardian' | 'legal-representative';
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  
  witnessName: string;
  witnessSignature?: string;
  
  patientSignature?: string;
  guardianSignature?: string;
  
  signedDate: Date;
  
  withdrawnDate?: Date;
  withdrawnReason?: string;
  
  relatedProcedureId?: string;
  
  status: 'pending' | 'signed' | 'withdrawn' | 'expired';
  
  notes?: string;
}

export interface ReferralLetter {
  id: string;
  referralNumber: string;
  patientId: string;
  patientName: string;
  
  referringDoctorId: string;
  referringDoctorName: string;
  referringDepartment: string;
  referringHospital: string;
  
  referredTo: string;
  referredDepartment: string;
  referredSpecialization: string;
  referredHospital?: string;
  
  referralDate: Date;
  urgency: 'emergency' | 'urgent' | 'routine';
  
  reasonForReferral: string;
  clinicalSummary: string;
  
  relevantInvestigations: string;
  currentTreatment: string;
  
  provisionalDiagnosis: string;
  
  questionToBeAnswered?: string;
  adviceSought?: string;
  
  patientInformed: boolean;
  appointmentBooked: boolean;
  appointmentDate?: Date;
  
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  
  response?: string;
  respondedBy?: string;
  respondedDate?: Date;
  
  notes?: string;
}
