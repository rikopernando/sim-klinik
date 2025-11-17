/**
 * Billing Module Validation Schemas
 * Centralized Zod schemas for API validation
 */

import { z } from "zod";

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
});

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
});

/**
 * Billing Item Schema
 */
export const billingItemSchema = z.object({
    itemType: z.enum(["service", "drug", "material", "room"], {
        required_error: "Tipe item wajib dipilih",
    }),
    itemId: z.number().int().optional(),
    itemName: z.string().min(1, "Nama item wajib diisi"),
    itemCode: z.string().optional(),
    quantity: z.number().int().min(1, "Jumlah minimal 1"),
    unitPrice: z.string().min(1, "Harga satuan wajib diisi"),
    discount: z.string().optional(),
    description: z.string().optional(),
});

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
});

/**
 * Payment Schema
 */
export const paymentSchema = z.object({
    billingId: z.number().int().positive("Billing ID harus valid"),
    amount: z.string().min(1, "Jumlah pembayaran wajib diisi"),
    paymentMethod: z.enum(["cash", "transfer", "card", "insurance"], {
        required_error: "Metode pembayaran wajib dipilih",
    }),
    paymentReference: z.string().optional(),
    amountReceived: z.string().optional(),
    receivedBy: z.string().min(1, "Received by is required"),
    notes: z.string().optional(),
});

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
});

/**
 * Type exports
 */
export type ServiceInput = z.infer<typeof serviceSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
export type BillingItemInput = z.infer<typeof billingItemSchema>;
export type CreateBillingInput = z.infer<typeof createBillingSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type DischargeSummaryInput = z.infer<typeof dischargeSummarySchema>;
