import { z } from "zod"

export const createDrugSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  genericName: z.string().optional(),
  itemType: z.enum(["drug", "material"]),
  category: z.string().optional(),
  unit: z.string().min(1, "Satuan wajib diisi"),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  generalPrice: z.number().min(0).optional(),
  minimumStock: z.number().int().min(0),
  requiresPrescription: z.boolean(),
  description: z.string().optional(),
})

export const updateDrugSchema = createDrugSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type CreateDrugSchema = z.infer<typeof createDrugSchema>
export type UpdateDrugSchema = z.infer<typeof updateDrugSchema>
