/**
 * Inpatient Module Type Definitions
 * Centralized types for the Inpatient/Rawat Inap module
 */

import { Patient } from "./registration"
import { Visit } from "./visit"

/**
 * Room Status Types
 */
export type RoomStatus = "available" | "occupied" | "maintenance" | "reserved"

export const ROOM_STATUS = {
  AVAILABLE: "available" as RoomStatus,
  OCCUPIED: "occupied" as RoomStatus,
  MAINTENANCE: "maintenance" as RoomStatus,
  RESERVED: "reserved" as RoomStatus,
} as const

/**
 * Room Types
 */
export type RoomType = "VIP" | "Class 1" | "Class 2" | "Class 3" | "ICU" | "NICU" | "Isolation"

/**
 * Author Role for CPPT
 */
export type AuthorRole = "doctor" | "nurse"

/**
 * Consciousness Level
 */
export type ConsciousnessLevel = "Alert" | "Confused" | "Drowsy" | "Unresponsive"

/**
 * Room Entity
 */
export interface Room {
  id: string
  roomNumber: string
  roomType: string
  bedCount: number
  availableBeds: number
  floor: string | null
  building: string | null
  dailyRate: string
  facilities: string | null
  status: RoomStatus
  description: string | null
  isActive: string
  createdAt: string
  updatedAt: string
}

/**
 * Room with Occupancy Data
 */
export interface RoomWithOccupancy extends Room {
  occupiedBeds: number
  occupancyRate: number
  assignments: BedAssignmentWithDetails[]
}

/**
 * Bed Assignment Entity
 */
export interface BedAssignment {
  id: string
  visitId: string
  roomId: string
  bedNumber: string
  assignedAt: string
  dischargedAt: string | null
  assignedBy: string | null
  notes: string | null
  createdAt: string
}

/**
 * Bed Assignment with Visit and Patient Details
 */
export interface BedAssignmentWithDetails {
  assignment: BedAssignment
  visit: Visit
  patient: Patient
}

/**
 * Vital Signs Entity
 */
export interface VitalSigns {
  id: string
  visitId: string
  temperature: string | null
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  pulse: number | null
  respiratoryRate: number | null
  oxygenSaturation: string | null
  weight: string | null
  height: string | null
  bmi: string | null
  painScale: number | null
  consciousness: string | null
  recordedBy: string
  recordedAt: string
  notes: string | null
  createdAt: string
}

/**
 * CPPT Entity
 */
export interface CPPT {
  id: string
  visitId: string
  authorId: string
  authorRole: AuthorRole
  authorName?: string
  subjective: string | null
  objective: string | null
  assessment: string | null
  plan: string | null
  progressNote: string
  instructions: string | null
  createdAt: string
}

/**
 * Material Usage Entity
 */
export interface MaterialUsage {
  id: string
  visitId: string

  // NEW: Service reference (preferred)
  serviceId: string | null

  // LEGACY: Direct material fields (deprecated, for backward compatibility)
  materialName: string | null
  unit: string | null
  unitPrice: string | null

  // Core fields
  quantity: number
  totalPrice: string
  usedBy: string | null
  usedAt: string
  notes: string | null
  createdAt: string
}

/**
 * Room Statistics
 */
export interface RoomStatistics {
  total: number
  available: number
  partial: number
  full: number
  totalBeds: number
  occupiedBeds: number
  occupancyRate: number
}

/**
 * Vital Signs Input Data
 */
export interface VitalSignsInput {
  visitId: string
  temperature?: string
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  pulse?: number
  respiratoryRate?: number
  oxygenSaturation?: string
  weight?: string
  height?: string
  painScale?: number
  consciousness?: string
  notes?: string
  recordedBy: string
}

/**
 * CPPT Input Data
 */
export interface CPPTInput {
  visitId: string
  authorId: string
  authorRole: AuthorRole
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
  progressNote: string
  instructions?: string
}

/**
 * Room Input Data
 */
export interface RoomInput {
  roomNumber: string
  roomType: string
  bedCount: number
  floor?: string
  building?: string
  dailyRate: string
  facilities?: string
  description?: string
}

/**
 * Room Filter Options
 */
export type RoomFilter = "all" | "available" | "occupied" | "full"

/**
 * Room Status Config
 */
export interface RoomStatusConfig {
  status: RoomStatus
  label: string
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  badgeColor: string
}

/**
 * Procedure Status Types
 */
export type ProcedureStatus = "ordered" | "in_progress" | "completed" | "cancelled"

export const PROCEDURE_STATUS = {
  ORDERED: "ordered" as ProcedureStatus,
  IN_PROGRESS: "in_progress" as ProcedureStatus,
  COMPLETED: "completed" as ProcedureStatus,
  CANCELLED: "cancelled" as ProcedureStatus,
} as const

/**
 * Inpatient Prescription Entity
 * For daily/recurring medications during inpatient stay
 */
export interface InpatientPrescription {
  id: string
  visitId: string
  cpptId: string | null
  drugId: string
  drugName?: string
  drugPrice?: string

  // Prescription details
  dosage: string | null
  frequency: string
  route: string | null
  duration: string | null
  quantity: number
  instructions: string | null

  // Inpatient specific - recurring medication
  isRecurring: boolean
  startDate: string | null
  endDate: string | null
  administrationSchedule: string | null // "08:00,14:00,20:00" for 3x daily

  // Administration tracking (for nurses)
  isAdministered: boolean
  administeredBy: string | null
  administeredByName?: string
  administeredAt: string | null

  // Fulfillment tracking (pharmacy)
  isFulfilled: boolean
  fulfilledBy: string | null
  fulfilledByName?: string
  fulfilledAt: string | null
  dispensedQuantity: number | null
  inventoryId: string | null

  notes: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Inpatient Procedure Entity
 * For ordered procedures/tindakan during inpatient stay
 */
export interface InpatientProcedure {
  id: string
  visitId: string
  cpptId: string | null

  // Service reference
  serviceId: string | null
  serviceName?: string
  servicePrice?: string

  // Procedure details
  icd9Code: string | null
  description: string

  // Ordering workflow
  orderedBy: string | null
  orderedByName?: string
  orderedAt: string | null
  scheduledAt: string | null
  status: ProcedureStatus

  // Execution tracking
  performedBy: string | null
  performedByName?: string
  performedAt: string | null

  notes: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Inpatient Prescription Input Data
 */
export interface InpatientPrescriptionInput {
  visitId: string
  cpptId?: string
  drugId: string
  dosage: string
  frequency: string
  route?: string
  duration?: string
  quantity: number
  instructions?: string
  isRecurring?: boolean
  startDate?: string
  endDate?: string
  administrationSchedule?: string
  notes?: string
}

/**
 * Inpatient Procedure Input Data
 */
export interface InpatientProcedureInput {
  visitId: string
  cpptId?: string
  serviceId?: string
  description: string
  icd9Code?: string
  scheduledAt?: string
  notes?: string
}

/**
 * Administer Prescription Input
 */
export interface AdministerPrescriptionInput {
  prescriptionId: string
  administeredBy: string
}

/**
 * Update Procedure Status Input
 */
export interface UpdateProcedureStatusInput {
  procedureId: string
  status: ProcedureStatus
  performedBy?: string
  notes?: string
}

export interface PatientSearchResult {
  id: string
  mrNumber: string
  name: string
  visit: {
    id: string
    visitNumber: string
  }
}

/**
 * Inpatient Patient List Item
 */
export interface InpatientPatient {
  visitId: string
  visitNumber: string
  patientId: string
  mrNumber: string
  patientName: string
  admissionDate: string
  daysInHospital: number
  roomId: string
  roomNumber: string
  roomType: string
  bedNumber: string
  assignmentId: string
  latestVitals: VitalSigns | null
}

/**
 * Inpatient List Filters
 */
export interface InpatientFilters {
  search?: string
  roomType?: string | "all"
  admissionDateFrom?: string
  admissionDateTo?: string
  sortBy?: "admissionDate" | "roomNumber" | "patientName"
  sortOrder?: "asc" | "desc"
}

/**
 * Patient Detail Data
 */
export interface PatientDetail {
  patient: {
    visitId: string
    visitNumber: string
    visitType: string
    admissionDate: string | null
    dischargeDate: string | null
    patientId: string
    mrNumber: string
    patientName: string
    nik: string | null
    dateOfBirth: string | null
    gender: string | null
    address: string | null
    phone: string | null
    insurance: string | null
  }
  bedAssignment: {
    assignmentId: string
    roomId: string
    roomNumber: string
    roomType: string
    bedNumber: string
    assignedAt: string
    dischargedAt: string | null
    notes: string | null
    dailyRate: string
  } | null
  daysInHospital: number
  totalRoomCost: string
  vitals: VitalSigns[]
  cpptEntries: CPPT[]
  materials: MaterialUsage[]
  totalMaterialCost: string
  prescriptions: InpatientPrescription[]
  procedures: InpatientProcedure[]
}
