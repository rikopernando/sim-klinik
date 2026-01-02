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
 * Uses unified inventory system - materials are in "drugs" table with item_type='material'
 */
export const materialUsageSchema = z.object({
  visitId: z.string().min(1, "Visit ID harus valid"),

  // Unified inventory approach - references drugs table (item_type='material')
  itemId: z.string().min(1, "Material harus dipilih"),

  // Core fields
  quantity: z.string().min(1, "Jumlah harus diisi"),
  batchId: z.string().optional(), // Optional: specific inventory batch to use
  usedBy: z.string().optional(),
  notes: z.string().optional(),
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
 * Inpatient Prescription Schema
 * For ordering medications during inpatient stay
 */
export const inpatientPrescriptionSchema = z.object({
  visitId: z.string().min(1, "Visit ID harus valid"),
  cpptId: z.string().optional(), // Optional - which CPPT entry ordered it
  drugId: z.string().min(1, "Obat harus dipilih"),

  // Prescription details
  dosage: z.string().optional(),
  frequency: z.string().min(1, "Frekuensi harus diisi"),
  route: z.string().optional(),
  duration: z.string().optional(),
  quantity: z.number().int().positive("Jumlah harus positif"),

  // Instructions
  instructions: z.string().optional(),

  // Inpatient specific
  isRecurring: z.boolean().default(false),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  administrationSchedule: z.string().optional(), // "08:00,14:00,20:00" for 3x daily

  notes: z.string().optional(),
})

/**
 * Inpatient Procedure Schema
 * For ordering procedures/tindakan during inpatient stay
 */
export const inpatientProcedureSchema = z.object({
  visitId: z.string().min(1, "Visit ID harus valid"),
  cpptId: z.string().optional(), // Optional - which CPPT entry ordered it

  // Service reference (preferred) or manual entry
  serviceId: z.string().optional(),
  description: z.string().min(1, "Deskripsi tindakan harus diisi"),
  icd9Code: z.string().optional(),

  // Scheduling
  scheduledAt: z.string().optional(), // ISO date string

  notes: z.string().optional(),
})

/**
 * Mark Prescription as Administered Schema
 * For nurses to record medication administration
 */
export const administerPrescriptionSchema = z.object({
  prescriptionId: z.string().min(1, "Prescription ID is required"),
  administeredBy: z.string().min(1, "Administrator ID is required"),
})

/**
 * Update Procedure Status Schema
 * For tracking procedure progress
 */
export const updateProcedureStatusSchema = z.object({
  procedureId: z.string().min(1, "Procedure ID is required"),
  status: z.enum(["ordered", "in_progress", "completed", "cancelled"], {
    message: "Status harus valid",
  }),
  performedBy: z.string().optional(), // Required for completed status
  notes: z.string().optional(),
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
export type InpatientPrescriptionInput = z.infer<typeof inpatientPrescriptionSchema>
export type InpatientProcedureInput = z.infer<typeof inpatientProcedureSchema>
export type AdministerPrescriptionInput = z.infer<typeof administerPrescriptionSchema>
export type UpdateProcedureStatusInput = z.infer<typeof updateProcedureStatusSchema>
