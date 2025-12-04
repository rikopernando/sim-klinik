/**
 * Emergency Module Type Definitions
 * Centralized types for the Emergency/ER module
 */

/**
 * Triage Status Types
 */
export type TriageStatus = "red" | "yellow" | "green"

export const TRIAGE_LEVELS = {
  RED: "red" as TriageStatus,
  YELLOW: "yellow" as TriageStatus,
  GREEN: "green" as TriageStatus,
} as const

/**
 * Disposition Types (Patient outcome from ER)
 */
export type DispositionType = "discharged" | "admitted" | "referred" | "observation"

export const DISPOSITION_TYPES = {
  DISCHARGED: "discharged" as DispositionType,
  ADMITTED: "admitted" as DispositionType,
  REFERRED: "referred" as DispositionType,
  OBSERVATION: "observation" as DispositionType,
} as const

/**
 * Visit Status Types
 */
export type VisitStatus = "pending" | "in_progress" | "completed" | "cancelled"

/**
 * Quick Registration Data
 */
export interface QuickRegistrationData {
  name: string
  chiefComplaint: string
  triageStatus: TriageStatus
  nik?: string
  phone?: string
  gender?: "male" | "female"
  notes?: string
}

/**
 * Complete Registration Data
 */
export interface CompleteRegistrationData {
  patientId: string
  nik: string
  address: string
  birthDate: string
  gender: "male" | "female"
  phone?: string
  insuranceType: "bpjs" | "insurance" | "general"
  insuranceNumber?: string
}

/**
 * ER Medical Record Data
 */
export interface ERMedicalRecordData {
  visitId: string
  briefHistory: string
  vitalSigns: {
    temperature?: string
    bloodPressure?: string
    pulse?: string
    respiration?: string
    oxygenSaturation?: string
    consciousness?: string
  }
  physicalExam: string
  emergencyActions: string
  workingDiagnosis: string
  disposition: DispositionType
  instructions?: string
  notes?: string
}

/**
 * Handover Data
 */
export interface HandoverData {
  visitId: string
  newVisitType: "outpatient" | "inpatient"
  poliId?: number
  roomId?: number
  doctorId?: string
  notes?: string
}

/**
 * Patient Entity
 */
export interface Patient {
  id: string
  name: string
  mrNumber: string
  nik: string | null
  gender: "male" | "female" | null
  birthDate: string | null
  phone: string | null
  address: string | null
  insuranceType: string
  insuranceNumber: string | null
}

/**
 * Visit Entity
 */
export interface Visit {
  id: string
  visitNumber: string
  visitType: string
  triageStatus: TriageStatus | null
  chiefComplaint: string | null
  status: VisitStatus
  arrivalTime: string
  startTime: string | null
  endTime: string | null
  disposition: DispositionType | null
  notes: string | null
}

/**
 * ER Queue Item (Visit with Patient data)
 */
export interface ERQueueItem {
  visit: Visit
  patient: Patient
}

/**
 * Triage Statistics
 */
export interface TriageStatistics {
  total: number
  red: number
  yellow: number
  green: number
  untriaged: number
}

/**
 * API Response Types
 */
export interface APIResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  details?: any
}

/**
 * Triage Configuration
 */
export interface TriageConfig {
  status: TriageStatus | null
  label: string
  emoji: string
  description: string
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  priority: number
}
