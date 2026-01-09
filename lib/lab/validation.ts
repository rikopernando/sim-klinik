/**
 * Laboratory & Radiology Validation Schemas
 * Zod schemas for request validation
 */

import { z } from "zod"
import {
  LAB_DEPARTMENTS,
  ORDER_URGENCY,
  ORDER_STATUS,
  RESULT_FLAGS,
  ATTACHMENT_TYPES,
} from "@/types/lab"

// ============================================================================
// LAB TEST SCHEMAS
// ============================================================================

export const createLabTestSchema = z.object({
  code: z.string().min(1, "Code is required").max(50, "Code too long"),
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  category: z.string().min(1, "Category is required"),
  department: z.enum([LAB_DEPARTMENTS.LAB, LAB_DEPARTMENTS.RAD]),
  price: z.string().min(1, "Price is required"),
  specimenType: z.string().max(100).optional(),
  specimenVolume: z.string().max(50).optional(),
  specimenContainer: z.string().max(100).optional(),
  tatHours: z.number().int().positive().optional(),
  loincCode: z.string().max(20).optional(),
  cptCode: z.string().max(20).optional(),
  resultTemplate: z
    .object({
      type: z.enum(["numeric", "multi_parameter", "descriptive"]),
    })
    .passthrough()
    .optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  requiresFasting: z.boolean().optional(),
})

export const updateLabTestSchema = createLabTestSchema.partial().extend({
  isActive: z.boolean().optional(),
})

// ============================================================================
// LAB ORDER SCHEMAS
// ============================================================================

export const createLabOrderSchema = z
  .object({
    visitId: z.uuid("Invalid visit ID"),
    patientId: z.uuid("Invalid patient ID"),
    testId: z.uuid("Invalid test ID").optional(),
    panelId: z.uuid("Invalid panel ID").optional(),
    urgency: z.enum([ORDER_URGENCY.ROUTINE, ORDER_URGENCY.URGENT, ORDER_URGENCY.STAT]),
    clinicalIndication: z
      .string()
      .max(1000, "Clinical indication too long")
      .min(1, "Clinical indication is required"),
    notes: z.string().max(1000, "Notes too long").optional(),
  })
  .refine((data) => data.testId || data.panelId, {
    message: "Either testId or panelId must be provided",
    path: ["testId"],
  })

export const updateLabOrderStatusSchema = z.object({
  status: z.enum([
    ORDER_STATUS.ORDERED,
    ORDER_STATUS.SPECIMEN_COLLECTED,
    ORDER_STATUS.IN_PROGRESS,
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.VERIFIED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.REJECTED,
  ]),
  notes: z.string().max(1000).optional(),
  cancelledReason: z.string().max(500).optional(),
})

export const collectSpecimenSchema = z.object({
  orderId: z.uuid("Invalid order ID"),
  specimenNotes: z.string().max(500).optional(),
})

// ============================================================================
// LAB RESULT SCHEMAS
// ============================================================================

export const numericResultDataSchema = z.object({
  value: z.number(),
  unit: z.string(),
  referenceRange: z.object({
    min: z.number(),
    max: z.number(),
  }),
  flag: z.enum([
    RESULT_FLAGS.NORMAL,
    RESULT_FLAGS.HIGH,
    RESULT_FLAGS.LOW,
    RESULT_FLAGS.CRITICAL_HIGH,
    RESULT_FLAGS.CRITICAL_LOW,
  ]),
  interpretation: z.string().optional(),
})

export const descriptiveResultDataSchema = z.object({
  findings: z.string().min(1, "Findings are required"),
  interpretation: z.string().min(1, "Interpretation is required"),
})

export const radiologyResultDataSchema = z.object({
  findings: z.string().min(1, "Findings are required"),
  impression: z.string().min(1, "Impression is required"),
  technique: z.string().optional(),
  comparison: z.string().optional(),
})

export const labResultParameterSchema = z.object({
  name: z.string().min(1, "Parameter name is required").max(100),
  value: z.string().min(1, "Parameter value is required"),
  unit: z.string().max(50).optional(),
  referenceRange: z
    .object({
      min: z.number(),
      max: z.number(),
    })
    .optional(),
  flag: z
    .enum([
      RESULT_FLAGS.NORMAL,
      RESULT_FLAGS.HIGH,
      RESULT_FLAGS.LOW,
      RESULT_FLAGS.CRITICAL_HIGH,
      RESULT_FLAGS.CRITICAL_LOW,
    ])
    .optional(),
})

export const labParameterSchema = z.object({
  parameters: z.array(labResultParameterSchema).optional(),
})

export const resultDataSchema = z.union([
  numericResultDataSchema,
  descriptiveResultDataSchema,
  labParameterSchema,
])

export const createLabResultSchema = z.object({
  orderId: z.uuid("Invalid order ID"),
  resultData: resultDataSchema,
  attachmentUrl: z.url("Invalid URL").optional(),
  attachmentType: z
    .enum([
      ATTACHMENT_TYPES.PDF,
      ATTACHMENT_TYPES.JPEG,
      ATTACHMENT_TYPES.PNG,
      ATTACHMENT_TYPES.DICOM,
    ])
    .optional(),
  resultNotes: z.string().max(1000).optional(),
  criticalValue: z.boolean().optional(),
})

export const verifyLabResultSchema = z.object({
  notes: z.string().max(1000).optional(),
})

// ============================================================================
// QUERY/FILTER SCHEMAS
// ============================================================================

export const labTestFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  department: z.enum([LAB_DEPARTMENTS.LAB, LAB_DEPARTMENTS.RAD]).optional(),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),
})

export const labOrderFiltersSchema = z.object({
  visitId: z.uuid().optional(),
  patientId: z.uuid().optional(),
  status: z.string().optional(), // Can be comma-separated
  department: z.enum([LAB_DEPARTMENTS.LAB, LAB_DEPARTMENTS.RAD]).optional(),
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
})

// ============================================================================
// TYPE EXPORTS (inferred from schemas)
// ============================================================================

export type CreateLabTestInput = z.infer<typeof createLabTestSchema>
export type UpdateLabTestInput = z.infer<typeof updateLabTestSchema>
export type CreateLabOrderInput = z.infer<typeof createLabOrderSchema>
export type UpdateLabOrderStatusInput = z.infer<typeof updateLabOrderStatusSchema>
export type CollectSpecimenInput = z.infer<typeof collectSpecimenSchema>
export type CreateLabResultInput = z.infer<typeof createLabResultSchema>
export type VerifyLabResultInput = z.infer<typeof verifyLabResultSchema>
export type LabTestFilters = z.infer<typeof labTestFiltersSchema>
export type LabOrderFilters = z.infer<typeof labOrderFiltersSchema>
export type ParameterResultInput = z.infer<typeof labResultParameterSchema>
export type ResultData = z.infer<typeof resultDataSchema>
