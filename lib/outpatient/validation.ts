/**
 * Outpatient Module Validation Schemas
 * Zod schemas for API validation
 */

import { z } from "zod"

/**
 * Transfer to Inpatient Schema
 */
export const transferToInpatientSchema = z
  .object({
    visitId: z.string().min(1, "Visit ID harus valid"),
    roomId: z.string().min(1, "Room ID harus valid"),
    bedNumber: z.string().min(1, "Nomor bed wajib diisi"),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      const bedNum = parseInt(data.bedNumber)
      return !isNaN(bedNum) && bedNum > 0 && bedNum <= 99
    },
    {
      message: "Nomor bed harus berupa angka positif (1-99)",
      path: ["bedNumber"],
    }
  )

/**
 * Type exports
 */
export type TransferToInpatientInput = z.infer<typeof transferToInpatientSchema>
