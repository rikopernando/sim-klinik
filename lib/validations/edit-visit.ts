import { z } from "zod"

/**
 * Edit Visit Form Validation Schema
 * All fields optional since this is used for PATCH operations.
 * Reuses range validations from registration schema.
 */
export const editVisitSchema = z
  .object({
    // Visit info
    visitType: z.enum(["outpatient", "inpatient", "emergency"]).optional(),
    poliId: z.string().optional(),
    doctorId: z.string().optional(),
    triageStatus: z.enum(["red", "yellow", "green"]).optional(),
    chiefComplaint: z.string().optional(),
    notes: z.string().optional(),
    arrivalTime: z.string().optional(),
    roomId: z.string().optional(),
    disposition: z.string().optional(),
    status: z.string().optional(),

    // Vital Signs
    temperature: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true
          const temp = parseFloat(val)
          return !isNaN(temp) && temp >= 35 && temp <= 42
        },
        { message: "Suhu harus antara 35-42°C" }
      ),
    bloodPressureSystolic: z.coerce
      .number()
      .int()
      .min(60, "Tekanan darah sistolik minimal 60 mmHg")
      .max(250, "Tekanan darah sistolik maksimal 250 mmHg")
      .optional()
      .or(z.literal("")),
    bloodPressureDiastolic: z.coerce
      .number()
      .int()
      .min(40, "Tekanan darah diastolik minimal 40 mmHg")
      .max(150, "Tekanan darah diastolik maksimal 150 mmHg")
      .optional()
      .or(z.literal("")),
    pulse: z.coerce
      .number()
      .int()
      .min(30, "Denyut nadi minimal 30 bpm")
      .max(200, "Denyut nadi maksimal 200 bpm")
      .optional()
      .or(z.literal("")),
    respiratoryRate: z.coerce
      .number()
      .int()
      .min(8, "Laju napas minimal 8 per menit")
      .max(40, "Laju napas maksimal 40 per menit")
      .optional()
      .or(z.literal("")),
    oxygenSaturation: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true
          const o2 = parseFloat(val)
          return !isNaN(o2) && o2 >= 70 && o2 <= 100
        },
        { message: "Saturasi oksigen harus antara 70-100%" }
      ),
    weight: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true
          const w = parseFloat(val)
          return !isNaN(w) && w >= 0.5 && w <= 300
        },
        { message: "Berat badan harus antara 0.5-300 kg" }
      ),
    height: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true
          const h = parseFloat(val)
          return !isNaN(h) && h >= 30 && h <= 250
        },
        { message: "Tinggi badan harus antara 30-250 cm" }
      ),
    painScale: z.coerce.number().int().min(0).max(10).optional().or(z.literal("")),
    consciousness: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.bloodPressureSystolic && !data.bloodPressureDiastolic) return false
      if (data.bloodPressureDiastolic && !data.bloodPressureSystolic) return false
      return true
    },
    {
      message: "Tekanan darah sistolik dan diastolik harus diisi bersamaan",
      path: ["bloodPressureSystolic"],
    }
  )
  .refine(
    (data) => {
      if (
        typeof data.bloodPressureSystolic === "number" &&
        typeof data.bloodPressureDiastolic === "number"
      ) {
        return data.bloodPressureSystolic > data.bloodPressureDiastolic
      }
      return true
    },
    {
      message: "Tekanan darah sistolik harus lebih besar dari diastolik",
      path: ["bloodPressureSystolic"],
    }
  )

export type EditVisitFormData = z.infer<typeof editVisitSchema>

/**
 * Server-side validation schema for API PATCH route
 * Strips vitals fields since those go through a separate endpoint
 */
export const editVisitApiSchema = z.object({
  visitType: z.enum(["outpatient", "inpatient", "emergency"]).optional(),
  poliId: z.string().nullable().optional(),
  doctorId: z.string().nullable().optional(),
  triageStatus: z.enum(["red", "yellow", "green"]).nullable().optional(),
  chiefComplaint: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  arrivalTime: z.string().optional(),
  roomId: z.string().nullable().optional(),
  disposition: z.string().nullable().optional(),
  status: z.string().optional(),
})

export type EditVisitApiData = z.infer<typeof editVisitApiSchema>

/**
 * Shared data interface for the EditVisitDialog
 * Works with QueueItem, ERQueueItem, and direct API responses
 */
export interface EditVisitData {
  visit: {
    id: string
    visitNumber: string
    queueNumber?: string | number | null
    visitType: string
    status: string
    arrivalTime?: string
    triageStatus?: string | null
    poliId?: string | null
    doctorId?: string | null
    notes?: string | null
    chiefComplaint?: string | null
  }
  patient: {
    id: string
    mrNumber: string
    name: string
    gender?: string | null
    dateOfBirth?: string | null
  }
}
