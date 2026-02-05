/**
 * Pharmacy Stock Utility Functions
 * Stock alerts, expiry checks, and inventory calculations
 */

import { StockAlertLevel, ExpiryAlertLevel, DrugInventoryWithDetails } from "@/types/pharmacy"

/**
 * Calculate days until expiry
 */
export function calculateDaysUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)

  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Get expiry alert level
 */
export function getExpiryAlertLevel(daysUntilExpiry: number): ExpiryAlertLevel {
  if (daysUntilExpiry < 0) return "expired"
  if (daysUntilExpiry <= 30) return "expiring_soon"
  if (daysUntilExpiry <= 90) return "warning"
  return "safe"
}

/**
 * Get expiry alert color
 */
export function getExpiryAlertColor(level: ExpiryAlertLevel): {
  bg: string
  border: string
  text: string
  badge: string
} {
  switch (level) {
    case "expired":
      return {
        bg: "bg-red-50",
        border: "border-red-500",
        text: "text-red-700",
        badge: "bg-red-600",
      }
    case "expiring_soon":
      return {
        bg: "bg-orange-50",
        border: "border-orange-500",
        text: "text-orange-700",
        badge: "bg-orange-600",
      }
    case "warning":
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-500",
        text: "text-yellow-700",
        badge: "bg-yellow-600",
      }
    default:
      return {
        bg: "bg-green-50",
        border: "border-green-500",
        text: "text-green-700",
        badge: "bg-green-600",
      }
  }
}

/**
 * Get expiry alert label
 */
export function getExpiryAlertLabel(level: ExpiryAlertLevel): string {
  switch (level) {
    case "expired":
      return "Kadaluarsa"
    case "expiring_soon":
      return "Segera Kadaluarsa"
    case "warning":
      return "Perhatian"
    default:
      return "Aman"
  }
}

/**
 * Get stock alert level
 */
export function getStockAlertLevel(currentStock: number, minimumStock: number): StockAlertLevel {
  if (currentStock === 0) return "critical"
  if (currentStock <= minimumStock) return "low"
  return "normal"
}

/**
 * Get stock alert color
 */
export function getStockAlertColor(level: StockAlertLevel): {
  bg: string
  border: string
  text: string
  badge: string
} {
  switch (level) {
    case "critical":
      return {
        bg: "bg-red-50",
        border: "border-red-500",
        text: "text-red-700",
        badge: "bg-red-600",
      }
    case "low":
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-500",
        text: "text-yellow-700",
        badge: "bg-yellow-600",
      }
    default:
      return {
        bg: "bg-green-50",
        border: "border-green-500",
        text: "text-green-700",
        badge: "bg-green-600",
      }
  }
}

/**
 * Get stock alert label
 */
export function getStockAlertLabel(level: StockAlertLevel): string {
  switch (level) {
    case "critical":
      return "Stok Habis"
    case "low":
      return "Stok Rendah"
    default:
      return "Stok Cukup"
  }
}

/**
 * Check if drug needs reorder
 */
export function needsReorder(currentStock: number, minimumStock: number): boolean {
  return currentStock <= minimumStock
}

/**
 * Calculate reorder quantity suggestion
 */
export function suggestReorderQuantity(
  currentStock: number,
  minimumStock: number,
  averageMonthlyUsage: number = 0
): number {
  // Suggest enough to reach 3x minimum stock or 2 months usage, whichever is higher
  const targetStock = Math.max(minimumStock * 3, averageMonthlyUsage * 2)
  const shortage = targetStock - currentStock

  return Math.max(shortage, minimumStock)
}

/**
 * Format expiry date display
 */
export function formatExpiryDate(expiryDate: string, daysUntilExpiry: number): string {
  const date = new Date(expiryDate)
  const formatted = date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  if (daysUntilExpiry < 0) {
    return `${formatted} (Kadaluarsa ${Math.abs(daysUntilExpiry)} hari yang lalu)`
  } else if (daysUntilExpiry === 0) {
    return `${formatted} (Kadaluarsa hari ini)`
  } else if (daysUntilExpiry <= 30) {
    return `${formatted} (${daysUntilExpiry} hari lagi)`
  } else {
    return formatted
  }
}

/**
 * Calculate total stock for a drug across all batches
 */
export function calculateTotalStock(inventories: { stockQuantity: number }[]): number {
  return inventories.reduce((sum, inv) => sum + inv.stockQuantity, 0)
}

/**
 * Get available stock (exclude expired batches)
 */
export function getAvailableStock(inventories: DrugInventoryWithDetails[]): number {
  return inventories
    .filter((inv) => inv.expiryAlertLevel !== "expired")
    .reduce((sum, inv) => sum + inv.stockQuantity, 0)
}

/**
 * Sort inventories by FEFO (First Expiry, First Out)
 */
export function sortByFEFO<T extends { expiryDate: string }>(inventories: T[]): T[] {
  return [...inventories].sort((a, b) => {
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  })
}

/**
 * Batch allocation result for multi-batch dispensing
 */
export interface BatchAllocation {
  batch: DrugInventoryWithDetails
  quantity: number
}

/**
 * Allocate batches for dispensing using FEFO with multi-batch support.
 * Prefers single batch when possible, falls back to splitting across batches.
 */
export function allocateBatchesForDispensing(
  inventories: DrugInventoryWithDetails[],
  requiredQuantity: number
): BatchAllocation[] {
  const availableBatches = sortByFEFO(
    inventories.filter((inv) => inv.expiryAlertLevel !== "expired" && inv.stockQuantity > 0)
  )

  // Try single batch first (preferred)
  const sufficientBatch = availableBatches.find((b) => b.stockQuantity >= requiredQuantity)
  if (sufficientBatch) {
    return [{ batch: sufficientBatch, quantity: requiredQuantity }]
  }

  // Multi-batch allocation in FEFO order
  const allocations: BatchAllocation[] = []
  let remaining = requiredQuantity

  for (const batch of availableBatches) {
    if (remaining <= 0) break
    const take = Math.min(batch.stockQuantity, remaining)
    allocations.push({ batch, quantity: take })
    remaining -= take
  }

  return allocations
}

/**
 * Find best batch for dispensing (FEFO + sufficient stock)
 */
export function findBestBatchForDispensing(
  inventories: DrugInventoryWithDetails[],
  requiredQuantity: number
): DrugInventoryWithDetails | null {
  // Filter out expired batches and sort by FEFO
  const availableBatches = sortByFEFO(
    inventories.filter((inv) => inv.expiryAlertLevel !== "expired" && inv.stockQuantity > 0)
  )

  // Find first batch with sufficient stock
  const sufficientBatch = availableBatches.find((batch) => batch.stockQuantity >= requiredQuantity)

  return sufficientBatch || availableBatches[0] || null
}

/**
 * Validate stock availability
 */
export function hasAvailableStock(
  inventories: DrugInventoryWithDetails[],
  requiredQuantity: number
): boolean {
  const availableStock = getAvailableStock(inventories)
  return availableStock >= requiredQuantity
}

/**
 * Format currency (IDR)
 */
export function formatCurrency(amount: string | number): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount
  return `Rp ${numAmount.toLocaleString("id-ID")}`
}

/**
 * Calculate stock value
 */
export function calculateStockValue(stockQuantity: number, price: string | number): number {
  const priceNum = typeof price === "string" ? parseFloat(price) : price
  return stockQuantity * priceNum
}

/**
 * Get stock status icon
 */
export function getStockStatusIcon(level: StockAlertLevel): string {
  switch (level) {
    case "critical":
      return "🔴"
    case "low":
      return "🟡"
    default:
      return "🟢"
  }
}

/**
 * Get expiry status icon
 */
export function getExpiryStatusIcon(level: ExpiryAlertLevel): string {
  switch (level) {
    case "expired":
      return "🔴"
    case "expiring_soon":
      return "🟠"
    case "warning":
      return "🟡"
    default:
      return "🟢"
  }
}
