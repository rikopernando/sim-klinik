/**
 * Medical Record Validation Schemas
 */

import { z } from "zod";

/**
 * SOAP Form Schema
 */
export const soapFormSchema = z.object({
    soapSubjective: z.string().optional(),
    soapObjective: z.string().optional(),
    soapAssessment: z.string().optional(),
    soapPlan: z.string().optional(),
});

export type SoapFormData = z.infer<typeof soapFormSchema>;

/**
 * Diagnosis Form Schema
 */
export const diagnosisFormSchema = z.object({
    icd10Code: z
        .string()
        .min(1, "Kode ICD-10 wajib diisi")
        .max(10, "Kode ICD-10 maksimal 10 karakter"),
    description: z
        .string()
        .min(1, "Deskripsi diagnosis wajib diisi")
        .max(500, "Deskripsi maksimal 500 karakter"),
    diagnosisType: z.enum(["primary", "secondary"]).default("primary"),
});

export type DiagnosisFormData = z.infer<typeof diagnosisFormSchema>;

/**
 * Prescription Form Schema
 */
export const prescriptionFormSchema = z.object({
    drugId: z.number().int().positive("Obat wajib dipilih"),
    dosage: z
        .string()
        .min(1, "Dosis wajib diisi")
        .max(100, "Dosis maksimal 100 karakter"),
    frequency: z
        .string()
        .min(1, "Frekuensi wajib diisi")
        .max(100, "Frekuensi maksimal 100 karakter"),
    duration: z.string().max(100, "Durasi maksimal 100 karakter").optional(),
    quantity: z.number().int().positive("Jumlah harus lebih dari 0"),
    instructions: z.string().max(500, "Instruksi maksimal 500 karakter").optional(),
    route: z.string().max(50, "Rute maksimal 50 karakter").optional(),
});

export type PrescriptionFormData = z.infer<typeof prescriptionFormSchema>;

/**
 * Procedure Form Schema
 */
export const procedureFormSchema = z.object({
    icd9Code: z
        .string()
        .min(1, "Kode ICD-9 wajib diisi")
        .max(10, "Kode ICD-9 maksimal 10 karakter"),
    description: z
        .string()
        .min(1, "Deskripsi tindakan wajib diisi")
        .max(500, "Deskripsi maksimal 500 karakter"),
    performedBy: z.string().max(255, "Nama maksimal 255 karakter").optional(),
    notes: z.string().max(1000, "Catatan maksimal 1000 karakter").optional(),
});

export type ProcedureFormData = z.infer<typeof procedureFormSchema>;
