/**
 * Inpatient Module Validation Schemas
 * Centralized Zod schemas for API validation
 */

import { z } from "zod"

/**
 * Room Schema
 * Includes business rule validations for room configuration
 */
export const roomSchema = z
  .object({
    roomNumber: z.string().min(1, "Nomor kamar wajib diisi"),
    roomType: z.string().min(1, "Tipe kamar wajib diisi"),
    bedCount: z
      .number()
      .int()
      .min(1, "Jumlah bed minimal 1")
      .max(20, "Jumlah bed maksimal 20 per kamar"),
    floor: z.string().optional(),
    building: z.string().optional(),
    dailyRate: z.string().min(1, "Tarif harian wajib diisi"),
    facilities: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      // Daily rate should be a positive number
      const rate = parseFloat(data.dailyRate)
      return !isNaN(rate) && rate > 0 && rate <= 100000000 // Max 100 million
    },
    {
      message: "Tarif harian harus berupa angka positif",
      path: ["dailyRate"],
    }
  )

/**
 * Bed Assignment Schema
 * Includes bed number validation
 */
export const bedAssignmentSchema = z
  .object({
    visitId: z.string().min(1, "Visit ID harus valid"),
    roomId: z.string().min(1, "Room ID harus valid"),
    bedNumber: z.string().min(1, "Nomor bed wajib diisi"),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      // Bed number should be a positive integer
      const bedNum = parseInt(data.bedNumber)
      return !isNaN(bedNum) && bedNum > 0 && bedNum <= 99
    },
    {
      message: "Nomor bed harus berupa angka positif (1-99)",
      path: ["bedNumber"],
    }
  )

/**
 * Bed Transfer Schema
 * Includes bed number validation
 */
export const bedTransferSchema = z
  .object({
    visitId: z.string().min(1, "Visit ID harus valid"),
    newRoomId: z.string().min(1, "Room ID baru harus valid"),
    newBedNumber: z.string().min(1, "Nomor bed baru wajib diisi"),
    transferReason: z.string().min(10, "Alasan transfer minimal 10 karakter"),
  })
  .refine(
    (data) => {
      // Bed number should be a positive integer
      const bedNum = parseInt(data.newBedNumber)
      return !isNaN(bedNum) && bedNum > 0 && bedNum <= 99
    },
    {
      message: "Nomor bed harus berupa angka positif (1-99)",
      path: ["newBedNumber"],
    }
  )

/**
 * Vital Signs Schema
 * Includes clinical range validations for patient safety
 */
export const vitalSignsSchema = z
  .object({
    visitId: z.string().min(1, "Visit ID harus valid"),

    // Temperature: 35-42°C (normal human range)
    temperature: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true // Optional field
          const temp = parseFloat(val)
          return !isNaN(temp) && temp >= 35 && temp <= 42
        },
        {
          message: "Suhu harus antara 35-42°C",
        }
      ),

    // Blood Pressure Systolic: 60-250 mmHg
    bloodPressureSystolic: z
      .number()
      .int()
      .min(60, "Tekanan darah sistolik minimal 60 mmHg")
      .max(250, "Tekanan darah sistolik maksimal 250 mmHg")
      .optional(),

    // Blood Pressure Diastolic: 40-150 mmHg
    bloodPressureDiastolic: z
      .number()
      .int()
      .min(40, "Tekanan darah diastolik minimal 40 mmHg")
      .max(150, "Tekanan darah diastolik maksimal 150 mmHg")
      .optional(),

    // Pulse: 30-200 bpm
    pulse: z
      .number()
      .int()
      .min(30, "Denyut nadi minimal 30 bpm")
      .max(200, "Denyut nadi maksimal 200 bpm")
      .optional(),

    // Respiratory Rate: 8-40 breaths/min
    respiratoryRate: z
      .number()
      .int()
      .min(8, "Laju napas minimal 8 per menit")
      .max(40, "Laju napas maksimal 40 per menit")
      .optional(),

    // Oxygen Saturation: 70-100%
    oxygenSaturation: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true // Optional field
          const o2 = parseFloat(val)
          return !isNaN(o2) && o2 >= 70 && o2 <= 100
        },
        {
          message: "Saturasi oksigen harus antara 70-100%",
        }
      ),

    // Weight: 0.5-300 kg
    weight: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true // Optional field
          const w = parseFloat(val)
          return !isNaN(w) && w >= 0.5 && w <= 300
        },
        {
          message: "Berat badan harus antara 0.5-300 kg",
        }
      ),

    // Height: 30-250 cm
    height: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true // Optional field
          const h = parseFloat(val)
          return !isNaN(h) && h >= 30 && h <= 250
        },
        {
          message: "Tinggi badan harus antara 30-250 cm",
        }
      ),

    // Pain Scale: 0-10 (already validated)
    painScale: z.number().int().min(0).max(10).optional(),

    consciousness: z.string().optional(),
    notes: z.string().optional(),
    recordedBy: z.string().min(1, "Recorded by is required"),
  })
  .refine(
    (data) => {
      // If systolic is provided, diastolic should also be provided
      if (data.bloodPressureSystolic && !data.bloodPressureDiastolic) {
        return false
      }
      if (data.bloodPressureDiastolic && !data.bloodPressureSystolic) {
        return false
      }
      return true
    },
    {
      message: "Tekanan darah sistolik dan diastolik harus diisi bersamaan",
      path: ["bloodPressureSystolic"],
    }
  )
  .refine(
    (data) => {
      // Systolic must be greater than diastolic
      if (data.bloodPressureSystolic && data.bloodPressureDiastolic) {
        return data.bloodPressureSystolic > data.bloodPressureDiastolic
      }
      return true
    },
    {
      message: "Tekanan darah sistolik harus lebih besar dari diastolik",
      path: ["bloodPressureSystolic"],
    }
  )

/**
 * Medical Record Schema (Unified)
 * Replaces separate medical_records and CPPT schemas
 * Supports multiple record types for different clinical documentation needs
 */
export const medicalRecordSchema = z.object({
  visitId: z.string().min(1, "Visit ID harus valid"),
  authorId: z.string().min(1, "Author ID is required"),
  authorRole: z.enum(["doctor", "nurse", "specialist"], {
    message: "Author role is required",
  }),
  recordType: z
    .enum([
      "initial_consultation",
      "progress_note",
      "discharge_summary",
      "procedure_note",
      "specialist_consultation",
    ])
    .default("progress_note"),

  // SOAP Notes (used across all record types)
  soapSubjective: z.string().optional(),
  soapObjective: z.string().optional(),
  soapAssessment: z.string().optional(),
  soapPlan: z.string().optional(),

  // Progress documentation (primarily for progress notes)
  progressNote: z.string().optional(),
  instructions: z.string().optional(),

  // Additional clinical documentation (primarily for initial consultations)
  physicalExam: z.string().optional(),
  laboratoryResults: z.string().optional(),
  radiologyResults: z.string().optional(),
})

/**
 * DEPRECATED: Use medicalRecordSchema instead
 * Kept for backward compatibility - will be removed in future version
 */
export const cpptSchema = medicalRecordSchema

/**
 * Material Usage Schema
 * Uses unified inventory system - materials are in "drugs" table with item_type='material'
 * Includes quantity validation
 */
export const materialUsageSchema = z
  .object({
    visitId: z.string().min(1, "Visit ID harus valid"),

    // Unified inventory approach - references drugs table (item_type='material')
    itemId: z.string().min(1, "Material harus dipilih"),

    // Core fields
    quantity: z.string().min(1, "Jumlah harus diisi"),
    batchId: z.string().optional(), // Optional: specific inventory batch to use
    usedBy: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      // Quantity should be a positive number
      const qty = parseFloat(data.quantity)
      return !isNaN(qty) && qty > 0 && qty <= 10000
    },
    {
      message: "Jumlah harus berupa angka positif (maksimal 10,000)",
      path: ["quantity"],
    }
  )

/**
 * Room Update Schema
 * Includes business rule validations for room updates
 */
export const roomUpdateSchema = z
  .object({
    id: z.string().min(1, "Room ID harus diisi"),
    roomNumber: z.string().optional(),
    roomType: z.string().optional(),
    bedCount: z
      .number()
      .int()
      .min(1, "Jumlah bed minimal 1")
      .max(20, "Jumlah bed maksimal 20 per kamar")
      .optional(),
    floor: z.string().optional(),
    building: z.string().optional(),
    dailyRate: z.string().optional(),
    facilities: z.string().optional(),
    status: z.enum(["available", "occupied", "maintenance", "reserved"]).optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      // If dailyRate is provided, validate it's a positive number
      if (data.dailyRate) {
        const rate = parseFloat(data.dailyRate)
        return !isNaN(rate) && rate > 0 && rate <= 100000000
      }
      return true
    },
    {
      message: "Tarif harian harus berupa angka positif",
      path: ["dailyRate"],
    }
  )

/**
 * Inpatient Prescription Schema
 * For ordering medications during inpatient stay
 * Includes date validation for recurring medications
 */
export const inpatientPrescriptionSchema = z
  .object({
    visitId: z.string().min(1, "Visit ID harus valid"),
    medicalRecordId: z.string().optional(), // Optional - which medical record ordered it
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
  .refine(
    (data) => {
      // If isRecurring is true, startDate must be provided
      if (data.isRecurring && !data.startDate) {
        return false
      }
      return true
    },
    {
      message: "Tanggal mulai wajib diisi untuk obat rutin",
      path: ["startDate"],
    }
  )
  .refine(
    (data) => {
      // If isRecurring is true, endDate must be provided
      if (data.isRecurring && !data.endDate) {
        return false
      }
      return true
    },
    {
      message: "Tanggal selesai wajib diisi untuk obat rutin",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // If both dates provided, validate they are valid dates
      if (data.startDate) {
        const startDate = new Date(data.startDate)
        if (isNaN(startDate.getTime())) {
          return false
        }
      }
      if (data.endDate) {
        const endDate = new Date(data.endDate)
        if (isNaN(endDate.getTime())) {
          return false
        }
      }
      return true
    },
    {
      message: "Format tanggal tidak valid",
      path: ["startDate"],
    }
  )
  .refine(
    (data) => {
      // endDate must be after startDate
      if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate)
        const endDate = new Date(data.endDate)
        return endDate > startDate
      }
      return true
    },
    {
      message: "Tanggal selesai harus setelah tanggal mulai",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // startDate should not be too far in the past (max 24 hours)
      if (data.startDate) {
        const startDate = new Date(data.startDate)
        const now = new Date()
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        return startDate >= twentyFourHoursAgo
      }
      return true
    },
    {
      message: "Tanggal mulai tidak boleh lebih dari 24 jam yang lalu",
      path: ["startDate"],
    }
  )
  .refine(
    (data) => {
      // If isRecurring, administrationSchedule should be provided
      if (data.isRecurring && !data.administrationSchedule) {
        return false
      }
      return true
    },
    {
      message: "Jadwal pemberian wajib diisi untuk obat rutin",
      path: ["administrationSchedule"],
    }
  )

/**
 * Inpatient Procedure Schema
 * For ordering procedures/tindakan during inpatient stay
 * Includes date validation for scheduled procedures
 */
export const inpatientProcedureSchema = z
  .object({
    visitId: z.string().min(1, "Visit ID harus valid"),
    medicalRecordId: z.string().optional(), // Optional - which medical record ordered it

    // Service reference (preferred) or manual entry
    serviceId: z.string().optional(),
    description: z.string().min(1, "Deskripsi tindakan harus diisi"),
    icd9Code: z.string().optional(),

    // Scheduling
    scheduledAt: z.string().optional(), // ISO date string

    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      // If scheduledAt is provided, validate it's a valid date
      if (data.scheduledAt) {
        const scheduledDate = new Date(data.scheduledAt)
        if (isNaN(scheduledDate.getTime())) {
          return false
        }
      }
      return true
    },
    {
      message: "Format tanggal jadwal tidak valid",
      path: ["scheduledAt"],
    }
  )
  .refine(
    (data) => {
      // scheduledAt should not be too far in the past (max 24 hours)
      if (data.scheduledAt) {
        const scheduledDate = new Date(data.scheduledAt)
        const now = new Date()
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        return scheduledDate >= twentyFourHoursAgo
      }
      return true
    },
    {
      message: "Tanggal jadwal tidak boleh lebih dari 24 jam yang lalu",
      path: ["scheduledAt"],
    }
  )

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

export const prescriptionItemSchema = z
  .object({
    drugId: z.string().min(1, "Obat harus dipilih"),
    drugName: z.string().min(1),
    drugPrice: z.string().optional(),
    dosage: z.string().optional(),
    frequency: z.string().min(1, "Frekuensi harus diisi"),
    route: z.string().optional(),
    quantity: z.number().int().positive("Jumlah harus positif"),
    instructions: z.string().optional(),
    isRecurring: z.boolean(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    administrationSchedule: z.string().optional(),
  })
  .refine(
    (data) => {
      // If isRecurring is true, startDate must be provided
      if (data.isRecurring && !data.startDate) {
        return false
      }
      return true
    },
    {
      message: "Tanggal mulai wajib diisi untuk obat rutin",
      path: ["startDate"],
    }
  )
  .refine(
    (data) => {
      // If isRecurring is true, endDate must be provided
      if (data.isRecurring && !data.endDate) {
        return false
      }
      return true
    },
    {
      message: "Tanggal selesai wajib diisi untuk obat rutin",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // If both dates provided, validate they are valid dates
      if (data.startDate) {
        const startDate = new Date(data.startDate)
        if (isNaN(startDate.getTime())) {
          return false
        }
      }
      if (data.endDate) {
        const endDate = new Date(data.endDate)
        if (isNaN(endDate.getTime())) {
          return false
        }
      }
      return true
    },
    {
      message: "Format tanggal tidak valid",
      path: ["startDate"],
    }
  )
  .refine(
    (data) => {
      // endDate must be after startDate
      if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate)
        const endDate = new Date(data.endDate)
        return endDate > startDate
      }
      return true
    },
    {
      message: "Tanggal selesai harus setelah tanggal mulai",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // startDate should not be too far in the past (max 24 hours)
      if (data.startDate) {
        const startDate = new Date(data.startDate)
        const now = new Date()
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        return startDate >= twentyFourHoursAgo
      }
      return true
    },
    {
      message: "Tanggal mulai tidak boleh lebih dari 24 jam yang lalu",
      path: ["startDate"],
    }
  )
  .refine(
    (data) => {
      // If isRecurring, administrationSchedule should be provided
      if (data.isRecurring && !data.administrationSchedule) {
        return false
      }
      return true
    },
    {
      message: "Jadwal pemberian wajib diisi untuk obat rutin",
      path: ["administrationSchedule"],
    }
  )

/**
 * Discharge Summary Schema
 * Used when doctor fills discharge summary (Resume Medis)
 */
export const dischargeSummarySchema = z.object({
  visitId: z.string().min(1, "Visit ID is required"),
  admissionDiagnosis: z.string().min(1, "Diagnosis masuk wajib diisi"),
  dischargeDiagnosis: z.string().min(1, "Diagnosis pulang wajib diisi"),
  clinicalSummary: z.string().min(1, "Ringkasan klinis wajib diisi"),
  proceduresPerformed: z.string().optional(),
  medicationsOnDischarge: z.string().optional(),
  dischargeInstructions: z.string().min(1, "Instruksi pulang wajib diisi"),
  dietaryRestrictions: z.string().optional(),
  activityRestrictions: z.string().optional(),
  followUpDate: z.date().optional().nullable(),
  followUpInstructions: z.string().optional(),
})

/**
 * Type exports
 */
export type RoomInput = z.infer<typeof roomSchema>
export type BedAssignmentInput = z.infer<typeof bedAssignmentSchema>
export type BedTransferInput = z.infer<typeof bedTransferSchema>
export type VitalSignsInput = z.infer<typeof vitalSignsSchema>
export type MedicalRecordInput = z.infer<typeof medicalRecordSchema>
export type CPPTInput = z.infer<typeof cpptSchema> // Deprecated: Use MedicalRecordInput
export type MaterialUsageInput = z.infer<typeof materialUsageSchema>
export type RoomUpdateInput = z.infer<typeof roomUpdateSchema>
export type InpatientPrescriptionInput = z.infer<typeof inpatientPrescriptionSchema>
export type InpatientProcedureInput = z.infer<typeof inpatientProcedureSchema>
export type AdministerPrescriptionInput = z.infer<typeof administerPrescriptionSchema>
export type UpdateProcedureStatusInput = z.infer<typeof updateProcedureStatusSchema>
export type DischargeSummaryInput = z.infer<typeof dischargeSummarySchema>
