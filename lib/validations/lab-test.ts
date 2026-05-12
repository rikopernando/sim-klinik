import { z } from "zod"

export const createLabTestSchema = z.object({
  code: z.string().min(1, "Kode wajib diisi").max(50),
  name: z.string().min(1, "Nama wajib diisi").max(255),
  category: z.string().min(1, "Kategori wajib diisi").max(100),
  department: z.enum(["LAB", "RAD"]),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  specimenType: z.string().optional(),
  tatHours: z.number().int().min(1).optional(),
  requiresFasting: z.boolean().optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
})

export const updateLabTestSchema = createLabTestSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type CreateLabTestSchema = z.infer<typeof createLabTestSchema>
export type UpdateLabTestSchema = z.infer<typeof updateLabTestSchema>
