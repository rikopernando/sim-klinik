/**
 * Prescription Utilities
 * Helper functions for prescription operations
 */

import { Prescription } from "@/types/medical-record"

/**
 * Check if a drug prescription already exists (for duplicate prevention)
 * @param drugId - Drug ID to check
 * @param existingPrescriptions - List of existing prescriptions
 * @param excludeId - Optional ID to exclude (for edit mode)
 * @returns The duplicate prescription if found, undefined otherwise
 */
export function findDuplicateDrugPrescription(
  drugId: string,
  existingPrescriptions: Prescription[],
  excludeId?: string
): Prescription | undefined {
  return existingPrescriptions.find(
    (p) => !p.isCompound && p.drugId === drugId && (!excludeId || p.id !== excludeId)
  )
}

/**
 * Check if a compound prescription already exists (for duplicate prevention)
 * @param compoundRecipeId - Compound recipe ID to check
 * @param existingPrescriptions - List of existing prescriptions
 * @param excludeId - Optional ID to exclude (for edit mode)
 * @returns The duplicate prescription if found, undefined otherwise
 */
export function findDuplicateCompoundPrescription(
  compoundRecipeId: string,
  existingPrescriptions: Prescription[],
  excludeId?: string
): Prescription | undefined {
  return existingPrescriptions.find(
    (p) =>
      p.isCompound && p.compoundRecipeId === compoundRecipeId && (!excludeId || p.id !== excludeId)
  )
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use findDuplicateDrugPrescription instead
 */
export function findDuplicatePrescription(
  drugId: string,
  existingPrescriptions: Prescription[],
  excludeId?: string
): Prescription | undefined {
  return findDuplicateDrugPrescription(drugId, existingPrescriptions, excludeId)
}

/**
 * Default prescription item for form initialization
 * Supports both regular drugs and compound recipes
 */
export const DEFAULT_PRESCRIPTION_ITEM = {
  isCompound: false as const,
  // Drug fields
  drugId: "",
  drugName: "",
  drugPrice: "",
  // Compound fields
  compoundRecipeId: "",
  compoundRecipeName: "",
  compoundRecipePrice: "",
  // Common fields
  dosage: "",
  frequency: "",
  quantity: 1,
  instructions: "",
  route: "oral",
}

/**
 * Create a new prescription item with default values
 */
export const createPrescriptionItem = () => ({
  ...DEFAULT_PRESCRIPTION_ITEM,
})

/**
 * Predefined frequency options for prescriptions
 */
export const FREQUENCY_OPTIONS = [
  { value: "1x1_pagi", label: "1 x 1 Pagi" },
  { value: "1x1_siang", label: "1 x 1 Siang" },
  { value: "1x1_malam", label: "1 x 1 Malam" },
  { value: "3x1_setelah_makan", label: "3 x 1 Setelah Makan" },
  { value: "3x1_sebelum_makan", label: "3 x 1 Sebelum Makan" },
  { value: "2x1_setelah_makan", label: "2 x 1 Setelah Makan" },
  { value: "2x1_sebelum_makan", label: "2 x 1 Sebelum Makan" },
  { value: "1x1_setelah_makan", label: "1 x 1 Setelah Makan" },
  { value: "1x1_sebelum_makan", label: "1 x 1 Sebelum Makan" },
  { value: "6x1/2", label: "6 x 1/2" },
  { value: "5x1/2", label: "5 x 1/2" },
  { value: "4x1/2", label: "4 x 1/2" },
  { value: "3x1/2", label: "3 x 1/2" },
  { value: "2x1/2", label: "2 x 1/2" },
  { value: "1x1/2", label: "1 x 1/2" },
  { value: "1x1/2_pagi", label: "1 x 1/2 Pagi" },
  { value: "1x1/2_siang", label: "1 x 1/2 Siang" },
  { value: "1x1/2_malam", label: "1 x 1/2 Malam" },
  { value: "8x1", label: "8 x 1" },
  { value: "7x1", label: "7 x 1" },
  { value: "6x1", label: "6 x 1" },
  { value: "5x1", label: "5 x 1" },
  { value: "4x1", label: "4 x 1" },
  { value: "3x1", label: "3 x 1" },
  { value: "2x1", label: "2 x 1" },
  { value: "1x1", label: "1 x 1" },
  { value: "bila_perlu", label: "Bila Perlu" },
] as const
