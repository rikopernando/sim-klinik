/**
 * Pharmacy Module Type Definitions
 * Centralized types for the Pharmacy/Farmasi module
 */

/**
 * Movement Types
 */
export type MovementType = "in" | "out" | "adjustment" | "expired";

export const MOVEMENT_TYPES = {
    IN: "in" as MovementType,
    OUT: "out" as MovementType,
    ADJUSTMENT: "adjustment" as MovementType,
    EXPIRED: "expired" as MovementType,
} as const;

/**
 * Drug Category Types
 */
export type DrugCategory =
    | "Antibiotics"
    | "Analgesics"
    | "Antipyretics"
    | "Antihypertensives"
    | "Vitamins"
    | "Others";

/**
 * Route Types
 */
export type RouteType = "oral" | "topical" | "injection" | "inhalation" | "others";

/**
 * Stock Alert Level
 */
export type StockAlertLevel = "critical" | "low" | "normal";

/**
 * Expiry Alert Level
 */
export type ExpiryAlertLevel = "expired" | "expiring_soon" | "warning" | "safe";

/**
 * Drug Entity
 */
export interface Drug {
    id: number;
    name: string;
    genericName: string | null;
    category: string | null;
    unit: string;
    price: string;
    minimumStock: number;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Drug with Total Stock
 */
export interface DrugWithStock extends Drug {
    totalStock: number;
    stockAlertLevel: StockAlertLevel;
}

/**
 * Drug Inventory Entity
 */
export interface DrugInventory {
    id: number;
    drugId: number;
    batchNumber: string;
    expiryDate: Date;
    stockQuantity: number;
    purchasePrice: string | null;
    supplier: string | null;
    receivedDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Drug Inventory with Drug Details
 */
export interface DrugInventoryWithDetails extends DrugInventory {
    drug: Drug;
    expiryAlertLevel: ExpiryAlertLevel;
    daysUntilExpiry: number;
}

/**
 * Prescription Entity
 */
export interface Prescription {
    id: number;
    medicalRecordId: number;
    drugId: number;
    dosage: string;
    frequency: string;
    duration: string | null;
    quantity: number;
    instructions: string | null;
    route: string | null;
    isFulfilled: boolean;
    fulfilledBy: string | null;
    fulfilledAt: string | null;
    dispensedQuantity: number | null;
    inventoryId: number | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Prescription with Details (Drug, Patient, Doctor)
 */
export interface PrescriptionWithDetails {
    prescription: Prescription;
    drug: Drug;
    patient: {
        id: number;
        name: string;
        mrNumber: string;
    };
    doctor: {
        id: string;
        name: string;
    };
    visit: {
        id: number;
        visitNumber: string;
    };
}

/**
 * Stock Movement Entity
 */
export interface StockMovement {
    id: number;
    inventoryId: number;
    movementType: MovementType;
    quantity: number;
    reason: string | null;
    referenceId: number | null;
    performedBy: string | null;
    createdAt: string;
}

/**
 * Stock Movement with Details
 */
export interface StockMovementWithDetails extends StockMovement {
    inventory: DrugInventoryWithDetails;
}

/**
 * Drug Input Data
 */
export interface DrugInput {
    name: string;
    genericName?: string;
    category?: string;
    unit: string;
    price: string;
    minimumStock?: number;
    description?: string;
}


/**
 * Prescription Fulfillment Input
 */
export interface PrescriptionFulfillmentInput {
    prescriptionId: number;
    inventoryId: number;
    dispensedQuantity: number;
    fulfilledBy: string;
    notes?: string;
}

/**
 * Stock Adjustment Input
 */
export interface StockAdjustmentInput {
    inventoryId: number;
    quantity: number;
    reason: string;
    performedBy: string;
}

/**
 * Pharmacy Statistics
 */
export interface PharmacyStatistics {
    totalDrugs: number;
    activeDrugs: number;
    lowStockDrugs: number;
    criticalStockDrugs: number;
    expiringDrugs: number;
    expiredDrugs: number;
    pendingPrescriptions: number;
    fulfilledToday: number;
}

/**
 * Stock Alert
 */
export interface StockAlert {
    drug: DrugWithStock;
    alertLevel: StockAlertLevel;
    currentStock: number;
    minimumStock: number;
    shortage: number;
}

/**
 * Expiry Alert
 */
export interface ExpiryAlert {
    inventory: DrugInventoryWithDetails;
    alertLevel: ExpiryAlertLevel;
    daysUntilExpiry: number;
    expiryDate: string;
}

/**
 * API Response Types
 */
export interface APIResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    details?: any;
    count?: number;
}

/**
 * Prescription Filter Options
 */
export type PrescriptionFilter = "all" | "pending" | "fulfilled";

/**
 * Stock Filter Options
 */
export type StockFilter = "all" | "low" | "critical" | "expiring" | "expired";
