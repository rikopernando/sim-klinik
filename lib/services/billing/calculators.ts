/**
 * Billing Calculators
 * Helper functions for billing calculations
 */

import { db } from "@/db"
import { services, billings } from "@/db/schema/billing"
import { visits } from "@/db/schema/visits"
import { medicalRecords, procedures } from "@/db/schema/medical-records"
import { drugs, prescriptions } from "@/db/schema/pharmacy"
import { eq, and } from "drizzle-orm"
import { BillingItem } from "./types"

/**
 * Calculate administration fee
 */
export async function calculateAdministrationFee(): Promise<BillingItem | null> {
  const adminServiceResult = await db
    .select()
    .from(services)
    .where(and(eq(services.serviceType, "administration"), eq(services.isActive, true)))
    .limit(1)

  if (adminServiceResult.length === 0) {
    return null
  }

  const adminService = adminServiceResult[0]
  const price = parseFloat(adminService.price)

  return {
    itemType: "service",
    itemId: adminService.id,
    itemName: adminService.name,
    itemCode: adminService.code,
    quantity: 1,
    unitPrice: adminService.price,
    subtotal: price.toFixed(2),
    discount: "0.00",
    totalPrice: price.toFixed(2),
    description: "Biaya administrasi pendaftaran",
  }
}

/**
 * Calculate consultation fee
 */
export async function calculateConsultationFee(): Promise<BillingItem | null> {
  const consultationServiceResult = await db
    .select()
    .from(services)
    .where(and(eq(services.serviceType, "consultation"), eq(services.isActive, true)))
    .limit(1)

  if (consultationServiceResult.length === 0) {
    return null
  }

  const consultationService = consultationServiceResult[0]
  const price = parseFloat(consultationService.price)

  return {
    itemType: "service",
    itemId: consultationService.id,
    itemName: consultationService.name,
    itemCode: consultationService.code,
    quantity: 1,
    unitPrice: consultationService.price,
    subtotal: price.toFixed(2),
    discount: "0.00",
    totalPrice: price.toFixed(2),
    description: "Biaya konsultasi dokter",
  }
}

/**
 * Calculate procedure fees
 */
export async function calculateProcedureFees(visitId: string): Promise<BillingItem[]> {
  const items: BillingItem[] = []

  // Get procedures for this visit
  const proceduresList = await db
    .select({
      procedure: procedures,
    })
    .from(procedures)
    .innerJoin(medicalRecords, eq(procedures.medicalRecordId, medicalRecords.id))
    .where(eq(medicalRecords.visitId, visitId))

  for (const { procedure } of proceduresList) {
    // Try to find service by ICD-9 code
    const procedureServiceResult = await db
      .select()
      .from(services)
      .where(
        and(
          eq(services.serviceType, "procedure"),
          eq(services.code, procedure.icd9Code),
          eq(services.isActive, true)
        )
      )
      .limit(1)

    if (procedureServiceResult.length > 0) {
      const procedureService = procedureServiceResult[0]
      const price = parseFloat(procedureService.price)

      items.push({
        itemType: "service",
        itemId: procedureService.id,
        itemName: procedureService.name,
        itemCode: procedureService.code,
        quantity: 1,
        unitPrice: procedureService.price,
        subtotal: price.toFixed(2),
        discount: "0.00",
        totalPrice: price.toFixed(2),
        description: procedure.description || undefined,
      })
    }
  }

  return items
}

/**
 * Calculate medication fees
 */
export async function calculateMedicationFees(visitId: string): Promise<BillingItem[]> {
  const items: BillingItem[] = []

  // Get fulfilled prescriptions for this visit
  const prescriptionsList = await db
    .select({
      prescription: prescriptions,
      drug: drugs,
    })
    .from(prescriptions)
    .innerJoin(drugs, eq(prescriptions.drugId, drugs.id))
    .innerJoin(medicalRecords, eq(prescriptions.medicalRecordId, medicalRecords.id))
    .where(
      and(
        eq(medicalRecords.visitId, visitId),
        eq(prescriptions.isFulfilled, true) // Only fulfilled prescriptions
      )
    )

  for (const { prescription, drug } of prescriptionsList) {
    const quantity = prescription.dispensedQuantity || prescription.quantity
    const unitPrice = parseFloat(drug.price)
    const itemSubtotal = quantity * unitPrice

    items.push({
      itemType: "drug",
      itemId: drug.id,
      itemName: drug.name,
      itemCode: null,
      quantity,
      unitPrice: drug.price,
      subtotal: itemSubtotal.toFixed(2),
      discount: "0.00",
      totalPrice: itemSubtotal.toFixed(2),
      description: `${prescription.dosage}, ${prescription.frequency}`,
    })
  }

  return items
}

/**
 * Calculate final amounts with discount and insurance
 */
export function calculateFinalAmounts(
  subtotal: number,
  options?: {
    discount?: number
    discountPercentage?: number
    insuranceCoverage?: number
  }
) {
  let discount = options?.discount || 0
  const discountPercentage = options?.discountPercentage || 0
  const insuranceCoverage = options?.insuranceCoverage || 0

  // Apply percentage discount if specified
  if (discountPercentage > 0) {
    discount = (subtotal * discountPercentage) / 100
  }

  const totalAfterDiscount = subtotal - discount
  const patientPayable = totalAfterDiscount - insuranceCoverage

  return {
    discount: discount.toFixed(2),
    discountPercentage: discountPercentage.toFixed(2),
    totalAmount: totalAfterDiscount.toFixed(2),
    insuranceCoverage: insuranceCoverage.toFixed(2),
    patientPayable: patientPayable.toFixed(2),
  }
}
