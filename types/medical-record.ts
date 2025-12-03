/**
 * Medical Record Types
 */

export interface MedicalRecord {
  id: number
  visitId: number
  doctorId: string
  soapSubjective: string | null
  soapObjective: string | null
  soapAssessment: string | null
  soapPlan: string | null
  physicalExam: string | null
  laboratoryResults: string | null
  radiologyResults: string | null
  isLocked: boolean
  isDraft: boolean
  lockedAt: Date | null
  lockedBy: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Diagnosis {
  id: number
  medicalRecordId: number
  icd10Code: string
  description: string
  diagnosisType: "primary" | "secondary"
  createdAt: Date
}

export interface Procedure {
  id: number
  medicalRecordId: number
  serviceId: number | null
  serviceName: string | null
  servicePrice: string | null
  icd9Code: string
  description: string
  performedBy: string | null
  performedByName: string | null
  performedAt: Date
  notes: string | null
  createdAt: Date
}

export interface Prescription {
  id: number
  medicalRecordId: number
  drugId: number
  drugName: string
  drugPrice: string | null
  dosage: string
  frequency: string
  duration: string | null
  quantity: number
  instructions: string | null
  route: string | null
  isFulfilled: boolean
  fulfilledBy: string | null
  fulfilledAt: Date | null
  dispensedQuantity: number | null
  inventoryId: number | null
  notes: string | null
  // Pharmacist-added prescription fields
  addedByPharmacist: boolean
  addedByPharmacistId: string | null
  addedByPharmacistName: string | null
  approvedBy: string | null
  approvedAt: Date | null
  pharmacistNote: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Visit {
  id: number
  visitNumber: string
  patientId: number
  visitType: "outpatient" | "inpatient" | "emergency"
  poliId: number | null
  doctorId: string | null
  triageStatus: string | null
  chiefComplaint: string | null
  roomId: number | null
  status: string
  arrivalTime: Date
  startTime: Date | null
  endTime: Date | null
  dischargeDate: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface MedicalRecordData {
  medicalRecord: MedicalRecord
  diagnoses: Diagnosis[]
  procedures: Procedure[]
  prescriptions: Prescription[]
  visit: Visit
}

export interface MedicalRecordFormData {
  visitId: number
  soapSubjective?: string
  soapObjective?: string
  soapAssessment?: string
  soapPlan?: string
  physicalExam?: string
  laboratoryResults?: string
  radiologyResults?: string
  isDraft?: boolean
}

export const DIAGNOSIS_TYPES = [
  { value: "primary", label: "Diagnosis Utama" },
  { value: "secondary", label: "Diagnosis Sekunder" },
] as const

export const MEDICATION_ROUTES = [
  { value: "oral", label: "Oral (Diminum)" },
  { value: "topical", label: "Topikal (Oles)" },
  { value: "injection", label: "Injeksi (Suntik)" },
  { value: "inhalation", label: "Inhalasi (Hirup)" },
  { value: "rectal", label: "Rektal" },
  { value: "sublingual", label: "Sublingual" },
] as const
