import { z } from "zod"

export const createPoliSchema = z.object({
  name: z
    .string()
    .min(1, "Nama poli wajib diisi")
    .min(3, "Nama poli minimal 3 karakter")
    .max(100, "Nama poli maksimal 100 karakter")
    .trim(),

  code: z
    .string()
    .min(1, "Kode poli wajib diisi")
    .min(2, "Kode poli minimal 2 karakter")
    .max(20, "Kode poli maksimal 20 karakter")
    .trim()
    .toUpperCase(),

  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional().nullable(),

  isActive: z
    .enum(["active", "inactive"], {
      message: "Status harus 'active' atau 'inactive'",
    })
    .default("active"),
})

export const updatePoliSchema = z.object({
  name: z
    .string()
    .min(3, "Nama poli minimal 3 karakter")
    .max(100, "Nama poli maksimal 100 karakter")
    .trim()
    .optional(),

  code: z
    .string()
    .min(2, "Kode poli minimal 2 karakter")
    .max(20, "Kode poli maksimal 20 karakter")
    .trim()
    .toUpperCase()
    .optional(),

  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional().nullable(),

  isActive: z
    .enum(["active", "inactive"], {
      message: "Status harus 'active' atau 'inactive'",
    })
    .optional(),
})

export type CreatePoliInput = z.infer<typeof createPoliSchema>
export type UpdatePoliInput = z.infer<typeof updatePoliSchema>
