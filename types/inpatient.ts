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
  materialName: string
  quantity: number
  unit: string
  unitPrice: string
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
 * Material Usage Input Data
 */
export interface MaterialUsageInput {
  visitId: string
  materialName: string
  quantity: number
  unit: string
  unitPrice: string
  usedBy?: string
  notes?: string
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
