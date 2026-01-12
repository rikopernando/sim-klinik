/**
 * Material Types
 * Shared type definitions for material/inventory management
 */

export interface Material {
  id: string
  name: string
  category: string | null
  unit: string
  price: string
  minimumStock: number
  description: string | null
  totalStock: string
}

export interface MaterialBatch {
  id: string
  drugId: string
  batchNumber: string
  expiryDate: Date
  stockQuantity: number
  purchasePrice: string | null
  supplier: string | null
  receivedDate: Date
}

export interface MaterialUsageRecord {
  id: string
  visitId: string
  itemId: string | null
  materialName: string | null
  unit: string | null
  quantity: string
  unitPrice: string | null
  totalPrice: string
  stockMovementId: string | null
  usedBy: string | null
  usedAt: Date
  notes: string | null
  createdAt: Date
}

export interface StockMovement {
  id: string
  inventoryId: string
  movementType: "in" | "out" | "adjustment" | "expired"
  quantity: number
  reason: string | null
  referenceId: string | null
  performedBy: string | null
  createdAt: Date
}

/**
 * Material with stock status indicators
 */
export interface MaterialWithStatus extends Material {
  stockStatus: "out_of_stock" | "low_stock" | "in_stock"
  isExpiringSoon?: boolean
}

/**
 * Helper to determine stock status
 */
export function getMaterialStockStatus(material: Material): MaterialWithStatus["stockStatus"] {
  const totalStock = parseFloat(material.totalStock)

  if (totalStock === 0) return "out_of_stock"
  if (totalStock < material.minimumStock) return "low_stock"
  return "in_stock"
}
