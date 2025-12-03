import { z } from "zod"

/**
 * Patient Registration Form Validation Schema
 * - NIK: Required, 16 digits, numbers only
 * - Name: Required, min 2 characters
 * - Gender: Required, male or female
 * - Insurance Number: Required if insurance type is not "Umum"
 */
export const patientFormSchema = z
  .object({
    // Step 1: Basic Information
    nik: z
      .string()
      .min(1, "NIK wajib diisi")
      .length(16, "NIK harus 16 digit")
      .regex(/^\d+$/, "NIK hanya boleh angka"),
    name: z.string().min(2, "Nama minimal 2 karakter").max(255),
    dateOfBirth: z.date({
      required_error: "Tanggal lahir wajib diisi",
      invalid_type_error: "Tanggal lahir tidak valid",
    }),
    gender: z.enum(["male", "female"], {
      message: "Pilih jenis kelamin",
    }),
    bloodType: z.string().optional(),

    // Step 2: Contact & Insurance
    phone: z.string().max(20).optional(),
    address: z.string().optional(),
    email: z.string().email("Email tidak valid").optional().or(z.literal("")),
    emergencyContact: z.string().max(255).optional(),
    emergencyPhone: z.string().max(20).optional(),
    insuranceType: z.string().optional(),
    insuranceNumber: z.string().max(50).optional(),
    allergies: z.string().optional(),
  })
  .refine(
    (data) => {
      // If insurance type is not "Umum" and not empty, insurance number is required
      if (data.insuranceType && data.insuranceType !== "Umum") {
        return !!data.insuranceNumber && data.insuranceNumber.trim().length > 0
      }
      return true
    },
    {
      message: "Nomor jaminan wajib diisi untuk jenis jaminan selain Umum",
      path: ["insuranceNumber"],
    }
  )

/**
 * Visit Registration Form Validation Schema
 * - Outpatient: Poli and Doctor are required
 * - Inpatient: Room is required
 * - Emergency: Chief complaint is required
 */
export const visitFormSchema = z
  .object({
    visitType: z.enum(["outpatient", "inpatient", "emergency"]),
    poliId: z.string().optional(),
    doctorId: z.string().optional(),
    triageStatus: z.enum(["red", "yellow", "green"]).optional(),
    chiefComplaint: z.string().optional(),
    roomId: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      // Outpatient: poliId is required
      if (data.visitType === "outpatient") {
        return !!data.poliId && data.poliId.trim().length > 0
      }
      return true
    },
    {
      message: "Poli/Poliklinik wajib dipilih untuk rawat jalan",
      path: ["poliId"],
    }
  )
  .refine(
    (data) => {
      // Outpatient: doctorId is required
      if (data.visitType === "outpatient") {
        return !!data.doctorId && data.doctorId.trim().length > 0
      }
      return true
    },
    {
      message: "Dokter wajib dipilih untuk rawat jalan",
      path: ["doctorId"],
    }
  )
  .refine(
    (data) => {
      // Inpatient: roomId is required
      if (data.visitType === "inpatient") {
        return !!data.roomId && data.roomId.trim().length > 0
      }
      return true
    },
    {
      message: "Kamar wajib dipilih untuk rawat inap",
      path: ["roomId"],
    }
  )
  .refine(
    (data) => {
      // Emergency: chiefComplaint is required
      if (data.visitType === "emergency") {
        return !!data.chiefComplaint && data.chiefComplaint.trim().length > 0
      }
      return true
    },
    {
      message: "Keluhan utama wajib diisi untuk UGD",
      path: ["chiefComplaint"],
    }
  )

export type PatientFormData = z.infer<typeof patientFormSchema>
export type VisitFormData = z.infer<typeof visitFormSchema>
