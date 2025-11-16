/**
 * Pharmacy Module Validation Schemas
 * Centralized Zod schemas for API validation
 */

import { z } from "zod";

/**
 * Drug Schema
 */
export const drugSchema = z.object({
    name: z.string().min(1, "Nama obat wajib diisi"),
    genericName: z.string().optional(),
    category: z.string().optional(),
    unit: z.string().min(1, "Satuan wajib diisi"),
    price: z.string().min(1, "Harga wajib diisi"),
    minimumStock: z.number().int().min(0).optional(),
    description: z.string().optional(),
});

/**
 * Drug Update Schema
 */
export const drugUpdateSchema = z.object({
    id: z.number().int().positive("Drug ID harus valid"),
    name: z.string().optional(),
    genericName: z.string().optional(),
    category: z.string().optional(),
    unit: z.string().optional(),
    price: z.string().optional(),
    minimumStock: z.number().int().min(0).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
});

/**
 * Drug Inventory Schema
 */
export const drugInventorySchema = z.object({
    drugId: z.number().int().positive("Drug ID harus valid"),
    batchNumber: z.string().min(1, "Nomor batch wajib diisi"),
    expiryDate: z.string().min(1, "Tanggal kadaluarsa wajib diisi"),
    stockQuantity: z.number().int().min(0, "Jumlah stok harus positif atau nol"),
    purchasePrice: z.string().optional(),
    supplier: z.string().optional(),
});

/**
 * Prescription Fulfillment Schema
 */
export const prescriptionFulfillmentSchema = z.object({
    prescriptionId: z.number().int().positive("Prescription ID harus valid"),
    inventoryId: z.number().int().positive("Inventory ID harus valid"),
    dispensedQuantity: z.number().int().positive("Jumlah yang diberikan harus positif"),
    fulfilledBy: z.string().min(1, "Fulfilled by is required"),
    notes: z.string().optional(),
});

/**
 * Stock Adjustment Schema
 */
export const stockAdjustmentSchema = z.object({
    inventoryId: z.number().int().positive("Inventory ID harus valid"),
    quantity: z.number().int().refine(val => val !== 0, "Quantity cannot be zero"),
    reason: z.string().min(1, "Alasan wajib diisi"),
    performedBy: z.string().min(1, "Performed by is required"),
});

/**
 * Stock Movement Schema
 */
export const stockMovementSchema = z.object({
    inventoryId: z.number().int().positive("Inventory ID harus valid"),
    movementType: z.enum(["in", "out", "adjustment", "expired"], {
        required_error: "Tipe movement wajib dipilih",
    }),
    quantity: z.number().int(),
    reason: z.string().optional(),
    referenceId: z.number().int().optional(),
    performedBy: z.string().min(1, "Performed by is required"),
});

/**
 * Type exports
 */
export type DrugInput = z.infer<typeof drugSchema>;
export type DrugUpdateInput = z.infer<typeof drugUpdateSchema>;
export type DrugInventoryInput = z.infer<typeof drugInventorySchema>;
export type PrescriptionFulfillmentInput = z.infer<typeof prescriptionFulfillmentSchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
export type StockMovementInput = z.infer<typeof stockMovementSchema>;
