/**
 * Pharmacy Module Type Definitions
 * Centralized types for the Pharmacy/Farmasi module
 */

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
export type RouteType = "oral" | "topical" | "injection" | "inhalation" | "others"

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
  expiryDate: Date
  stockQuantity: number
  purchasePrice: string | null
  supplier: string | null
  receivedDate: Date
  createdAt: Date
  updatedAt: Date
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
 * Prescription Entity
 */
export interface Prescription {
  id: string
  medicalRecordId: string
  drugId: string
  dosage: string
  frequency: string
  duration: string | null
  quantity: number
  instructions: string | null
  route: string | null
  isFulfilled: boolean
  fulfilledBy: string | null
  fulfilledAt: string | null
  dispensedQuantity: number | null
  inventoryId: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Prescription with Details (Drug, Patient, Doctor)
 */
export interface PrescriptionWithDetails {
  prescription: Prescription
  drug: Drug
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
 */
export interface PrescriptionFulfillmentInput {
  prescriptionId: string
  inventoryId: string
  dispensedQuantity: number
  fulfilledBy: string
  notes?: string
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

/**
 * Expiring Drugs Types
 */
export interface DrugInventoryWithDetails {
  id: string
  drugId: string
  batchNumber: string
  expiryDate: Date
  stockQuantity: number
  purchasePrice: string | null
  supplier: string | null
  receivedDate: Date
  createdAt: Date
  updatedAt: Date
  drug: Drug
  expiryAlertLevel: "expired" | "expiring_soon" | "warning" | "safe"
  daysUntilExpiry: number
}

export interface ExpiringDrugsData {
  all: DrugInventoryWithDetails[]
  expired: DrugInventoryWithDetails[]
  expiringSoon: DrugInventoryWithDetails[]
  warning: DrugInventoryWithDetails[]
}
