/**
 * Billing Utility Functions
 * Calculate billing preview from medical record data
 */

import { MedicalRecordData } from "@/types/medical-record"

export interface BillingPreview {
  drugsSubtotal: number
  proceduresSubtotal: number
  // consultationFee: number
  subtotal: number
}

/**
 * Consultation fees by visit type
 */
export const CONSULTATION_FEES: Record<string, number> = {
  outpatient: 50000,
  inpatient: 100000,
  emergency: 150000,
}

/**
 * Calculate billing preview from medical record data
 */
export function calculateBillingPreview(recordData: MedicalRecordData): BillingPreview {
  // Calculate drugs subtotal
  const drugsSubtotal = recordData.prescriptions.reduce((total, prescription) => {
    const drugPrice = parseFloat(prescription.drugPrice || "0")
    const quantity = prescription.quantity || 0
    return total + drugPrice * quantity
  }, 0)

  // Calculate procedures subtotal
  const proceduresSubtotal = recordData.procedures.reduce((total, procedure) => {
    const servicePrice = parseFloat(procedure.servicePrice || "0")
    return total + servicePrice
  }, 0)

  // Get consultation fee based on visit type
  // const consultationFee = CONSULTATION_FEES[recordData.visit.visitType] || 0

  // Calculate total
  const subtotal = drugsSubtotal + proceduresSubtotal

  return {
    drugsSubtotal,
    proceduresSubtotal,
    // consultationFee,
    subtotal,
  }
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}
