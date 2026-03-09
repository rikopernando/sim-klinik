/**
 * Pharmacy Module Type Definitions
 * Centralized types for the Pharmacy/Farmasi module
 */
import { Prescription } from "@/types/medical-record"

/**
 * Movement Types
 */
export type MovementType = "in" | "out" | "adjustment" | "expired"

export const MOVEMENT_TYPES = {
  IN: "in" as MovementType,
  OUT: "out" as MovementType,
  ADJUSTMENT: "adjustment" as MovementType,
  EXPIRED: "expired" as MovementType,
} as const

/**
 * Drug Category Types
 */
export type DrugCategory =
  | "Antibiotics"
  | "Analgesics"
  | "Antipyretics"
  | "Antihypertensives"
  | "Vitamins"
  | "Others"

/**
 * Route Types
 */
export type RouteType =
  | "oral"
  | "topical"
  | "injection"
  | "inhalation"
  | "rectal"
  | "sublingual"
  | "compounded"
  | "others"

/**
 * Stock Alert Level
 */
export type StockAlertLevel = "critical" | "low" | "normal"

/**
 * Expiry Alert Level
 */
export type ExpiryAlertLevel = "expired" | "expiring_soon" | "warning" | "safe"

/**
 * Drug Entity
 */
export interface Drug {
  id: string
  name: string
  genericName: string | null
  category: string | null
  unit: string
  price: string
  minimumStock: number
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Drug with Total Stock
 */
export interface DrugWithStock extends Drug {
  totalStock: number
  stockAlertLevel: StockAlertLevel
}

/**
 * Drug Inventory Entity
 */
export interface DrugInventory {
  id: string
  drugId: string
  batchNumber: string
  expiryDate: string
  stockQuantity: number
  purchasePrice: string | null
  supplier: string | null
  receivedDate: string
  createdAt: string
  updatedAt: string
}

/**
 * Drug Inventory with Drug Details
 */
export interface DrugInventoryWithDetails extends DrugInventory {
  drug: Drug
  expiryAlertLevel: ExpiryAlertLevel
  daysUntilExpiry: number
}

/**
 * Prescription with Details (Drug, Patient, Doctor)
 */
export interface PrescriptionWithDetails {
  prescription: Prescription
  drug: Drug | null // Can be null for compound prescriptions
  compoundRecipe?: CompoundRecipeBasic | null
  patient: {
    id: string
    name: string
    mrNumber: string
  }
  doctor: {
    id: string
    name: string
  }
  visit: {
    id: string
    visitNumber: string
  }
}

/**
 * Basic compound recipe info for prescription display
 */
export interface CompoundRecipeBasic {
  id: string
  code: string
  name: string
  composition: {
    drugId: string
    drugName: string
    quantity: number
    unit: string
  }[]
  price: string | null
}

/**
 * Stock Movement Entity
 */
export interface StockMovement {
  id: string
  inventoryId: string
  movementType: MovementType
  quantity: number
  reason: string | null
  referenceId: string | null
  performedBy: string | null
  createdAt: string
}

/**
 * Stock Movement with Details
 */
export interface StockMovementWithDetails extends StockMovement {
  inventory: DrugInventoryWithDetails
}

/**
 * Drug Input Data
 */
export interface DrugInput {
  name: string
  genericName?: string
  category?: string
  unit: string
  price: string
  minimumStock?: number
  description?: string
}

/**
 * Prescription Fulfillment Input
 * Supports both regular drugs (with inventoryId) and compound recipes (without)
 */
export interface PrescriptionFulfillmentInput {
  prescriptionId: string
  inventoryId?: string // Optional for compound prescriptions
  dispensedQuantity: number
  fulfilledBy: string
  notes?: string
  isCompound?: boolean // Flag for compound prescriptions
}

/**
 * Stock Adjustment Input
 */
export interface StockAdjustmentInput {
  inventoryId: string
  quantity: number
  reason: string
  performedBy: string
}

/**
 * Pharmacy Statistics
 */
export interface PharmacyStatistics {
  totalDrugs: number
  activeDrugs: number
  lowStockDrugs: number
  criticalStockDrugs: number
  expiringDrugs: number
  expiredDrugs: number
  pendingPrescriptions: number
  fulfilledToday: number
}

/**
 * Stock Alert
 */
export interface StockAlert {
  drug: DrugWithStock
  alertLevel: StockAlertLevel
  currentStock: number
  minimumStock: number
  shortage: number
}

/**
 * Expiry Alert
 */
export interface ExpiryAlert {
  inventory: DrugInventoryWithDetails
  alertLevel: ExpiryAlertLevel
  daysUntilExpiry: number
  expiryDate: string
}

/**
 * Prescription Filter Options
 */
export type PrescriptionFilter = "all" | "pending" | "fulfilled"

/**
 * Stock Filter Options
 */
export type StockFilter = "all" | "low" | "critical" | "expiring" | "expired"

export interface ExpiringDrugsData {
  all: DrugInventoryWithDetails[]
  expired: DrugInventoryWithDetails[]
  expiringSoon: DrugInventoryWithDetails[]
  warning: DrugInventoryWithDetails[]
}

/**
 * Prescription Queue Types
 */
export interface PrescriptionQueueItem {
  visit: {
    id: string
    visitNumber: string
    visitType: "outpatient" | "inpatient" | "emergency" // Added to distinguish prescription type
  }
  patient: {
    id: string
    name: string
    mrNumber: string
  }
  doctor: {
    id: string
    name: string
  } | null
  medicalRecordId: string | null // NULL for inpatient prescriptions
  // Inpatient-specific fields (NULL for outpatient)
  room: {
    id: string
    roomNumber: string
    roomType: string
  } | null
  bedAssignment: {
    bedNumber: string
  } | null
  prescriptions: {
    prescription: Prescription
    drug: Drug | null // Can be null for compound prescriptions
    compoundRecipe: CompoundRecipeBasic | null // For compound prescriptions
  }[]
}

/**
 * Compound Ingredient Allocation
 * Tracks batch allocations for each ingredient when fulfilling compound prescriptions
 */
export interface CompoundIngredientAllocation {
  drugId: string
  drugName: string
  requiredQuantity: number
  unit: string
  batches: {
    inventoryId: string
    batchNumber: string
    quantity: number
  }[]
}

/**
 * Ingredient Stock Status
 * Used to validate ingredient availability before fulfillment
 */
export interface IngredientStockStatus {
  drugId: string
  drugName: string
  required: number
  available: number
  unit: string
  hasSufficientStock: boolean
}
