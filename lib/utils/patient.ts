/**
 * Patient utility functions
 */

/**
 * Get gender label in Indonesian
 * @param gender - Gender value ("male" | "female")
 * @returns Formatted gender label or "-"
 */
export function getGenderLabel(gender: string | null | undefined): string {
  if (!gender) return "-"
  return gender === "male" ? "Laki-laki" : "Perempuan"
}

/**
 * Format patient display name with MR number
 * @param name - Patient name
 * @param mrNumber - Medical record number
 * @returns Formatted display name
 */
export function getPatientDisplayName(name: string, mrNumber: string): string {
  return `${name} (${mrNumber})`
}

/**
 * Get insurance type badge variant
 * @param insuranceType - Type of insurance
 * @returns Badge variant
 */
export function getInsuranceBadgeVariant(
  insuranceType: string | null
): "default" | "secondary" | "outline" {
  if (!insuranceType) return "outline"
  if (insuranceType.toLowerCase().includes("bpjs")) return "default"
  return "secondary"
}
