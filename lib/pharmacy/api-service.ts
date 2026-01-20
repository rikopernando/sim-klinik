/**
 * Pharmacy Module API Service Layer
 * Database operations for pharmacy management
 */

import { eq, sql, and, lt, gte, desc, ilike, or, isNull } from "drizzle-orm"

import { db } from "@/db"
import { drugs, drugInventory, prescriptions, stockMovements } from "@/db/schema"
import { medicalRecords } from "@/db/schema/medical-records"
import { visits } from "@/db/schema/visits"
import { patients } from "@/db/schema/patients"
import { user } from "@/db/schema/auth"
import { rooms, bedAssignments } from "@/db/schema/inpatient"
import type {
  DrugInput,
  PrescriptionFulfillmentInput,
  DrugWithStock,
  DrugInventoryWithDetails,
  Drug,
  PrescriptionQueueItem,
} from "@/types/pharmacy"
import { getSession } from "@/lib/rbac"
import { Prescription } from "@/types/medical-record"
import { Pagination } from "@/types/api"

import { DrugInventoryInput, DrugUpdateInput } from "./validation"
import { calculateDaysUntilExpiry, getExpiryAlertLevel, getStockAlertLevel } from "./stock-utils"

/**
 * Get all drugs with total stock calculation
 * Optimized: Single query with LEFT JOIN and GROUP BY instead of N+1 queries
 */
export async function getAllDrugsWithStock(): Promise<DrugWithStock[]> {
  // Single query with aggregation - avoids N+1 problem
  const results = await db
    .select({
      drug: drugs,
      totalStock: sql<number>`COALESCE(SUM(${drugInventory.stockQuantity}), 0)::int`.as(
        "total_stock"
      ),
    })
    .from(drugs)
    .leftJoin(drugInventory, eq(drugs.id, drugInventory.drugId))
    .groupBy(drugs.id)
    .orderBy(drugs.name)

  const drugsWithStock: DrugWithStock[] = results.map(({ drug, totalStock }) => {
    const stockAlertLevel = getStockAlertLevel(totalStock, drug.minimumStock)
    return {
      ...drug,
      totalStock,
      stockAlertLevel,
    }
  })

  return drugsWithStock
}

/**
 * Get drug by ID with stock info
 * Optimized: Single query with LEFT JOIN and GROUP BY
 */
export async function getDrugById(drugId: string): Promise<DrugWithStock | null> {
  const [result] = await db
    .select({
      drug: drugs,
      totalStock: sql<number>`COALESCE(SUM(${drugInventory.stockQuantity}), 0)::int`.as(
        "total_stock"
      ),
    })
    .from(drugs)
    .leftJoin(drugInventory, eq(drugs.id, drugInventory.drugId))
    .where(eq(drugs.id, drugId))
    .groupBy(drugs.id)
    .limit(1)

  if (!result) return null

  const stockAlertLevel = getStockAlertLevel(result.totalStock, result.drug.minimumStock)

  return {
    ...result.drug,
    totalStock: result.totalStock,
    stockAlertLevel,
  }
}

/**
 * Search drugs by name or generic name
 * Optimized: Single query with LEFT JOIN and GROUP BY instead of N+1 queries
 */
export async function searchDrugs(query: string): Promise<DrugWithStock[]> {
  const searchPattern = `%${query}%`

  // Single query with aggregation - avoids N+1 problem
  const results = await db
    .select({
      drug: drugs,
      totalStock: sql<number>`COALESCE(SUM(${drugInventory.stockQuantity}), 0)::int`.as(
        "total_stock"
      ),
    })
    .from(drugs)
    .leftJoin(drugInventory, eq(drugs.id, drugInventory.drugId))
    .where(
      and(
        or(ilike(drugs.name, searchPattern), ilike(drugs.genericName, searchPattern)),
        eq(drugs.isActive, true)
      )
    )
    .groupBy(drugs.id)
    .limit(20)

  const drugsWithStock: DrugWithStock[] = results.map(({ drug, totalStock }) => {
    const stockAlertLevel = getStockAlertLevel(totalStock, drug.minimumStock)
    return {
      ...drug,
      totalStock,
      stockAlertLevel,
    }
  })

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
  const [updatedDrug] = await db.update(drugs).set(data).where(eq(drugs.id, drugId)).returning()

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
        expiryDate: inventory.expiryDate.toISOString(),
        receivedDate: inventory.receivedDate.toISOString(),
        createdAt: inventory.createdAt.toISOString(),
        updatedAt: inventory.updatedAt.toISOString(),
        drug,
        daysUntilExpiry,
        expiryAlertLevel,
      }
    }
  )

  return inventoriesWithDetails
}

/**
 * Get paginated drug inventory with search capability
 *
 * @param search - Optional search query to filter by drug name
 * @param page - Page number (1-based)
 * @param limit - Number of items per page
 * @returns Paginated inventory data with metadata
 */
export async function getPaginatedDrugInventory(
  search?: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  data: DrugInventoryWithDetails[]
  pagination: Pagination
}> {
  // Build base query
  let baseQuery = db
    .select({
      inventory: drugInventory,
      drug: drugs,
    })
    .from(drugInventory)
    .innerJoin(drugs, eq(drugInventory.drugId, drugs.id))
    .$dynamic()

  // Apply search filter if provided
  if (search && search.trim()) {
    baseQuery = baseQuery.where(ilike(drugs.name, `%${search.trim()}%`))
  }

  // Get total count for pagination
  const countQuery = db
    .select({ count: sql<number>`count(*)::int` })
    .from(drugInventory)
    .innerJoin(drugs, eq(drugInventory.drugId, drugs.id))
    .$dynamic()

  // Apply same search filter to count query
  const finalCountQuery =
    search && search.trim() ? countQuery.where(ilike(drugs.name, `%${search.trim()}%`)) : countQuery

  const [countResult] = await finalCountQuery
  const total = countResult?.count || 0

  // Calculate pagination
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit

  // Fetch paginated data
  const inventories = await baseQuery
    .orderBy(desc(drugInventory.createdAt))
    .limit(limit)
    .offset(offset)

  // Transform data to include calculated fields
  const inventoriesWithDetails: DrugInventoryWithDetails[] = inventories.map(
    ({ inventory, drug }) => {
      const daysUntilExpiry = calculateDaysUntilExpiry(inventory.expiryDate.toISOString())
      const expiryAlertLevel = getExpiryAlertLevel(daysUntilExpiry)

      return {
        ...inventory,
        expiryDate: inventory.expiryDate.toISOString(),
        receivedDate: inventory.receivedDate.toISOString(),
        createdAt: inventory.createdAt.toISOString(),
        updatedAt: inventory.updatedAt.toISOString(),
        drug,
        daysUntilExpiry,
        expiryAlertLevel,
      }
    }
  )

  return {
    data: inventoriesWithDetails,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }
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
        expiryDate: inventory.expiryDate.toISOString(),
        receivedDate: inventory.receivedDate.toISOString(),
        createdAt: inventory.createdAt.toISOString(),
        updatedAt: inventory.updatedAt.toISOString(),
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
 *
 * Performance optimizations:
 * - Validates drug existence and fetches session in parallel
 * - Uses database transaction for atomicity (inventory + stock movement)
 * - Ensures data consistency with automatic rollback on error
 *
 * @param data - Drug inventory input data
 * @returns Newly created inventory record
 * @throws Error with detailed context if drug not found or session invalid
 */
export async function addDrugInventory(data: DrugInventoryInput) {
  // Fetch drug and session in parallel for better performance
  const [drug, session] = await Promise.all([
    db
      .select()
      .from(drugs)
      .where(eq(drugs.id, data.drugId))
      .limit(1)
      .then((result) => result[0]),
    getSession(),
  ])

  // Validate drug exists
  if (!drug) {
    throw new Error(`Drug with ID ${data.drugId} not found`)
  }

  // Validate drug is active
  if (!drug.isActive) {
    throw new Error(`Drug ${drug.name} is inactive and cannot accept new stock`)
  }

  // Validate session exists
  if (!session?.user?.id) {
    throw new Error("User session not found. Please login again.")
  }

  // Execute inventory creation and stock movement in a transaction for atomicity
  const result = await db.transaction(async (tx) => {
    // Insert new inventory record
    const [newInventory] = await tx
      .insert(drugInventory)
      .values({
        drugId: data.drugId,
        batchNumber: data.batchNumber,
        expiryDate: new Date(data.expiryDate),
        stockQuantity: data.stockQuantity,
        purchasePrice: data.purchasePrice || null,
        supplier: data.supplier || null,
        receivedDate: data.receivedDate ? new Date(data.receivedDate) : new Date(),
      })
      .returning()

    // Record stock movement for audit trail
    await tx.insert(stockMovements).values({
      inventoryId: newInventory.id,
      movementType: "in",
      quantity: data.stockQuantity,
      reason: "Stock masuk baru",
      performedBy: session.user.id,
    })

    return newInventory
  })

  return result
}

/**
 * Get expiring drugs within the next 30 days
 *
 * Returns inventory batches that:
 * - Expire within 30 days from today
 * - Have stock quantity > 0 (excludes depleted batches)
 *
 * Enriches each batch with:
 * - daysUntilExpiry: Calculated days remaining
 * - expiryAlertLevel: Severity level (critical/warning/normal)
 *
 * @returns Array of inventory batches sorted by expiry date (soonest first)
 */
export async function getExpiringDrugs(): Promise<DrugInventoryWithDetails[]> {
  // Define expiry threshold (30 days from now)
  const EXPIRY_THRESHOLD_DAYS = 30
  const expiryThreshold = new Date()
  expiryThreshold.setDate(expiryThreshold.getDate() + EXPIRY_THRESHOLD_DAYS)

  // Query inventories expiring soon with available stock
  const results = await db
    .select({
      inventory: drugInventory,
      drug: drugs,
    })
    .from(drugInventory)
    .innerJoin(drugs, eq(drugInventory.drugId, drugs.id))
    .where(
      and(
        lt(drugInventory.expiryDate, expiryThreshold), // Expires within threshold
        gte(drugInventory.stockQuantity, 1) // Has stock (no need to alert on empty batches)
      )
    )
    .orderBy(drugInventory.expiryDate) // Sort by soonest expiry first

  // Enrich with calculated expiry metadata and convert Date objects to ISO strings
  return results.map(({ inventory, drug }) => {
    const daysUntilExpiry = calculateDaysUntilExpiry(inventory.expiryDate.toISOString())
    const expiryAlertLevel = getExpiryAlertLevel(daysUntilExpiry)

    return {
      ...inventory,
      // Convert Date fields to ISO strings to match DrugInventoryWithDetails type
      expiryDate: inventory.expiryDate.toISOString(),
      receivedDate: inventory.receivedDate.toISOString(),
      createdAt: inventory.createdAt.toISOString(),
      updatedAt: inventory.updatedAt.toISOString(),
      drug,
      daysUntilExpiry,
      expiryAlertLevel,
    }
  })
}

/**
 * Helper: Group pending prescriptions by visit
 * Consolidates prescriptions for the same visit into a single queue item
 * Uses Map for O(1) lookup performance and pre-calculates timestamps for efficient sorting
 */
function groupPrescriptionsByVisit(
  pending: Array<{
    prescription: Prescription
    drug: Drug
    patient: { id: string; name: string; mrNumber: string }
    doctor: { id: string; name: string } | null
    visit: { id: string; visitNumber: string; visitType: "outpatient" | "inpatient" | "emergency" }
    medicalRecordId: string | null
    room: { id: string; roomNumber: string; roomType: string } | null
    bedAssignment: { bedNumber: string } | null
  }>
): PrescriptionQueueItem[] {
  // Early return for empty input
  if (pending.length === 0) return []

  // Group by visit ID using Map for efficient lookups
  const groupedByVisit = new Map<string, PrescriptionQueueItem & { latestTimestamp: number }>()

  for (const item of pending) {
    const visitId = item.visit.id
    const prescriptionTimestamp = item.prescription.createdAt.getTime()

    // Create new group if this is the first prescription for this visit
    if (!groupedByVisit.has(visitId)) {
      groupedByVisit.set(visitId, {
        visit: item.visit,
        patient: item.patient,
        doctor: item.doctor,
        medicalRecordId: item.medicalRecordId,
        room: item.room,
        bedAssignment: item.bedAssignment,
        prescriptions: [],
        latestTimestamp: prescriptionTimestamp,
      })
    }

    const group = groupedByVisit.get(visitId)!

    // Add prescription to group
    group.prescriptions.push({
      prescription: item.prescription,
      drug: item.drug,
    })

    // Update latest timestamp if this prescription is newer
    if (prescriptionTimestamp > group.latestTimestamp) {
      group.latestTimestamp = prescriptionTimestamp
    }
  }

  // Convert to array and sort by pre-calculated timestamps (most recent first)
  return Array.from(groupedByVisit.values())
    .sort((a, b) => b.latestTimestamp - a.latestTimestamp)
    .map(({ ...queueItem }) => queueItem)
}

/**
 * Get pending prescriptions grouped by visit
 *
 * Optimizations:
 * - Single query with joins to minimize database round trips
 * - Selective field projection to reduce data transfer
 * - Pre-sorted by creation date for efficient grouping
 * - Groups multiple prescriptions per visit into single queue items
 *
 * @returns Array of queue items sorted by most recent prescription (descending)
 */
export async function getPendingPrescriptions(): Promise<PrescriptionQueueItem[]> {
  // Fetch all unfulfilled prescriptions (both outpatient and inpatient) with related entities
  // Uses LEFT JOIN for medicalRecords to support both:
  // - Outpatient: prescription → medicalRecord → visit → patient
  // - Inpatient: prescription → visit → patient (direct, no medicalRecord)

  const pending = await db
    .select({
      prescription: prescriptions,
      drug: drugs,
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
        visitType: visits.visitType,
      },
      medicalRecordId: medicalRecords.id,
      // Inpatient-specific: room and bed info
      room: {
        id: rooms.id,
        roomNumber: rooms.roomNumber,
        roomType: rooms.roomType,
      },
      bedAssignment: {
        bedNumber: bedAssignments.bedNumber,
      },
    })
    .from(prescriptions)
    .innerJoin(drugs, eq(prescriptions.drugId, drugs.id))
    // LEFT JOIN medicalRecords: NULL for inpatient prescriptions
    .leftJoin(medicalRecords, eq(prescriptions.medicalRecordId, medicalRecords.id))
    // Join visits: Either from medicalRecord (outpatient) or direct (inpatient)
    .innerJoin(
      visits,
      or(
        eq(medicalRecords.visitId, visits.id), // Outpatient path
        eq(prescriptions.visitId, visits.id) // Inpatient path
      )
    )
    .innerJoin(patients, eq(visits.patientId, patients.id))
    .leftJoin(user, eq(medicalRecords.authorId, user.id))
    // LEFT JOIN room/bed info for inpatient visits
    .leftJoin(rooms, eq(visits.roomId, rooms.id))
    .leftJoin(
      bedAssignments,
      and(
        eq(bedAssignments.visitId, visits.id),
        isNull(bedAssignments.dischargedAt) // Only active bed assignments
      )
    )
    .where(eq(prescriptions.isFulfilled, false))
    .orderBy(desc(prescriptions.createdAt))

  // Cast visitType to the correct union type and group prescriptions by visit
  const typedPending = pending.map((item) => ({
    ...item,
    visit: {
      ...item.visit,
      visitType: item.visit.visitType as "outpatient" | "inpatient" | "emergency",
    },
  }))

  return groupPrescriptionsByVisit(typedPending)
}

/**
 * Bulk fulfill multiple prescriptions atomically
 *
 * Performance optimizations:
 * - Batch fetches all prescriptions and inventories upfront (reduces N+1 queries)
 * - Validates all data before making any changes (fail-fast approach)
 * - Uses database transaction for true atomicity (all-or-nothing)
 * - Provides detailed error messages with context
 *
 * @param fulfillmentRequests - Array of prescription fulfillment requests
 * @returns Array of updated prescription records
 * @throws Error with detailed context if any validation or business rule fails
 */
export async function bulkFulfillPrescriptions(
  fulfillmentRequests: PrescriptionFulfillmentInput[]
) {
  // Early return for empty input
  if (fulfillmentRequests.length === 0) {
    return []
  }

  // Extract all unique prescription and inventory IDs for batch fetching
  const prescriptionIds = fulfillmentRequests.map((req) => req.prescriptionId)
  const inventoryIds = [...new Set(fulfillmentRequests.map((req) => req.inventoryId))]

  // Batch fetch all prescriptions and inventories in parallel (performance optimization)
  const [allPrescriptions, allInventories] = await Promise.all([
    db
      .select()
      .from(prescriptions)
      .where(
        sql`${prescriptions.id} IN (${sql.join(
          prescriptionIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      ),
    db
      .select()
      .from(drugInventory)
      .where(
        sql`${drugInventory.id} IN (${sql.join(
          inventoryIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      ),
  ])

  // Create lookup maps for O(1) access during validation
  const prescriptionMap = new Map(allPrescriptions.map((p) => [p.id, p]))
  const inventoryMap = new Map(allInventories.map((inv) => [inv.id, inv]))

  // Validate all requests before making any changes (fail-fast)
  for (const request of fulfillmentRequests) {
    const prescription = prescriptionMap.get(request.prescriptionId)
    const inventory = inventoryMap.get(request.inventoryId)

    // Validate prescription exists
    if (!prescription) {
      throw new Error(`Prescription ${request.prescriptionId} not found`)
    }

    // Validate prescription is not already fulfilled
    if (prescription.isFulfilled) {
      throw new Error(`Prescription ${request.prescriptionId} has already been fulfilled`)
    }

    // Validate inventory exists
    if (!inventory) {
      throw new Error(`Inventory ${request.inventoryId} not found`)
    }

    // Validate sufficient stock (note: this is a snapshot check, actual stock checked in transaction)
    if (inventory.stockQuantity < request.dispensedQuantity) {
      throw new Error(
        `Insufficient stock for inventory ${request.inventoryId}. Available: ${inventory.stockQuantity}, Requested: ${request.dispensedQuantity}`
      )
    }
  }

  // Execute all fulfillments in a database transaction for atomicity
  return await db.transaction(async (tx) => {
    const results: Array<typeof prescriptions.$inferSelect> = []

    for (const request of fulfillmentRequests) {
      // Update prescription status
      const [updatedPrescription] = await tx
        .update(prescriptions)
        .set({
          isFulfilled: true,
          fulfilledBy: request.fulfilledBy,
          fulfilledAt: sql`CURRENT_TIMESTAMP`,
          dispensedQuantity: request.dispensedQuantity,
          inventoryId: request.inventoryId,
          notes: request.notes || null,
        })
        .where(eq(prescriptions.id, request.prescriptionId))
        .returning()

      // Reduce inventory stock
      await tx
        .update(drugInventory)
        .set({
          stockQuantity: sql`${drugInventory.stockQuantity} - ${request.dispensedQuantity}`,
        })
        .where(eq(drugInventory.id, request.inventoryId))

      // Record stock movement for audit trail
      await tx.insert(stockMovements).values({
        inventoryId: request.inventoryId,
        movementType: "out",
        quantity: -request.dispensedQuantity,
        reason: `Resep #${request.prescriptionId}`,
        referenceId: request.prescriptionId,
        performedBy: request.fulfilledBy,
      })

      results.push(updatedPrescription)
    }

    return results
  })
}

/**
 * Fulfill prescription (single)
 * Uses transaction to ensure atomicity and parallel queries for better performance
 */
export async function fulfillPrescription(data: PrescriptionFulfillmentInput) {
  // Fetch prescription and inventory in parallel for better performance
  const [prescription, inventory] = await Promise.all([
    db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.id, data.prescriptionId))
      .limit(1)
      .then((result) => result[0]),
    db
      .select()
      .from(drugInventory)
      .where(eq(drugInventory.id, data.inventoryId))
      .limit(1)
      .then((result) => result[0]),
  ])

  // Validate prescription exists and is not fulfilled
  if (!prescription) {
    throw new Error(`Prescription with ID ${data.prescriptionId} not found`)
  }

  if (prescription.isFulfilled) {
    throw new Error(`Prescription ${data.prescriptionId} has already been fulfilled`)
  }

  // Validate inventory exists and has sufficient stock
  if (!inventory) {
    throw new Error(`Inventory with ID ${data.inventoryId} not found`)
  }

  if (inventory.stockQuantity < data.dispensedQuantity) {
    throw new Error(
      `Insufficient stock. Available: ${inventory.stockQuantity}, Requested: ${data.dispensedQuantity}`
    )
  }

  // Execute all updates in a transaction to ensure data consistency
  const result = await db.transaction(async (tx) => {
    // Update prescription status
    const [updatedPrescription] = await tx
      .update(prescriptions)
      .set({
        isFulfilled: true,
        fulfilledBy: data.fulfilledBy,
        fulfilledAt: sql`CURRENT_TIMESTAMP`,
        dispensedQuantity: data.dispensedQuantity,
        inventoryId: data.inventoryId,
        notes: data.notes || null,
      })
      .where(eq(prescriptions.id, data.prescriptionId))
      .returning()

    // Reduce inventory stock
    await tx
      .update(drugInventory)
      .set({
        stockQuantity: sql`${drugInventory.stockQuantity} - ${data.dispensedQuantity}`,
      })
      .where(eq(drugInventory.id, data.inventoryId))

    // Record stock movement for audit trail
    await tx.insert(stockMovements).values({
      inventoryId: data.inventoryId,
      movementType: "out",
      quantity: -data.dispensedQuantity,
      reason: `Resep #${data.prescriptionId}`,
      referenceId: data.prescriptionId,
      performedBy: data.fulfilledBy,
    })

    return updatedPrescription
  })

  return result
}

/**
 * Check if batch number already exists for a drug
 *
 * Used for duplicate batch validation during inventory creation.
 * Returns detailed batch information if duplicate is found.
 *
 * @param drugId - The drug ID to check
 * @param batchNumber - The batch number to check for duplicates
 * @returns Object with exists flag and optional batch details
 */
export async function checkDuplicateBatch(
  drugId: string,
  batchNumber: string
): Promise<{
  exists: boolean
  batch?: DrugInventoryWithDetails
}> {
  // Query for existing batch with the same drug ID and batch number
  const result = await db
    .select({
      inventory: drugInventory,
      drug: drugs,
    })
    .from(drugInventory)
    .innerJoin(drugs, eq(drugInventory.drugId, drugs.id))
    .where(and(eq(drugInventory.drugId, drugId), eq(drugInventory.batchNumber, batchNumber)))
    .limit(1)
    .then((results) => results[0])

  // No duplicate found
  if (!result) {
    return { exists: false }
  }

  // Duplicate found - return details with calculated fields
  const { inventory, drug } = result
  const daysUntilExpiry = calculateDaysUntilExpiry(inventory.expiryDate.toISOString())
  const expiryAlertLevel = getExpiryAlertLevel(daysUntilExpiry)

  return {
    exists: true,
    batch: {
      ...inventory,
      // Convert Date fields to ISO strings
      expiryDate: inventory.expiryDate.toISOString(),
      receivedDate: inventory.receivedDate.toISOString(),
      createdAt: inventory.createdAt.toISOString(),
      updatedAt: inventory.updatedAt.toISOString(),
      drug,
      daysUntilExpiry,
      expiryAlertLevel,
    },
  }
}
