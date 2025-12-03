/**
 * Inpatient Module Type Definitions
 * Centralized types for the Inpatient/Rawat Inap module
 */

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
  id: number
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
  id: number
  visitId: number
  roomId: number
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
  visit: any // Visit type
  patient: any // Patient type
}

/**
 * Vital Signs Entity
 */
export interface VitalSigns {
  id: number
  visitId: number
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
  id: number
  visitId: number
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
  id: number
  visitId: number
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
  visitId: number
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
  visitId: number
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
  visitId: number
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
 * Bed Assignment Input Data
 */
export interface BedAssignmentInput {
  visitId: number
  roomId: number
  bedNumber: string
  notes?: string
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
  count?: number
  totalCost?: string
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
