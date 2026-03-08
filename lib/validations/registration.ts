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
      message: "Tanggal lahir wajib diisi",
    }),
    gender: z.enum(["male", "female"], {
      message: "Pilih jenis kelamin",
    }),
    bloodType: z.string().optional(),

    // Step 2: Contact & Insurance
    phone: z.string().max(20).optional(),

    // Hierarchical address fields
    provinceId: z.string().max(10).optional(),
    provinceName: z.string().max(100).optional(),
    cityId: z.string().max(10).optional(),
    cityName: z.string().max(100).optional(),
    subdistrictId: z.string().max(10).optional(),
    subdistrictName: z.string().max(100).optional(),
    villageId: z.string().max(15).optional(),
    villageName: z.string().max(100).optional(),

    // Street address (Jalan, RT/RW, No. Rumah)
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
 * - Inpatient: No additional fields required (bed assignment done separately)
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

    // Vital Signs (all optional)
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
    bloodPressureSystolic: z
      .number()
      .int()
      .min(60, "Tekanan darah sistolik minimal 60 mmHg")
      .max(250, "Tekanan darah sistolik maksimal 250 mmHg")
      .optional(),
    bloodPressureDiastolic: z
      .number()
      .int()
      .min(40, "Tekanan darah diastolik minimal 40 mmHg")
      .max(150, "Tekanan darah diastolik maksimal 150 mmHg")
      .optional(),
    pulse: z
      .number()
      .int()
      .min(30, "Denyut nadi minimal 30 bpm")
      .max(200, "Denyut nadi maksimal 200 bpm")
      .optional(),
    respiratoryRate: z
      .number()
      .int()
      .min(8, "Laju napas minimal 8 per menit")
      .max(40, "Laju napas maksimal 40 per menit")
      .optional(),
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
    painScale: z.number().int().min(0).max(10).optional(),
    consciousness: z.string().optional(),
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
