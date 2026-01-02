/**
 * Inventory Service
 * Business logic for inventory management (materials and drugs)
 * Handles batch selection, stock validation, and stock movements
 */

import { eq, and, gte } from "drizzle-orm"
import { db } from "@/db"
import { inventoryItems, inventoryBatches, stockMovements } from "@/db/schema/inventory"

/**
 * Find available batch using FIFO strategy
 * Returns the oldest unexpired batch with sufficient stock
 */
export async function findAvailableBatch(itemId: string, quantityNeeded: number) {
  const batches = await db
    .select()
    .from(inventoryBatches)
    .where(
      and(
        eq(inventoryBatches.drugId, itemId),
        gte(inventoryBatches.stockQuantity, quantityNeeded),
        gte(inventoryBatches.expiryDate, new Date()) // Not expired
      )
    )
    .orderBy(inventoryBatches.expiryDate) // FIFO: use oldest first
    .limit(1)

  return batches[0] || null
}

/**
 * Get specific batch by ID and validate availability
 */
export async function validateBatch(batchId: string, itemId: string, quantityNeeded: number) {
  const [batch] = await db
    .select()
    .from(inventoryBatches)
    .where(and(eq(inventoryBatches.id, batchId), eq(inventoryBatches.drugId, itemId)))
    .limit(1)

  if (!batch) {
    throw new Error("Batch not found")
  }

  if (batch.stockQuantity < quantityNeeded) {
    throw new Error("Insufficient stock in specified batch")
  }

  return batch
}

/**
 * Get material details from unified inventory
 */
export async function getMaterialById(itemId: string) {
  const [material] = await db
    .select()
    .from(inventoryItems)
    .where(and(eq(inventoryItems.id, itemId), eq(inventoryItems.itemType, "material")))
    .limit(1)

  if (!material) {
    throw new Error("Material not found")
  }

  return material
}

/**
 * Deduct stock from batch
 */
export async function deductStock(batchId: string, quantity: number) {
  const [batch] = await db
    .select()
    .from(inventoryBatches)
    .where(eq(inventoryBatches.id, batchId))
    .limit(1)

  if (!batch) {
    throw new Error("Batch not found")
  }

  await db
    .update(inventoryBatches)
    .set({
      stockQuantity: batch.stockQuantity - quantity,
    })
    .where(eq(inventoryBatches.id, batchId))
}

/**
 * Create stock movement record
 */
export async function createStockMovement(params: {
  inventoryId: string
  quantity: number
  reason: string
  referenceId?: string
  performedBy?: string | null
}) {
  const [movement] = await db
    .insert(stockMovements)
    .values({
      inventoryId: params.inventoryId,
      movementType: "out",
      quantity: -params.quantity, // Negative for outgoing
      reason: params.reason,
      referenceId: params.referenceId,
      performedBy: params.performedBy || null,
    })
    .returning()

  return movement
}

/**
 * Check if sufficient stock is available
 * Returns available stock quantity
 */
export async function checkStockAvailability(itemId: string): Promise<number> {
  const batches = await db
    .select()
    .from(inventoryBatches)
    .where(
      and(
        eq(inventoryBatches.drugId, itemId),
        gte(inventoryBatches.stockQuantity, 1),
        gte(inventoryBatches.expiryDate, new Date())
      )
    )

  return batches.reduce((total, batch) => total + batch.stockQuantity, 0)
}
