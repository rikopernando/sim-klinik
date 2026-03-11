/**
 * Medical Record Validation Schemas
 */

import { z } from "zod"

/**
 * SOAP Form Schema
 */
export const soapFormSchema = z.object({
  soapSubjective: z.string().optional(),
  soapObjective: z.string().optional(),
  soapAssessment: z.string().optional(),
  soapPlan: z.string().optional(),
})

export type SoapFormData = z.infer<typeof soapFormSchema>

/**
 * Diagnosis Form Schema
 */
export const diagnosisFormSchema = z.object({
  icd10Code: z.string().optional(),
  description: z
    .string()
    .min(1, "Deskripsi diagnosis wajib diisi")
    .max(500, "Deskripsi maksimal 500 karakter"),
  diagnosisType: z.enum(["primary", "secondary"]).or(z.string()),
})

export type DiagnosisFormData = z.infer<typeof diagnosisFormSchema>

// Schema for the entire form with array of diagnoses
export const createDiagnosisBulkFormSchema = z.object({
  diagnoses: z.array(diagnosisFormSchema).min(1, "Minimal 1 diagnosis harus ditambahkan"),
})

export const createDiagnosisSchema = z.object({
  ...diagnosisFormSchema.shape,
  medicalRecordId: z.string(),
})

export const updateDiagnosisSchema = z.object({
  ...diagnosisFormSchema.shape,
  diagnosisId: z.string(),
})

export type CreateDiagnosisFormData = z.infer<typeof createDiagnosisSchema>
export type CreateDiagnosisBulkFormData = z.infer<typeof createDiagnosisBulkFormSchema>
export type UpdateDiagnosisFormData = z.infer<typeof updateDiagnosisSchema>

/**
 * Prescription Form Schema
 * Supports both regular drugs and compound recipes (obat racik)
 */

// Base fields shared by both prescription types
const basePrescriptionFields = {
  dosage: z.string().optional(),
  frequency: z.string().min(1, "Frekuensi wajib diisi"),
  quantity: z.number().min(1, "Jumlah minimal 1"),
  instructions: z.string().optional(),
  route: z.string().optional(),
}

// Regular drug prescription schema
const drugPrescriptionSchema = z.object({
  isCompound: z.literal(false),
  drugId: z.string().min(1, "Obat wajib dipilih"),
  drugName: z.string().optional(),
  drugPrice: z.string().optional(),
  // Compound fields (empty for regular prescriptions)
  compoundRecipeId: z.string().optional(),
  compoundRecipeName: z.string().optional(),
  compoundRecipePrice: z.string().optional(),
  ...basePrescriptionFields,
})

// Compound prescription schema
const compoundPrescriptionSchema = z.object({
  isCompound: z.literal(true),
  compoundRecipeId: z.string().min(1, "Obat racik wajib dipilih"),
  compoundRecipeName: z.string().optional(),
  compoundRecipePrice: z.string().optional(),
  // Drug fields (empty for compound prescriptions)
  drugId: z.string().optional(),
  drugName: z.string().optional(),
  drugPrice: z.string().optional(),
  ...basePrescriptionFields,
})

// Combined using discriminated union
export const prescriptionFormSchema = z.discriminatedUnion("isCompound", [
  drugPrescriptionSchema,
  compoundPrescriptionSchema,
])

export const createPrescriptionFormSchema = z.discriminatedUnion("isCompound", [
  drugPrescriptionSchema.extend({
    medicalRecordId: z.string(),
    visitId: z.string(),
  }),
  compoundPrescriptionSchema.extend({
    medicalRecordId: z.string(),
    visitId: z.string(),
  }),
])

// Schema for the entire form with array of prescriptions
export const prescriptionFormBulkSchema = z.object({
  prescriptions: z.array(prescriptionFormSchema).min(1, "Minimal 1 resep harus ditambahkan"),
})

export type PrescriptionFormDataPayload = z.infer<typeof createPrescriptionFormSchema>
export type PrescriptionFormData = z.infer<typeof prescriptionFormSchema>
export type PrescriptionFormBulkData = z.infer<typeof prescriptionFormBulkSchema>

// Validation schema for a single procedure item
export const procedureItemSchema = z.object({
  serviceId: z.string().min(1, "Tindakan wajib dipilih"),
  serviceName: z.string().min(1, "Tindakan wajib dipilih"),
  servicePrice: z.string().optional(),
  icd9Code: z.string().min(1, "Kode ICD-9 wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  performedBy: z.string().min(1, "Dilakukan oleh wajib diisi"),
  notes: z.string().optional(),
})

// Schema for the entire form with array of procedures
export const procedureFormBulkSchema = z.object({
  procedures: z.array(procedureItemSchema).min(1, "Minimal 1 tindakan harus ditambahkan"),
})

export const createProcedureFormSchema = z.object({
  ...procedureItemSchema.shape,
  medicalRecordId: z.string(),
  visitId: z.string(),
})

export type CreateProcedureFormData = z.infer<typeof createProcedureFormSchema>
export type ProcedureFormData = z.infer<typeof procedureItemSchema>
export type ProcedureFormBulkData = z.infer<typeof procedureFormBulkSchema>

/**
 * Lock Medical Record Schema
 * Optional billing adjustments can be provided by doctor
 */
export const lockSchema = z.object({
  id: z.string(),
  billingAdjustment: z.number().optional(), // Positive = surcharge, Negative = discount
  adjustmentNote: z.string().optional(), // Note explaining the adjustment
})

export type LockMedicalRecordPayload = z.infer<typeof lockSchema>
