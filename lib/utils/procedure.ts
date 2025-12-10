/**
 * Procedure Utility Functions
 * Helper functions for procedure operations
 */

import { Procedure } from "@/types/medical-record"

/**
 * Check if a procedure with the same service already exists
 */
export function findDuplicateProcedure(
  serviceId: string,
  existingProcedures: Procedure[],
  excludeId?: string
): Procedure | undefined {
  return existingProcedures.find(
    (p) => p.serviceId === serviceId && (!excludeId || p.id !== excludeId)
  )
}

/**
 * Default values for a new procedure item
 */
export const DEFAULT_PROCEDURE_ITEM = {
  serviceId: "",
  serviceName: "",
  servicePrice: "",
  icd9Code: "",
  description: "",
  performedBy: "",
  notes: "",
} as const

/**
 * Create a new procedure item with default values
 */
export function createProcedureItem() {
  return { ...DEFAULT_PROCEDURE_ITEM }
}
