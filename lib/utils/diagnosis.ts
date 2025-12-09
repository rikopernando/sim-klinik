/**
 * Diagnosis Utilities
 * Helper functions for diagnosis operations
 */

import { Diagnosis } from "@/types/medical-record"
import { formatIcdCode } from "./medical-record"

/**
 * Check if a diagnosis code already exists (for duplicate prevention)
 * @param code - ICD-10 code to check
 * @param existingDiagnoses - List of existing diagnoses
 * @param excludeId - Optional ID to exclude (for edit mode)
 * @returns The duplicate diagnosis if found, undefined otherwise
 */
export function findDuplicateDiagnosis(
  code: string,
  existingDiagnoses: Diagnosis[],
  excludeId?: string
): Diagnosis | undefined {
  const formattedCode = formatIcdCode(code)
  return existingDiagnoses.find(
    (d) => d.icd10Code === formattedCode && (!excludeId || d.id !== excludeId)
  )
}

/**
 * Default diagnosis item for form initialization
 */
export const DEFAULT_DIAGNOSIS_ITEM = {
  icd10Code: "",
  description: "",
  diagnosisType: "primary" as const,
}

/**
 * Create a new secondary diagnosis item
 */
export const createSecondaryDiagnosisItem = () => ({
  icd10Code: "",
  description: "",
  diagnosisType: "secondary" as const,
})
