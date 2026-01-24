/**
 * Billing Module API Service Layer
 * Database operations for billing, payments, and discharge
 */

import { db, type DbTransaction } from "@/db"
import { services, billings, billingItems, payments, dischargeSummaries } from "@/db/schema/billing"
import { visits } from "@/db/schema/visits"
import { patients } from "@/db/schema/patients"
import { prescriptions, drugs } from "@/db/schema/inventory"
import { medicalRecords, procedures } from "@/db/schema/medical-records"
import { eq, sql, and, desc, or, inArray } from "drizzle-orm"
import type { ServiceInput, ServiceUpdateInput } from "@/types/billing"
import {
  calculateDiscountFromPercentage,
  calculateTotalAmount,
  calculatePatientPayable,
  calculateRemainingAmount,
  determinePaymentStatus,
  calculateChange,
} from "./billing-utils"
import { ProcessPaymentInput } from "./validation"
import { aggregateDischargebilling } from "./discharge-aggregation"

/**
 * Billing Totals Type
 */
type BillingTotals = {
  subtotal: number
  discount: number
  insuranceCoverage: number
  totalAmount: number
  patientPayable: number
  paidAmount: number
  remainingAmount: number
}

/**
 * Billing Item Type
 */
export type BillingItem = {
  itemType: string
  itemId: string | null
  itemName: string
  itemCode: string | null
  quantity: number
  unitPrice: string
  subtotal: string
  discount: string
  totalPrice: string
  description?: string
}

/**
 * Get all services (master data)
 */
export async function getAllServices() {
  const allServices = await db
    .select()
    .from(services)
    .where(eq(services.isActive, true))
    .orderBy(services.category, services.name)

  return allServices
}

/**
 * Get service by ID
 */
export async function getServiceById(serviceId: string) {
  const [service] = await db.select().from(services).where(eq(services.id, serviceId)).limit(1)

  return service || null
}

/**
 * Create new service
 */
export async function createService(data: ServiceInput) {
  const [newService] = await db
    .insert(services)
    .values({
      code: data.code,
      name: data.name,
      serviceType: data.serviceType,
      price: data.price,
      description: data.description || null,
      category: data.category || null,
    })
    .returning()

  return newService
}

/**
 * Update service
 */
export async function updateService(serviceId: string, data: Partial<ServiceUpdateInput>) {
  const [updatedService] = await db
    .update(services)
    .set(data)
    .where(eq(services.id, serviceId))
    .returning()

  if (!updatedService) {
    throw new Error("Service not found")
  }

  return updatedService
}

/**
 * Process payment with discount (merged workflow)
 *
 * Handles discount application and payment processing in a single atomic transaction
 * with optimized single UPDATE query for better performance
 *
 * @param data - Payment and discount data
 * @returns Payment record with change information
 *
 * Features:
 * - Optional discount (nominal or percentage)
 * - Optional insurance coverage
 * - Calculates all totals in memory before database write
 * - Validates payment amount against final total
 * - Calculates change for cash payments
 * - Single UPDATE query for optimal performance
 * - All operations in single database transaction
 *
 * Business Rules:
 * - Only one of discount or discountPercentage should be provided
 * - Payment amount must not exceed remaining balance
 * - For cash payments, amountReceived must be >= amount
 *
 * Performance:
 * - 1 SELECT, 1 INSERT, 1 UPDATE (vs previous 1 SELECT, 1 INSERT, 2 UPDATEs)
 * - All calculations done in memory
 */
export async function processPaymentWithDiscount(data: ProcessPaymentInput) {
  return await db.transaction(async (tx) => {
    // ========================================
    // STEP 1: Fetch current billing record
    // ========================================
    const [billing] = await tx
      .select()
      .from(billings)
      .where(eq(billings.id, data.billingId))
      .limit(1)

    if (!billing) {
      throw new Error("Billing tidak ditemukan")
    }

    // ========================================
    // STEP 2: Calculate discount/insurance totals IN MEMORY
    // (No database write yet - all calculations happen here)
    // ========================================
    let discountAmount = billing.discount || "0"
    let insuranceCoverage = billing.insuranceCoverage || "0"
    let totalAmount = billing.totalAmount
    let patientPayable = billing.patientPayable
    let remainingAmount = billing.remainingAmount || billing.patientPayable
    let discountApplied = false

    // Apply discount/insurance if provided
    if (data.discount || data.discountPercentage || data.insuranceCoverage) {
      // Calculate discount
      if (data.discountPercentage) {
        discountAmount = calculateDiscountFromPercentage(billing.subtotal, data.discountPercentage)
      } else if (data.discount) {
        discountAmount = data.discount
      }

      // Calculate all totals
      const tax = billing.tax || "0"
      totalAmount = calculateTotalAmount(billing.subtotal, discountAmount, tax)
      insuranceCoverage = data.insuranceCoverage || billing.insuranceCoverage || "0"
      patientPayable = calculatePatientPayable(totalAmount, insuranceCoverage)
      const paidAmount = billing.paidAmount || "0"
      remainingAmount = calculateRemainingAmount(patientPayable, paidAmount)

      discountApplied = true
    }

    // ========================================
    // STEP 3: Validate payment amount
    // ========================================
    const paymentAmount = parseFloat(data.amount)
    const remaining = parseFloat(remainingAmount)

    if (paymentAmount < 0) {
      throw new Error("Jumlah pembayaran harus lebih besar dari 0")
    }

    if (paymentAmount > remaining) {
      throw new Error(
        `Jumlah pembayaran (Rp ${paymentAmount.toLocaleString("id-ID")}) melebihi sisa tagihan (Rp ${remaining.toLocaleString("id-ID")})`
      )
    }

    // ========================================
    // STEP 4: Calculate change for cash payments
    // ========================================
    let changeGiven: string | null = null
    if (data.paymentMethod === "cash" && data.amountReceived) {
      changeGiven = calculateChange(data.amountReceived, data.amount)
    }

    // ========================================
    // STEP 5: Insert payment record
    // ========================================
    const [newPayment] = await tx
      .insert(payments)
      .values({
        billingId: data.billingId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference || null,
        amountReceived: data.amountReceived || null,
        changeGiven,
        receivedBy: data.receivedBy,
        notes: data.notes || null,
      })
      .returning()

    // ========================================
    // STEP 6: Calculate final billing state
    // ========================================
    const newPaidAmount = parseFloat(billing.paidAmount) + paymentAmount
    const newRemainingAmount = calculateRemainingAmount(patientPayable, newPaidAmount.toString())
    const newPaymentStatus = determinePaymentStatus(patientPayable, newPaidAmount.toString())

    // ========================================
    // STEP 7: SINGLE UPDATE with all fields
    // (Discount + Insurance + Payment in ONE query)
    // ========================================
    await tx
      .update(billings)
      .set({
        // Discount/insurance fields (only if discount/insurance was applied)
        ...(discountApplied && {
          discount: discountAmount,
          discountPercentage: data.discountPercentage || null,
          insuranceCoverage,
          totalAmount,
          patientPayable,
        }),
        // Payment fields (always updated)
        paidAmount: newPaidAmount.toFixed(2),
        remainingAmount: newRemainingAmount,
        paymentStatus: newPaymentStatus,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference || null,
        // Audit fields
        processedBy: data.receivedBy,
        processedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(billings.id, data.billingId))

    // ========================================
    // STEP 8: UPDATE VISIT STATUS TO PAID
    // ========================================
    await tx
      .update(visits)
      .set({
        status: "paid",
      })
      .where(eq(visits.id, billing.visitId))

    // ========================================
    // STEP 9: Return result
    // ========================================
    return {
      payment: newPayment,
      discountApplied,
      finalTotal: patientPayable,
      paidAmount: newPaidAmount.toFixed(2),
      remainingAmount: newRemainingAmount,
      paymentStatus: newPaymentStatus,
      change: changeGiven,
    }
  })
}

/**
 * Get all pending billings
 */
export async function getPendingBillings() {
  const pendingBills = await db
    .select({
      billing: billings,
      visit: visits,
      patient: patients,
    })
    .from(billings)
    .innerJoin(visits, eq(billings.visitId, visits.id))
    .innerJoin(patients, eq(visits.patientId, patients.id))
    .where(eq(billings.paymentStatus, "pending"))
    .orderBy(desc(billings.createdAt))

  return pendingBills
}

/**
 * Get discharge summary by visit ID
 */
export async function getDischargeSummary(visitId: string) {
  const [summary] = await db
    .select()
    .from(dischargeSummaries)
    .where(eq(dischargeSummaries.visitId, visitId))
    .limit(1)

  return summary || null
}

/**
 * Get billing statistics
 */
export async function getBillingStatistics() {
  // Get all billings
  const allBillings = await db.select().from(billings)

  const stats = {
    totalBillings: allBillings.length,
    pendingBillings: allBillings.filter((b) => b.paymentStatus === "pending").length,
    paidBillings: allBillings.filter((b) => b.paymentStatus === "paid").length,
    partialBillings: allBillings.filter((b) => b.paymentStatus === "partial").length,
    totalRevenue: allBillings.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0).toFixed(2),
    pendingRevenue: allBillings
      .filter((b) => b.paymentStatus !== "paid")
      .reduce((sum, b) => sum + parseFloat(b.remainingAmount || "0"), 0)
      .toFixed(2),
  }

  // Get today's collections
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaysPayments = await db
    .select()
    .from(payments)
    .where(sql`DATE(${payments.receivedAt}) = CURRENT_DATE`)

  const collectedToday = todaysPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2)

  return {
    ...stats,
    collectedToday,
  }
}

/**
 * Get visits ready for billing
 *
 * Fetches visits that meet the billing criteria:
 * - OUTPATIENT: Medical record is locked (RME completed)
 * - INPATIENT: Visit status is 'ready_for_billing' (discharge billing created)
 * - Payment is NOT fully completed (pending, partial, or no billing exists)
 *
 * This is the BILLING QUEUE - shows visits waiting for payment processing
 *
 * @returns Array of visits with patient, billing, and medical record info
 *
 * Business Rules:
 * - OUTPATIENT: Medical record MUST be locked before billing (cashier creates billing)
 * - INPATIENT: Billing MUST be created first, then visit marked as ready_for_billing (cashier processes payment only)
 * - Visits with no billing record are included (outpatient needs billing creation)
 * - Visits with pending or partial payment are included
 * - Visits with fully paid status are excluded
 *
 * Performance optimizations:
 * - Uses LEFT JOIN for optional billing and medical record data
 * - Efficient WHERE clause with indexed columns
 * - Ordered by creation date (newest first)
 */
export async function getVisitsReadyForBilling() {
  const result = await db
    .select({
      visit: visits,
      patient: patients,
      billing: billings,
      medicalRecord: medicalRecords,
    })
    .from(visits)
    .innerJoin(patients, eq(visits.patientId, patients.id))
    .leftJoin(medicalRecords, eq(visits.id, medicalRecords.visitId))
    .leftJoin(billings, eq(visits.id, billings.visitId))
    .where(
      and(
        // Visit must be ready for billing
        // or(
        //   // OUTPATIENT: Medical record must be locked
        //   and(eq(visits.visitType, "outpatient"), eq(medicalRecords.isLocked, true)),
        //   // INPATIENT: Visit status must be ready_for_billing (billing already created)
        //   and(eq(visits.visitType, "inpatient"), eq(visits.status, "ready_for_billing"))
        // ),
        // Payment must be incomplete (pending, partial, or no billing exists)
        eq(visits.status, "billed"),
        or(
          // No billing exists yet (outpatient only - inpatient always has billing)
          sql`${billings.id} IS NULL`,
          // Billing exists but not fully paid
          eq(billings.paymentStatus, "pending"),
          eq(billings.paymentStatus, "partial")
        )
      )
    )
    .orderBy(desc(visits.createdAt))

  return result
}

/**
 * Get billing details with items, patient, and visit info
 *
 * Fetches comprehensive billing information including:
 * - Billing record with totals and payment status
 * - Billing items (services, procedures, medications)
 * - Payment history
 * - Patient and visit information
 *
 * @param visitId - The visit ID to get billing details for
 * @returns Billing details with all related data, or null if not found
 *
 * Performance optimizations:
 * - Parallel fetching of billing and visit data
 * - Early return if billing not found
 * - Efficient joins for related data
 */
export async function getBillingDetails(visitId: string) {
  // Fetch billing and visit info in parallel for better performance
  const [billingResult, visitResult] = await Promise.all([
    db.select().from(billings).where(eq(billings.visitId, visitId)).limit(1),
    db
      .select({
        visit: visits,
        patient: patients,
      })
      .from(visits)
      .innerJoin(patients, eq(visits.patientId, patients.id))
      .where(eq(visits.id, visitId))
      .limit(1),
  ])

  // Early return if billing or visit not found
  if (billingResult.length === 0 || visitResult.length === 0) {
    return null
  }

  const billing = billingResult[0]
  const { visit, patient } = visitResult[0]

  // Fetch billing items and payments in parallel
  const [items, paymentHistory] = await Promise.all([
    db
      .select()
      .from(billingItems)
      .where(eq(billingItems.billingId, billing.id))
      .orderBy(billingItems.id),
    db
      .select()
      .from(payments)
      .where(eq(payments.billingId, billing.id))
      .orderBy(desc(payments.createdAt)),
  ])

  return {
    billing,
    items,
    payments: paymentHistory,
    patient: {
      name: patient.name,
      mrNumber: patient.mrNumber,
    },
    visit: {
      visitNumber: visit.visitNumber,
      createdAt: visit.createdAt,
    },
  }
}

/**
 * Helper: Create billing item for drug
 */
function createDrugBillingItem(
  drug: { id: string; name: string; price: string },
  quantity: number,
  description: string
): BillingItem {
  const unitPrice = parseFloat(drug.price)
  const itemSubtotal = quantity * unitPrice
  return {
    itemType: "drug",
    itemId: drug.id,
    itemName: drug.name,
    itemCode: null,
    quantity,
    unitPrice: drug.price,
    subtotal: itemSubtotal.toFixed(2),
    discount: "0.00",
    totalPrice: itemSubtotal.toFixed(2),
    description,
  }
}

/**
 * Helper: Create billing item from service
 */
function createServiceBillingItem(
  service: { id: string; name: string; code: string | null; price: string },
  description: string
): BillingItem {
  const price = parseFloat(service.price)
  return {
    itemType: "service",
    itemId: service.id,
    itemName: service.name,
    itemCode: service.code,
    quantity: 1,
    unitPrice: service.price,
    subtotal: price.toFixed(2),
    discount: "0.00",
    totalPrice: price.toFixed(2),
    description,
  }
}

/**
 * Calculate total billing for a visit
 * Aggregates costs from: admin fee, consultation, procedures, medications, lab orders
 */
export async function calculateBillingForVisit(visitId: string) {
  // Validate visit exists
  const visitResult = await db.select().from(visits).where(eq(visits.id, visitId)).limit(1)
  if (visitResult.length === 0) {
    throw new Error("Visit not found")
  }

  const items: BillingItem[] = []
  let subtotal = 0

  // Helper to add item and update subtotal
  const addBillingItem = (item: BillingItem) => {
    items.push(item)
    subtotal += parseFloat(item.totalPrice)
  }

  // 1. Add Administration Fee
  const adminService = await db
    .select()
    .from(services)
    .where(and(eq(services.serviceType, "administration"), eq(services.isActive, true)))
    .limit(1)

  if (adminService.length > 0) {
    addBillingItem(createServiceBillingItem(adminService[0], "Biaya administrasi pendaftaran"))
  }

  // 2. Add Doctor Consultation Fee
  const consultationService = await db
    .select()
    .from(services)
    .where(and(eq(services.serviceType, "consultation"), eq(services.isActive, true)))
    .limit(1)

  if (consultationService.length > 0) {
    addBillingItem(createServiceBillingItem(consultationService[0], "Biaya konsultasi dokter"))
  }

  // 3. Add Medical Procedures - Fixed N+1 query problem
  const proceduresList = await db
    .select({ procedure: procedures })
    .from(procedures)
    .innerJoin(medicalRecords, eq(procedures.medicalRecordId, medicalRecords.id))
    .where(eq(medicalRecords.visitId, visitId))

  if (proceduresList.length > 0) {
    // Collect unique ICD-9 codes, filtering out null values
    const icd9Codes = [
      ...new Set(
        proceduresList
          .map((p) => p.procedure.icd9Code)
          .filter((code): code is string => code !== null)
      ),
    ]

    // Fetch all procedure services in ONE query (only if we have codes)
    const procedureServices =
      icd9Codes.length > 0
        ? await db
            .select()
            .from(services)
            .where(
              and(
                eq(services.serviceType, "procedure"),
                inArray(services.code, icd9Codes),
                eq(services.isActive, true)
              )
            )
        : []

    // Create a Map for O(1) lookup
    const servicesByCode = new Map(procedureServices.map((s) => [s.code, s]))

    // Add billing items for procedures
    for (const { procedure } of proceduresList) {
      const service = servicesByCode.get(procedure.icd9Code || "")
      if (service) {
        addBillingItem(createServiceBillingItem(service, procedure.description || ""))
      }
    }
  }

  // 4. Add Medications (all prescribed medications, regardless of fulfillment status)
  const prescriptionsList = await db
    .select({
      prescription: prescriptions,
      drug: drugs,
    })
    .from(prescriptions)
    .innerJoin(drugs, eq(prescriptions.drugId, drugs.id))
    .innerJoin(medicalRecords, eq(prescriptions.medicalRecordId, medicalRecords.id))
    .where(eq(medicalRecords.visitId, visitId))

  for (const { prescription, drug } of prescriptionsList) {
    // Use prescribed quantity for billing (not dispensed quantity)
    // Billing reflects what doctor prescribed, fulfillment is separate
    const quantity = prescription.quantity
    const description = `${prescription.dosage}, ${prescription.frequency}`
    addBillingItem(createDrugBillingItem(drug, quantity, description))
  }

  // 5. Add Laboratory Tests (only verified lab orders)
  const { labOrders: labOrdersTable, labTests } = await import("@/db/schema/laboratory")

  const labOrdersList = await db
    .select({
      labOrder: labOrdersTable,
      test: {
        name: labTests.name,
        code: labTests.code,
      },
    })
    .from(labOrdersTable)
    .leftJoin(labTests, eq(labOrdersTable.testId, labTests.id))
    .where(
      and(
        eq(labOrdersTable.visitId, visitId),
        eq(labOrdersTable.status, "verified") // Only verified lab orders
      )
    )

  for (const { labOrder, test } of labOrdersList) {
    const price = parseFloat(labOrder.price)
    const testName = test?.name || "Lab Test"
    const testCode = test?.code || null

    addBillingItem({
      itemType: "laboratory",
      itemId: labOrder.id,
      itemName: testName,
      itemCode: testCode,
      quantity: 1,
      unitPrice: labOrder.price,
      subtotal: price.toFixed(2),
      discount: "0.00",
      totalPrice: price.toFixed(2),
      description: labOrder.orderNumber || undefined,
    })
  }

  return {
    visitId,
    items,
    subtotal: subtotal.toFixed(2),
    totalAmount: subtotal.toFixed(2),
  }
}

/**
 * Create billing record from medical record
 * Simple function to create initial billing when medical record is locked
 * @param visitId - The visit ID
 * @param tx - Optional transaction object for atomic operations
 */
export async function createBillingFromMedicalRecord(
  visitId: string,
  tx?: DbTransaction
): Promise<string> {
  const dbInstance = tx || db

  // Calculate billing items and totals
  const calculation = await calculateBillingForVisit(visitId)
  const subtotal = parseFloat(calculation.subtotal)

  // Create billing record
  const [billing] = await dbInstance
    .insert(billings)
    .values({
      visitId,
      subtotal: subtotal.toFixed(2),
      discount: "0.00",
      discountPercentage: null,
      tax: "0.00",
      insuranceCoverage: "0.00",
      totalAmount: subtotal.toFixed(2),
      patientPayable: subtotal.toFixed(2),
      paidAmount: "0.00",
      remainingAmount: subtotal.toFixed(2),
      paymentStatus: "pending",
    })
    .returning()

  // Insert billing items
  if (calculation.items.length > 0) {
    await dbInstance.insert(billingItems).values(
      calculation.items.map((item) => ({
        billingId: billing.id,
        ...item,
      }))
    )
  }

  return billing.id
}

/**
 * Helper: Calculate subtotal from billing items
 */
function calculateSubtotalFromItems(items: Array<{ totalPrice: string }>): number {
  return items.reduce((total, item) => total + parseFloat(item.totalPrice), 0)
}

/**
 * Helper: Calculate billing totals
 */
function calculateBillingTotals(
  subtotal: number,
  discount: number,
  insuranceCoverage: number,
  paidAmount: number
): BillingTotals {
  const totalAmount = subtotal - discount
  const patientPayable = totalAmount - insuranceCoverage
  const remainingAmount = patientPayable - paidAmount

  return {
    subtotal,
    discount,
    insuranceCoverage,
    totalAmount,
    patientPayable,
    paidAmount,
    remainingAmount,
  }
}

/**
 * Recalculate and update existing billing record
 * Used when billing items change (e.g., doctor adds adjustment)
 * @param visitId - The visit ID
 * @param tx - Optional transaction object for atomic operations
 */
export async function recalculateBilling(visitId: string, tx?: DbTransaction): Promise<void> {
  const dbInstance = tx || db

  // Get existing billing
  const existingBilling = await dbInstance.query.billings.findFirst({
    where: eq(billings.visitId, visitId),
  })

  if (!existingBilling) {
    throw new Error("Billing not found for this visit")
  }

  // Get all current billing items
  const items = await dbInstance
    .select()
    .from(billingItems)
    .where(eq(billingItems.billingId, existingBilling.id))

  // Calculate new subtotal from all billing items
  const subtotal = calculateSubtotalFromItems(items)

  // Calculate all billing totals
  const totals = calculateBillingTotals(
    subtotal,
    parseFloat(existingBilling.discount),
    parseFloat(existingBilling.insuranceCoverage || "0"),
    parseFloat(existingBilling.paidAmount)
  )

  // Update billing record with new totals
  await dbInstance
    .update(billings)
    .set({
      subtotal: totals.subtotal.toFixed(2),
      totalAmount: totals.totalAmount.toFixed(2),
      patientPayable: totals.patientPayable.toFixed(2),
      remainingAmount: totals.remainingAmount.toFixed(2),
    })
    .where(eq(billings.id, existingBilling.id))
}

// ============================================================================
// INPATIENT DISCHARGE BILLING
// ============================================================================

/**
 * Create billing for inpatient discharge
 * Aggregates all charges: room, materials, medications, procedures
 *
 * Uses the discharge aggregation utility to collect all billable items
 * from the patient's inpatient stay and creates a comprehensive billing record.
 *
 * @param visitId - The inpatient visit ID
 * @param tx - Optional transaction object for atomic operations
 * @returns Billing ID
 *
 * Business Rules:
 * - Only works for inpatient visits
 * - Automatically aggregates:
 *   - Room charges (daily rate × days stayed)
 *   - Material usage from nursing care
 *   - Fulfilled prescriptions from pharmacy
 *   - Completed medical procedures
 *   - Other billable services
 *
 * Performance:
 * - All aggregations run in parallel
 * - Single transaction for atomicity
 * - Efficient bulk insert for billing items
 */
export async function createInpatientDischargeBilling(
  visitId: string,
  tx?: DbTransaction
): Promise<string> {
  const dbInstance = tx || db

  // Aggregate all discharge charges
  const aggregate = await aggregateDischargebilling(visitId)

  if (aggregate.items.length === 0) {
    throw new Error(
      "Tidak ada item yang dapat ditagihkan. Pastikan pasien memiliki catatan rawat inap."
    )
  }

  // Calculate totals
  const subtotal = parseFloat(aggregate.subtotal)

  // Create billing record
  const [billing] = await dbInstance
    .insert(billings)
    .values({
      visitId,
      subtotal: subtotal.toFixed(2),
      discount: "0.00",
      discountPercentage: null,
      tax: "0.00",
      insuranceCoverage: "0.00",
      totalAmount: subtotal.toFixed(2),
      patientPayable: subtotal.toFixed(2),
      paidAmount: "0.00",
      remainingAmount: subtotal.toFixed(2),
      paymentStatus: "pending",
    })
    .returning()

  // Insert all billing items
  if (aggregate.items.length > 0) {
    await dbInstance.insert(billingItems).values(
      aggregate.items.map((item) => ({
        billingId: billing.id,
        itemType: item.itemType,
        itemId: item.itemId || null,
        itemName: item.itemName,
        itemCode: item.itemCode || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: (parseFloat(item.unitPrice) * item.quantity).toFixed(2),
        discount: item.discount || "0.00",
        totalPrice: item.totalPrice || item.unitPrice,
        description: item.description || null,
      }))
    )
  }

  return billing.id
}
