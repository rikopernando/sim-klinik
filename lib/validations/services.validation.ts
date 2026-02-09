import z from "zod"

export const createServicesSchema = z.object({
  name: z
    .string()
    .min(1, "Nama wajib diisi")
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .trim(),

  serviceType: z
    .string()
    .min(1, "Kode wajib diisi")
    .min(2, "Kode minimal 2 karakter")
    .max(20, "Kode maksimal 20 karakter")
    .trim(),

  code: z
    .string()
    .min(1, "Kode wajib diisi")
    .min(2, "Kode minimal 2 karakter")
    .max(20, "Kode maksimal 20 karakter")
    .trim()
    .toUpperCase(),

  price: z.union([
    z
      .number()
      .positive("Harga harus lebih dari 0")
      .min(100, "Harga minimal Rp 100")
      .max(999999999, "Harga maksimal Rp 999.999.999"),
    z
      .string()
      .min(1, "Harga harus diisi")
      .transform((val) => {
        // Convert string with thousand separators to number
        const numStr = val.replace(/[^\d]/g, "")
        const num = Number(numStr)
        if (isNaN(num)) {
          throw new Error("Harga harus berupa angka")
        }
        return num
      })
      .refine((num) => num > 0, { message: "Harga harus lebih dari 0" })
      .refine((num) => num >= 100, { message: "Harga minimal Rp 100" })
      .refine((num) => num <= 999999999, { message: "Harga maksimal Rp 999.999.999" }),
  ]),

  category: z
    .string()
    .min(1, "Kode  wajib diisi")
    .min(2, "Kode  minimal 3 karakter")
    .max(20, "Kode  maksimal 20 karakter")
    .trim(),

  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional(),
})

export const updateServicesSchema = z.object({
  name: z
    .string()
    .min(1, "Nama wajib diisi")
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .trim()
    .optional(),

  serviceType: z
    .string()
    .min(1, "Kode wajib diisi")
    .min(2, "Kode minimal 2 karakter")
    .max(20, "Kode maksimal 20 karakter")
    .trim()
    .optional(),

  code: z
    .string()
    .min(1, "Kode wajib diisi")
    .min(2, "Kode minimal 2 karakter")
    .max(20, "Kode maksimal 20 karakter")
    .trim()
    .toUpperCase()
    .optional(),

  price: z
    .union([
      z
        .number()
        .positive("Harga harus lebih dari 0")
        .min(100, "Harga minimal Rp 100")
        .max(999999999, "Harga maksimal Rp 999.999.999"),
      z
        .string()
        .min(1, "Harga harus diisi")
        .transform((val) => {
          // Convert string with thousand separators to number
          const numStr = val.replace(/[^\d]/g, "")
          const num = Number(numStr)
          if (isNaN(num)) {
            throw new Error("Harga harus berupa angka")
          }
          return num
        })
        .refine((num) => num > 0, { message: "Harga harus lebih dari 0" })
        .refine((num) => num >= 100, { message: "Harga minimal Rp 100" })
        .refine((num) => num <= 999999999, { message: "Harga maksimal Rp 999.999.999" }),
    ])
    .optional(),

  category: z
    .string()
    .min(1, "Kode  wajib diisi")
    .min(2, "Kode  minimal 3 karakter")
    .max(20, "Kode  maksimal 20 karakter")
    .trim()
    .optional(),

  isActive: z
    .enum(["active", "inactive"], {
      message: "Status harus 'active' atau 'inactive'",
    })
    .optional(),

  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional(),
})
