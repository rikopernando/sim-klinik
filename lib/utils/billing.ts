/**
 * Billing Utility Functions
 * Calculate billing preview from medical record data
 */
/**
 * Consultation fees by visit type
 */
export const CONSULTATION_FEES: Record<string, number> = {
  outpatient: 50000,
  inpatient: 100000,
  emergency: 150000,
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
