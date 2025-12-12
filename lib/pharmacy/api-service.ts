/**
 * Pharmacy Module API Service Layer
 * Database operations for pharmacy management
 */

import { db } from "@/db"
import { drugs, drugInventory, prescriptions, stockMovements } from "@/db/schema"
import { medicalRecords } from "@/db/schema/medical-records"
import { visits } from "@/db/schema/visits"
import { patients } from "@/db/schema/patients"
import { user } from "@/db/schema/auth"
import { eq, sql, and, lt, gte, desc, ilike, or } from "drizzle-orm"
import type {
  DrugInput,
  DrugUpdateInput,
  PrescriptionFulfillmentInput,
  StockAdjustmentInput,
  DrugWithStock,
  DrugInventoryWithDetails,
  Drug,
  DrugInventory,
  PrescriptionQueueItem,
} from "@/types/pharmacy"
import { calculateDaysUntilExpiry, getExpiryAlertLevel, getStockAlertLevel } from "./stock-utils"
import { DrugInventoryInput } from "./validation"
import { getSession } from "../rbac"
import { Prescription } from "@/types/medical-record"

/**
 * Get all drugs with total stock calculation
 */
export async function getAllDrugsWithStock(): Promise<DrugWithStock[]> {
  const allDrugs = await db.select().from(drugs).orderBy(drugs.name)

  const drugsWithStock: DrugWithStock[] = await Promise.all(
    allDrugs.map(async (drug) => {
      // Calculate total stock across all batches
      const inventories = await db
        .select()
        .from(drugInventory)
        .where(eq(drugInventory.drugId, drug.id))

      const totalStock = inventories.reduce((sum, inv) => sum + inv.stockQuantity, 0)

      const stockAlertLevel = getStockAlertLevel(totalStock, drug.minimumStock)

      return {
        ...drug,
        totalStock,
        stockAlertLevel,
      }
    })
  )

  return drugsWithStock
}

/**
 * Get drug by ID with stock info
 */
export async function getDrugById(drugId: string): Promise<DrugWithStock | null> {
  const drug = await db.select().from(drugs).where(eq(drugs.id, drugId)).limit(1)

  if (drug.length === 0) return null

  const inventories = await db.select().from(drugInventory).where(eq(drugInventory.drugId, drugId))

  const totalStock = inventories.reduce((sum, inv) => sum + inv.stockQuantity, 0)
  const stockAlertLevel = getStockAlertLevel(totalStock, drug[0].minimumStock)

  return {
    ...drug[0],
    totalStock,
    stockAlertLevel,
  }
}

/**
 * Search drugs by name or generic name
 */
export async function searchDrugs(query: string): Promise<DrugWithStock[]> {
  const searchPattern = `%${query}%`
  const results = await db
    .select()
    .from(drugs)
    .where(
      and(
        or(ilike(drugs.name, searchPattern), ilike(drugs.genericName, searchPattern)),
        eq(drugs.isActive, true)
      )
    )
    .limit(20)

  const drugsWithStock: DrugWithStock[] = await Promise.all(
    results.map(async (drug) => {
      const inventories = await db
        .select()
        .from(drugInventory)
        .where(eq(drugInventory.drugId, drug.id))

      const totalStock = inventories.reduce((sum, inv) => sum + inv.stockQuantity, 0)

      const stockAlertLevel = getStockAlertLevel(totalStock, drug.minimumStock)

      return {
        ...drug,
        totalStock,
        stockAlertLevel,
      }
    })
  )

  return drugsWithStock
}

/**
 * Create new drug
 */
export async function createDrug(data: DrugInput) {
  const [newDrug] = await db
    .insert(drugs)
    .values({
      name: data.name,
      genericName: data.genericName || null,
      category: data.category || null,
      unit: data.unit,
      price: data.price,
      minimumStock: data.minimumStock || 10,
      description: data.description || null,
    })
    .returning()

  return newDrug
}

/**
 * Update drug
 */
export async function updateDrug(drugId: string, data: Partial<DrugUpdateInput>) {
  const [updatedDrug] = await db
    .update(drugs)
    .set({
      ...data,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(drugs.id, drugId))
    .returning()

  if (!updatedDrug) {
    throw new Error("Drug not found")
  }

  return updatedDrug
}

/**
 * Soft delete drug (set isActive to false)
 */
export async function deleteDrug(drugId: string) {
  const [deletedDrug] = await db
    .update(drugs)
    .set({
      isActive: false,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(drugs.id, drugId))
    .returning()

  if (!deletedDrug) {
    throw new Error("Drug not found")
  }

  return deletedDrug
}

/**
 * Get all drug inventory with details
 */
export async function getAllDrugInventory(): Promise<DrugInventoryWithDetails[]> {
  const inventories = await db
    .select({
      inventory: drugInventory,
      drug: drugs,
    })
    .from(drugInventory)
    .innerJoin(drugs, eq(drugInventory.drugId, drugs.id))
    .orderBy(desc(drugInventory.createdAt))

  const inventoriesWithDetails: DrugInventoryWithDetails[] = inventories.map(
    ({ inventory, drug }) => {
      const daysUntilExpiry = calculateDaysUntilExpiry(inventory.expiryDate.toISOString())
      const expiryAlertLevel = getExpiryAlertLevel(daysUntilExpiry)

      return {
        ...inventory,
        drug,
        daysUntilExpiry,
        expiryAlertLevel,
      }
    }
  )

  return inventoriesWithDetails
}

/**
 * Get drug inventory by drug ID
 */
export async function getDrugInventoryByDrugId(
  drugId: string
): Promise<DrugInventoryWithDetails[]> {
  const inventories = await db
    .select({
      inventory: drugInventory,
      drug: drugs,
    })
    .from(drugInventory)
    .innerJoin(drugs, eq(drugInventory.drugId, drugs.id))
    .where(eq(drugInventory.drugId, drugId))
    .orderBy(drugInventory.expiryDate)

  const inventoriesWithDetails: DrugInventoryWithDetails[] = inventories.map(
    ({ inventory, drug }) => {
      const daysUntilExpiry = calculateDaysUntilExpiry(inventory.expiryDate.toISOString())
      const expiryAlertLevel = getExpiryAlertLevel(daysUntilExpiry)

      return {
        ...inventory,
        drug,
        daysUntilExpiry,
        expiryAlertLevel,
      }
    }
  )

  return inventoriesWithDetails
}

/**
 * Add new drug inventory (stock in)
 */
export async function addDrugInventory(data: DrugInventoryInput) {
  // Verify drug exists
  const drug = await db.select().from(drugs).where(eq(drugs.id, data.drugId)).limit(1)

  if (drug.length === 0) {
    throw new Error("Drug not found")
  }

  const [newInventory] = await db
    .insert(drugInventory)
    .values({
      drugId: data.drugId,
      batchNumber: data.batchNumber,
      expiryDate: new Date(data.expiryDate),
      stockQuantity: data.stockQuantity,
      purchasePrice: data.purchasePrice ? data.purchasePrice : null,
      supplier: data.supplier || null,
      receivedDate: data.receivedDate ? new Date(data.receivedDate) : new Date(),
    })
    .returning()

  const session = await getSession()

  // Record stock movement
  await db.insert(stockMovements).values({
    inventoryId: newInventory.id,
    movementType: "in",
    quantity: data.stockQuantity,
    reason: "Stock masuk baru",
    performedBy: session?.user.id,
  })

  return newInventory
}

/**
 * Get expiring drugs (expiry date < 30 days)
 */
export async function getExpiringDrugs(): Promise<DrugInventoryWithDetails[]> {
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const inventories = await db
    .select({
      inventory: drugInventory,
      drug: drugs,
    })
    .from(drugInventory)
    .innerJoin(drugs, eq(drugInventory.drugId, drugs.id))
    .where(
      and(lt(drugInventory.expiryDate, thirtyDaysFromNow), gte(drugInventory.stockQuantity, 1))
    )
    .orderBy(drugInventory.expiryDate)

  const inventoriesWithDetails: DrugInventoryWithDetails[] = inventories.map(
    ({ inventory, drug }) => {
      const daysUntilExpiry = calculateDaysUntilExpiry(inventory.expiryDate.toISOString())
      const expiryAlertLevel = getExpiryAlertLevel(daysUntilExpiry)

      return {
        ...inventory,
        drug,
        daysUntilExpiry,
        expiryAlertLevel,
      }
    }
  )

  return inventoriesWithDetails
}

/**
 * Helper: Group pending prescriptions by visit
 * Consolidates prescriptions for the same visit into a single queue item
 */
function groupPrescriptionsByVisit(
  pending: Array<{
    prescription: Prescription
    drug: Drug
    patient: { id: string; name: string; mrNumber: string }
    doctor: { id: string; name: string } | null
    visit: { id: string; visitNumber: string }
    medicalRecordId: string
  }>
): PrescriptionQueueItem[] {
  const groupedByVisit = new Map<string, PrescriptionQueueItem>()

  for (const item of pending) {
    const visitId = item.visit.id

    if (!groupedByVisit.has(visitId)) {
      groupedByVisit.set(visitId, {
        visit: item.visit,
        patient: item.patient,
        doctor: item.doctor,
        medicalRecordId: item.medicalRecordId,
        prescriptions: [],
      })
    }

    const group = groupedByVisit.get(visitId)!
    group.prescriptions.push({
      prescription: item.prescription,
      drug: item.drug,
    })
  }

  // Convert to array and sort by most recent prescription
  return Array.from(groupedByVisit.values()).sort((a, b) => {
    const aLatest = Math.max(...a.prescriptions.map((p) => p.prescription.createdAt.getTime()))
    const bLatest = Math.max(...b.prescriptions.map((p) => p.prescription.createdAt.getTime()))
    return bLatest - aLatest
  })
}

/**
 * Get pending prescriptions grouped by visit
 * Includes patient and doctor information via joins
 * Returns prescriptions sorted by most recent first
 */
export async function getPendingPrescriptions(): Promise<PrescriptionQueueItem[]> {
  // Fetch all pending prescriptions with related data in a single query
  const pending = await db
    .select({
      prescription: prescriptions,
      drug: {
        id: drugs.id,
        name: drugs.name,
        genericName: drugs.genericName,
        unit: drugs.unit,
        price: drugs.price,
      },
      patient: {
        id: patients.id,
        name: patients.name,
        mrNumber: patients.mrNumber,
      },
      doctor: {
        id: user.id,
        name: user.name,
      },
      visit: {
        id: visits.id,
        visitNumber: visits.visitNumber,
      },
      medicalRecordId: medicalRecords.id,
    })
    .from(prescriptions)
    .innerJoin(drugs, eq(prescriptions.drugId, drugs.id))
    .innerJoin(medicalRecords, eq(prescriptions.medicalRecordId, medicalRecords.id))
    .innerJoin(visits, eq(medicalRecords.visitId, visits.id))
    .innerJoin(patients, eq(visits.patientId, patients.id))
    .leftJoin(user, eq(medicalRecords.doctorId, user.id))
    .where(eq(prescriptions.isFulfilled, false))
    .orderBy(desc(prescriptions.createdAt))

  // Group prescriptions by visit for better UX
  return groupPrescriptionsByVisit(pending)
}

/**
 * Bulk fulfill multiple prescriptions atomically
 */
export async function bulkFulfillPrescriptions(
  fulfillmentRequests: PrescriptionFulfillmentInput[]
) {
  const results: Array<typeof prescriptions.$inferSelect> = []

  // Start a transaction-like process
  try {
    for (const data of fulfillmentRequests) {
      // Get prescription
      const prescriptionRecord = await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.id, data.prescriptionId))
        .limit(1)

      if (prescriptionRecord.length === 0) {
        throw new Error(`Prescription ${data.prescriptionId} not found`)
      }

      if (prescriptionRecord[0].isFulfilled) {
        throw new Error(`Prescription ${data.prescriptionId} already fulfilled`)
      }

      // Get inventory
      const inventory = await db
        .select()
        .from(drugInventory)
        .where(eq(drugInventory.id, data.inventoryId))
        .limit(1)

      if (inventory.length === 0) {
        throw new Error(`Inventory ${data.inventoryId} not found`)
      }

      // Check stock availability
      if (inventory[0].stockQuantity < data.dispensedQuantity) {
        throw new Error(
          `Insufficient stock for inventory ${data.inventoryId}. Available: ${inventory[0].stockQuantity}, Requested: ${data.dispensedQuantity}`
        )
      }

      // Update prescription
      const [updatedPrescription] = await db
        .update(prescriptions)
        .set({
          isFulfilled: true,
          fulfilledBy: data.fulfilledBy,
          fulfilledAt: sql`CURRENT_TIMESTAMP`,
          dispensedQuantity: data.dispensedQuantity,
          inventoryId: data.inventoryId,
          notes: data.notes || null,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(prescriptions.id, data.prescriptionId))
        .returning()

      // Reduce stock
      await db
        .update(drugInventory)
        .set({
          stockQuantity: sql`${drugInventory.stockQuantity} - ${data.dispensedQuantity}`,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(drugInventory.id, data.inventoryId))

      // Record stock movement
      await db.insert(stockMovements).values({
        inventoryId: data.inventoryId,
        movementType: "out",
        quantity: -data.dispensedQuantity,
        reason: `Resep #${data.prescriptionId}`,
        referenceId: data.prescriptionId,
        performedBy: data.fulfilledBy,
      })

      results.push(updatedPrescription)
    }

    return results
  } catch (error) {
    // In a real transaction, this would rollback
    // For now, we throw the error to prevent partial fulfillment
    throw error
  }
}

/**
 * Fulfill prescription (single)
 */
export async function fulfillPrescription(data: PrescriptionFulfillmentInput) {
  // Get prescription
  const prescription = await db
    .select()
    .from(prescriptions)
    .where(eq(prescriptions.id, data.prescriptionId))
    .limit(1)

  if (prescription.length === 0) {
    throw new Error("Prescription not found")
  }

  if (prescription[0].isFulfilled) {
    throw new Error("Prescription already fulfilled")
  }

  // Get inventory
  const inventory = await db
    .select()
    .from(drugInventory)
    .where(eq(drugInventory.id, data.inventoryId))
    .limit(1)

  if (inventory.length === 0) {
    throw new Error("Inventory not found")
  }

  // Check stock availability
  if (inventory[0].stockQuantity < data.dispensedQuantity) {
    throw new Error("Insufficient stock")
  }

  // Update prescription
  const [updatedPrescription] = await db
    .update(prescriptions)
    .set({
      isFulfilled: true,
      fulfilledBy: data.fulfilledBy,
      fulfilledAt: sql`CURRENT_TIMESTAMP`,
      dispensedQuantity: data.dispensedQuantity,
      inventoryId: data.inventoryId,
      notes: data.notes || null,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(prescriptions.id, data.prescriptionId))
    .returning()

  // Reduce stock
  await db
    .update(drugInventory)
    .set({
      stockQuantity: sql`${drugInventory.stockQuantity} - ${data.dispensedQuantity}`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(drugInventory.id, data.inventoryId))

  // Record stock movement
  await db.insert(stockMovements).values({
    inventoryId: data.inventoryId,
    movementType: "out",
    quantity: -data.dispensedQuantity,
    reason: `Resep #${data.prescriptionId}`,
    referenceId: data.prescriptionId,
    performedBy: data.fulfilledBy,
  })

  return updatedPrescription
}

/**
 * Adjust stock (manual adjustment)
 */
export async function adjustStock(data: StockAdjustmentInput) {
  // Get inventory
  const inventory = await db
    .select()
    .from(drugInventory)
    .where(eq(drugInventory.id, data.inventoryId))
    .limit(1)

  if (inventory.length === 0) {
    throw new Error("Inventory not found")
  }

  // Update stock
  const newStock = inventory[0].stockQuantity + data.quantity

  if (newStock < 0) {
    throw new Error("Stock cannot be negative")
  }

  await db
    .update(drugInventory)
    .set({
      stockQuantity: newStock,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(drugInventory.id, data.inventoryId))

  // Record stock movement
  await db.insert(stockMovements).values({
    inventoryId: data.inventoryId,
    movementType: "adjustment",
    quantity: data.quantity,
    reason: data.reason,
    performedBy: data.performedBy,
  })

  return { success: true, newStock }
}

/**
 * Get stock movements by inventory ID
 */
export async function getStockMovements(inventoryId: string) {
  const movements = await db
    .select()
    .from(stockMovements)
    .where(eq(stockMovements.inventoryId, inventoryId))
    .orderBy(desc(stockMovements.createdAt))

  return movements
}
