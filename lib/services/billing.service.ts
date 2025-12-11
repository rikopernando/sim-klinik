/**
 * Billing Service
 * Handles billing operations, cost aggregation, and payment processing
 */

import { eq, and, or, desc, sql, inArray } from "drizzle-orm"

import { db, type DbTransaction } from "@/db"
import { billings, billingItems, payments, services } from "@/db/schema/billing"
import { visits } from "@/db/schema/visits"
import { medicalRecords, procedures } from "@/db/schema/medical-records"
import { drugs, prescriptions } from "@/db/schema/pharmacy"
import { patients } from "@/db/schema/patients"

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
 * Get visits ready for billing (RME locked, not yet paid)
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
        eq(medicalRecords.isLocked, true), // RME must be locked
        or(
          eq(billings.paymentStatus, "pending"),
          eq(billings.paymentStatus, "partial"),
          sql`${billings.id} IS NULL` // Or no billing record exists yet
        )
      )
    )
    .orderBy(desc(visits.createdAt))

  return result
}

/**
 * Calculate total billing for a visit
 * Aggregates costs from: admin fee, consultation, procedures, medications
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
    // Collect unique ICD-9 codes
    const icd9Codes = [...new Set(proceduresList.map((p) => p.procedure.icd9Code))]

    // Fetch all procedure services in ONE query
    const procedureServices = await db
      .select()
      .from(services)
      .where(
        and(
          eq(services.serviceType, "procedure"),
          inArray(services.code, icd9Codes),
          eq(services.isActive, true)
        )
      )

    // Create a Map for O(1) lookup
    const servicesByCode = new Map(procedureServices.map((s) => [s.code, s]))

    // Add billing items for procedures
    for (const { procedure } of proceduresList) {
      const service = servicesByCode.get(procedure.icd9Code)
      if (service) {
        addBillingItem(createServiceBillingItem(service, procedure.description || ""))
      }
    }
  }

  // 4. Add Medications (only fulfilled prescriptions)
  const prescriptionsList = await db
    .select({
      prescription: prescriptions,
      drug: drugs,
    })
    .from(prescriptions)
    .innerJoin(drugs, eq(prescriptions.drugId, drugs.id))
    .innerJoin(medicalRecords, eq(prescriptions.medicalRecordId, medicalRecords.id))
    .where(and(eq(medicalRecords.visitId, visitId), eq(prescriptions.isFulfilled, true)))

  for (const { prescription, drug } of prescriptionsList) {
    const quantity = prescription.dispensedQuantity || prescription.quantity
    const description = `${prescription.dosage}, ${prescription.frequency}`
    addBillingItem(createDrugBillingItem(drug, quantity, description))
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

/**
 * Create or update billing record for a visit
 */
export async function createOrUpdateBilling(
  visitId: string,
  userId: string,
  options?: {
    discount?: number
    discountPercentage?: number
    insuranceCoverage?: number
  }
) {
  // Calculate billing
  const calculation = await calculateBillingForVisit(visitId)
  const subtotal = parseFloat(calculation.subtotal)

  // Calculate discount
  let discount = options?.discount || 0
  if (options?.discountPercentage) {
    discount = subtotal * (options.discountPercentage / 100)
  }

  const insuranceCoverage = options?.insuranceCoverage || 0
  const totalAmount = subtotal - discount
  const patientPayable = totalAmount - insuranceCoverage

  // Check if billing exists
  const existingBilling = await db.query.billings.findFirst({
    where: eq(billings.visitId, visitId),
  })

  let billingId: string

  if (existingBilling) {
    // Update existing billing
    await db
      .update(billings)
      .set({
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        discountPercentage: options?.discountPercentage?.toFixed(2) || null,
        insuranceCoverage: insuranceCoverage.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        patientPayable: patientPayable.toFixed(2),
        remainingAmount: (patientPayable - parseFloat(existingBilling.paidAmount)).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(billings.id, existingBilling.id))

    billingId = existingBilling.id
  } else {
    // Create new billing
    const [newBilling] = await db
      .insert(billings)
      .values({
        visitId,
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        discountPercentage: options?.discountPercentage?.toFixed(2) || null,
        tax: "0.00",
        insuranceCoverage: insuranceCoverage.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        patientPayable: patientPayable.toFixed(2),
        paidAmount: "0.00",
        remainingAmount: patientPayable.toFixed(2),
        paymentStatus: "pending",
      })
      .returning()

    billingId = newBilling.id
  }

  // Delete existing billing items
  await db.delete(billingItems).where(eq(billingItems.billingId, billingId))

  // Insert new billing items (only if there are items)
  if (calculation.items.length > 0) {
    await db.insert(billingItems).values(
      calculation.items.map((item) => ({
        billingId,
        ...item,
      }))
    )
  }

  return billingId
}

/**
 * Process payment for a billing
 */
export async function processPayment(
  billingId: string,
  userId: string,
  paymentData: {
    amount: number
    paymentMethod: string
    paymentReference?: string
    amountReceived?: number // For cash payments
    notes?: string
  }
) {
  const billing = await db.query.billings.findFirst({
    where: eq(billings.id, billingId),
  })

  if (!billing) {
    throw new Error("Billing not found")
  }

  const patientPayable = parseFloat(billing.patientPayable)
  const paidAmount = parseFloat(billing.paidAmount)
  const remainingAmount = patientPayable - paidAmount

  if (paymentData.amount > remainingAmount) {
    throw new Error("Payment amount exceeds remaining balance")
  }

  // Calculate change for cash payments
  let changeGiven = 0
  if (paymentData.paymentMethod === "cash" && paymentData.amountReceived) {
    changeGiven = paymentData.amountReceived - paymentData.amount
    if (changeGiven < 0) {
      throw new Error("Amount received is less than payment amount")
    }
  }

  // Create payment record
  await db.insert(payments).values({
    billingId,
    amount: paymentData.amount.toFixed(2),
    paymentMethod: paymentData.paymentMethod,
    paymentReference: paymentData.paymentReference || null,
    amountReceived: paymentData.amountReceived?.toFixed(2) || null,
    changeGiven: changeGiven > 0 ? changeGiven.toFixed(2) : null,
    receivedBy: userId,
    notes: paymentData.notes || null,
  })

  // Update billing
  const newPaidAmount = paidAmount + paymentData.amount
  const newRemainingAmount = patientPayable - newPaidAmount
  const newPaymentStatus =
    newRemainingAmount <= 0 ? "paid" : newPaidAmount > 0 ? "partial" : "pending"

  await db
    .update(billings)
    .set({
      paidAmount: newPaidAmount.toFixed(2),
      remainingAmount: newRemainingAmount.toFixed(2),
      paymentStatus: newPaymentStatus,
      paymentMethod: paymentData.paymentMethod,
      paymentReference: paymentData.paymentReference || null,
      processedBy: userId,
      processedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(billings.id, billingId))

  return {
    success: true,
    paymentStatus: newPaymentStatus,
    paidAmount: newPaidAmount,
    remainingAmount: newRemainingAmount,
    changeGiven,
  }
}

/**
 * Get billing details with items, patient, and visit info
 */
export async function getBillingDetails(visitId: string) {
  // Get billing record
  const billingResult = await db
    .select()
    .from(billings)
    .where(eq(billings.visitId, visitId))
    .limit(1)

  if (billingResult.length === 0) {
    return null
  }

  const billing = billingResult[0]

  // Get billing items
  const items = await db
    .select()
    .from(billingItems)
    .where(eq(billingItems.billingId, billing.id))
    .orderBy(billingItems.id)

  // Get payment history
  const paymentHistory = await db
    .select()
    .from(payments)
    .where(eq(payments.billingId, billing.id))
    .orderBy(desc(payments.createdAt))

  // Get visit and patient info
  const visitResult = await db
    .select({
      visit: visits,
      patient: patients,
    })
    .from(visits)
    .innerJoin(patients, eq(visits.patientId, patients.id))
    .where(eq(visits.id, visitId))
    .limit(1)

  if (visitResult.length === 0) {
    return null
  }

  const { visit, patient } = visitResult[0]

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
