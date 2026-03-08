// Registration Module Types

export interface Patient {
  id: string
  mrNumber: string
  nik: string | null
  name: string
  dateOfBirth: string | null
  gender: string | null
  bloodType: string | null
  phone: string | null
  email: string | null
  address: string | null
  // Hierarchical address fields
  provinceId: string | null
  provinceName: string | null
  cityId: string | null
  cityName: string | null
  subdistrictId: string | null
  subdistrictName: string | null
  villageId: string | null
  villageName: string | null
  emergencyContact: string | null
  emergencyPhone: string | null
  insuranceType: string | null
  insuranceNumber: string | null
  allergies: string | null
  createdAt?: string
  updatedAt?: string
}

export interface PatientFormData {
  nik: string
  name: string
  dateOfBirth?: Date
  gender: "male" | "female"
  bloodType?: string
  phone?: string
  address?: string
  // Hierarchical address fields
  provinceId?: string
  provinceName?: string
  cityId?: string
  cityName?: string
  subdistrictId?: string
  subdistrictName?: string
  villageId?: string
  villageName?: string
  email?: string
  emergencyContact?: string
  emergencyPhone?: string
  insuranceType?: string
  insuranceNumber?: string
  allergies?: string
}

export interface VisitFormData {
  visitType: "outpatient" | "inpatient" | "emergency"
  poliId?: string
  doctorId?: string
  triageStatus?: "red" | "yellow" | "green"
  chiefComplaint?: string
  roomId?: string
  notes?: string
  // Vital Signs (all optional)
  temperature?: string
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  pulse?: number
  respiratoryRate?: number
  oxygenSaturation?: string
  weight?: string
  height?: string
  painScale?: number
  consciousness?: string
}

export type RegisteredPatient = Patient

export interface RegisteredVisit {
  visit: {
    id: string
    visitNumber: string
    queueNumber?: string
    visitType: string
    arrivalTime: string
  }
  patient: {
    id: string
    mrNumber: string
    name: string
  }
}

export interface Poli {
  id: string
  name: string
  code: string
}

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const

export const INSURANCE_TYPES = [
  { value: "BPJS", label: "BPJS Kesehatan" },
  { value: "Asuransi Swasta", label: "Asuransi Swasta" },
  { value: "Umum", label: "Umum (Cash)" },
] as const

export const TRIAGE_STATUS = [
  { value: "red", label: "Merah", description: "Gawat Darurat", color: "bg-red-500" },
  { value: "yellow", label: "Kuning", description: "Mendesak", color: "bg-yellow-500" },
  { value: "green", label: "Hijau", description: "Tidak Mendesak", color: "bg-green-500" },
] as const
