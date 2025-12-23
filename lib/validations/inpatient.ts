/**
 * Inpatient Validation Schemas
 * Zod schemas for inpatient patient list validation
 */

import { z } from "zod"

/**
 * Schema for inpatient list query parameters
 */
export const inpatientListQuerySchema = z.object({
  search: z.string().optional(),
  roomType: z.string().optional(),
  floor: z.string().optional(),
  admissionDateFrom: z.string().datetime().optional(),
  admissionDateTo: z.string().datetime().optional(),
  sortBy: z.enum(["admissionDate", "roomNumber", "patientName"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type InpatientListQuery = z.infer<typeof inpatientListQuerySchema>
