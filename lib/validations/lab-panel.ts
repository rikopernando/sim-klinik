import { z } from "zod"

export const createLabPanelSchema = z.object({
  code: z.string().min(1, "Kode wajib diisi").max(50),
  name: z.string().min(1, "Nama wajib diisi").max(255),
  description: z.string().optional(),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  testIds: z.array(z.string()).min(1, "Pilih minimal 1 pemeriksaan"),
})

export const updateLabPanelSchema = createLabPanelSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type CreateLabPanelSchema = z.infer<typeof createLabPanelSchema>
export type UpdateLabPanelSchema = z.infer<typeof updateLabPanelSchema>
