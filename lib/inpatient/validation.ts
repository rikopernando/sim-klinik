/**
 * Inpatient Module Validation Schemas
 * Centralized Zod schemas for API validation
 */

import { z } from "zod"

/**
 * Room Schema
 */
export const roomSchema = z.object({
  roomNumber: z.string().min(1, "Nomor kamar wajib diisi"),
  roomType: z.string().min(1, "Tipe kamar wajib diisi"),
  bedCount: z.number().int().positive("Jumlah bed harus positif"),
  floor: z.string().optional(),
  building: z.string().optional(),
  dailyRate: z.string().min(1, "Tarif harian wajib diisi"),
  facilities: z.string().optional(),
  description: z.string().optional(),
})

/**
 * Bed Assignment Schema
 */
export const bedAssignmentSchema = z.object({
  visitId: z.string().min(1, "Visit ID harus valid"),
  roomId: z.string().min(1, "Room ID harus valid"),
  bedNumber: z.string().min(1, "Nomor bed wajib diisi"),
  notes: z.string().optional(),
})

/**
 * Vital Signs Schema
 */
export const vitalSignsSchema = z.object({
  visitId: z.string().min(1, "Visit ID harus valid"),
  temperature: z.string().optional(),
  bloodPressureSystolic: z.number().int().optional(),
  bloodPressureDiastolic: z.number().int().optional(),
  pulse: z.number().int().optional(),
  respiratoryRate: z.number().int().optional(),
  oxygenSaturation: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  painScale: z.number().int().min(0).max(10).optional(),
  consciousness: z.string().optional(),
  notes: z.string().optional(),
  recordedBy: z.string().min(1, "Recorded by is required"),
})

/**
 * CPPT Schema
 */
export const cpptSchema = z.object({
  visitId: z.string().min(1, "Visit ID harus valid"),
  authorId: z.string().min(1, "Author ID is required"),
  authorRole: z.enum(["doctor", "nurse"], {
    message: "Author role is required",
  }),
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  progressNote: z.string().min(1, "Progress note is required"),
  instructions: z.string().optional(),
})

/**
 * Material Usage Schema
 * Supports both new serviceId approach and legacy materialName approach
 */
export const materialUsageSchema = z
  .object({
    visitId: z.string().min(1, "Visit ID harus valid"),

    // NEW: Service-based approach (preferred)
    serviceId: z.string().min(1, "Service ID harus diisi"),

    // LEGACY: Direct material input (for backward compatibility)
    materialName: z.string().optional(),
    unit: z.string().optional(),
    unitPrice: z.string().optional(),

    // Core fields
    quantity: z.string().min(1, "Jumlah harus diisi"),
    usedBy: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.serviceId || data.materialName, {
    message: "Service ID atau Nama Material harus diisi",
    path: ["serviceId"],
  })

/**
 * Room Update Schema
 */
export const roomUpdateSchema = z.object({
  id: z.string().min(1, "Room ID harus diisi"),
  roomNumber: z.string().optional(),
  roomType: z.string().optional(),
  bedCount: z.number().int().positive().optional(),
  floor: z.string().optional(),
  building: z.string().optional(),
  dailyRate: z.string().optional(),
  facilities: z.string().optional(),
  status: z.enum(["available", "occupied", "maintenance", "reserved"]).optional(),
  description: z.string().optional(),
})

/**
 * Type exports
 */
export type RoomInput = z.infer<typeof roomSchema>
export type BedAssignmentInput = z.infer<typeof bedAssignmentSchema>
export type VitalSignsInput = z.infer<typeof vitalSignsSchema>
export type CPPTInput = z.infer<typeof cpptSchema>
export type MaterialUsageInput = z.infer<typeof materialUsageSchema>
export type RoomUpdateInput = z.infer<typeof roomUpdateSchema>
