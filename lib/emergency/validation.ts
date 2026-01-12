/**
 * Emergency Module Validation Schemas
 * Centralized Zod schemas for API validation
 */

import { z } from "zod"

/**
 * Quick ER Registration Schema
 */
export const quickERRegistrationSchema = z.object({
  name: z.string().min(1, "Nama pasien wajib diisi"),
  chiefComplaint: z.string().min(1, "Keluhan utama wajib diisi"),
  triageStatus: z.enum(["red", "yellow", "green"], {
    message: "Status triage wajib dipilih",
  }),
  nik: z.string().length(16, "NIK harus 16 digit").optional().or(z.literal("")),
  phone: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  birthDate: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * Complete Patient Registration Schema
 */
export const completeRegistrationSchema = z.object({
  patientId: z.string().min(1, "Patient ID harus valid"),
  nik: z.string().length(16, "NIK harus 16 digit"),
  address: z.string().min(1, "Alamat wajib diisi"),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["male", "female"], {
    message: "Jenis kelamin wajib dipilih",
  }),
  phone: z.string().optional(),
  insuranceType: z.enum(["BPJS", "Asuransi Swasta", "Umum"], {
    message: "Jenis jaminan wajib dipilih",
  }),
  insuranceNumber: z.string().optional(),
})

/**
 * Handover Schema
 */
export const handoverSchema = z.object({
  visitId: z.string().min(1, "Visit ID harus valid"),
  newVisitType: z.enum(["outpatient", "inpatient"], {
    message: "Jenis kunjungan baru wajib dipilih",
  }),
  poliId: z.string().optional(),
  roomId: z.string().optional(),
  doctorId: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * ER Medical Record Schema
 */
export const erMedicalRecordSchema = z.object({
  visitId: z.number().int().positive("Visit ID harus valid"),
  briefHistory: z.string().min(1, "Riwayat singkat wajib diisi"),
  temperature: z.string().optional(),
  bloodPressure: z.string().optional(),
  pulse: z.string().optional(),
  respiration: z.string().optional(),
  oxygenSaturation: z.string().optional(),
  consciousness: z.string().optional(),
  physicalExam: z.string().min(1, "Pemeriksaan fisik wajib diisi"),
  emergencyActions: z.string().min(1, "Tindakan darurat wajib diisi"),
  workingDiagnosis: z.string().min(1, "Diagnosis kerja wajib diisi"),
  disposition: z.enum(["discharged", "admitted", "referred", "observation"], {
    message: "Disposisi wajib dipilih",
  }),
  instructions: z.string().optional(),
  notes: z.string().optional(),
  isLocked: z.boolean().optional(),
})

/**
 * Type exports
 */
export type QuickERRegistrationInput = z.infer<typeof quickERRegistrationSchema>
export type CompleteRegistrationInput = z.infer<typeof completeRegistrationSchema>
export type HandoverInput = z.infer<typeof handoverSchema>
export type ERMedicalRecordInput = z.infer<typeof erMedicalRecordSchema>
