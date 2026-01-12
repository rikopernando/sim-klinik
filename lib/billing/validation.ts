/**
 * Billing Module Validation Schemas
 * Centralized Zod schemas for API validation
 */

import { z } from "zod"

/**
 * Service Schema
 */
export const serviceSchema = z.object({
  code: z.string().min(1, "Kode layanan wajib diisi"),
  name: z.string().min(1, "Nama layanan wajib diisi"),
  serviceType: z.string().min(1, "Tipe layanan wajib diisi"),
  price: z.string().min(1, "Harga wajib diisi"),
  description: z.string().optional(),
  category: z.string().optional(),
})

/**
 * Service Update Schema
 */
export const serviceUpdateSchema = z.object({
  id: z.number().int().positive("Service ID harus valid"),
  code: z.string().optional(),
  name: z.string().optional(),
  serviceType: z.string().optional(),
  price: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
})

/**
 * Billing Item Schema
 */
export const billingItemSchema = z.object({
  itemType: z.enum(["service", "drug", "material", "room"], {
    message: "Tipe item wajib dipilih",
  }),
  itemId: z.number().int().optional(),
  itemName: z.string().min(1, "Nama item wajib diisi"),
  itemCode: z.string().optional(),
  quantity: z.number().int().min(1, "Jumlah minimal 1"),
  unitPrice: z.string().min(1, "Harga satuan wajib diisi"),
  discount: z.string().optional(),
  description: z.string().optional(),
})

/**
 * Create Billing Schema
 */
export const createBillingSchema = z.object({
  visitId: z.number().int().positive("Visit ID harus valid"),
  items: z.array(billingItemSchema).min(1, "Minimal 1 item diperlukan"),
  discount: z.string().optional(),
  discountPercentage: z.string().optional(),
  insuranceCoverage: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * Payment Schema (legacy - kept for backward compatibility)
 */
export const paymentSchema = z.object({
  billingId: z.number().int().positive("Billing ID harus valid"),
  amount: z.string().min(1, "Jumlah pembayaran wajib diisi"),
  paymentMethod: z.enum(["cash", "transfer", "card", "insurance"], {
    message: "Metode pembayaran wajib dipilih",
  }),
  paymentReference: z.string().optional(),
  amountReceived: z.string().optional(),
  receivedBy: z.string().min(1, "Received by is required"),
  notes: z.string().optional(),
})

/**
 * Merged Payment Processing Schema
 * Handles discount and payment in a single transaction
 */
export const processPaymentSchema = z
  .object({
    billingId: z.string().min(1, "Billing ID harus valid"),

    // Discount and insurance fields (optional)
    discount: z.string().optional(),
    discountPercentage: z.string().optional(),
    insuranceCoverage: z.string().optional(),

    // Payment fields (required)
    amount: z.string().min(1, "Jumlah pembayaran wajib diisi"),
    paymentMethod: z.enum(["cash", "transfer", "card", "insurance"], {
      message: "Metode pembayaran wajib dipilih",
    }),
    paymentReference: z.string().optional(),
    amountReceived: z.string().optional(), // For cash payments (to calculate change)
    receivedBy: z.string().min(1, "Petugas penerima wajib diisi"),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      // Only one of discount or discountPercentage should be provided
      if (data.discount && data.discountPercentage) {
        return false
      }
      return true
    },
    {
      message: "Hanya boleh mengisi salah satu: diskon nominal atau persentase",
      path: ["discount"],
    }
  )
  .refine(
    (data) => {
      // For cash payments, amountReceived is required
      if (data.paymentMethod === "cash" && !data.amountReceived) {
        return false
      }
      return true
    },
    {
      message: "Jumlah uang diterima wajib diisi untuk pembayaran tunai",
      path: ["amountReceived"],
    }
  )
  .refine(
    (data) => {
      // For cash payments, amountReceived must be >= amount
      if (data.paymentMethod === "cash" && data.amountReceived) {
        const received = parseFloat(data.amountReceived)
        const amount = parseFloat(data.amount)
        return received >= amount
      }
      return true
    },
    {
      message: "Jumlah uang diterima harus lebih besar atau sama dengan jumlah pembayaran",
      path: ["amountReceived"],
    }
  )

/**
 * Discharge Summary Schema
 */
export const dischargeSummarySchema = z.object({
  visitId: z.number().int().positive("Visit ID harus valid"),
  admissionDiagnosis: z.string().min(1, "Diagnosis masuk wajib diisi"),
  dischargeDiagnosis: z.string().min(1, "Diagnosis pulang wajib diisi"),
  clinicalSummary: z.string().min(1, "Ringkasan klinis wajib diisi"),
  proceduresPerformed: z.string().optional(),
  medicationsOnDischarge: z.string().optional(),
  dischargeInstructions: z.string().min(1, "Instruksi pulang wajib diisi"),
  dietaryRestrictions: z.string().optional(),
  activityRestrictions: z.string().optional(),
  followUpDate: z.string().optional(),
  followUpInstructions: z.string().optional(),
  dischargedBy: z.string().min(1, "Discharged by is required"),
})

/**
 * Type exports
 */
export type ServiceInput = z.infer<typeof serviceSchema>
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>
export type BillingItemInput = z.infer<typeof billingItemSchema>
export type CreateBillingInput = z.infer<typeof createBillingSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>
export type DischargeSummaryInput = z.infer<typeof dischargeSummarySchema>
