/**
 * Medical Record Types
 */

import { Drug } from "./pharmacy"
import { Patient } from "./registration"

export interface MedicalRecord {
  id: string
  visitId: string
  authorId: string
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
  id: string
  medicalRecordId: string
  icd10Code?: string | null
  description: string
  diagnosisType: string | "primary" | "secondary"
  createdAt: Date
}

export interface Procedure {
  id: string
  medicalRecordId?: string | null
  serviceId: string | null
  serviceName: string | null
  servicePrice: string | null
  icd9Code: string | null
  description: string
  performedBy: string | null
  performedByName: string | null
  performedAt: Date | null
  notes: string | null
  createdAt: Date
}

export interface Prescription {
  id: string
  medicalRecordId?: string | null
  drugId: string
  drugName?: string
  drugPrice?: string
  dosage: string | null
  frequency: string
  duration: string | null
  quantity: number
  instructions: string | null
  route: string | null
  isFulfilled: boolean
  fulfilledBy: string | null
  fulfilledAt: Date | null
  dispensedQuantity: number | null
  inventoryId: string | null
  notes: string | null
  // Pharmacist-added prescription fields
  addedByPharmacist: boolean
  addedByPharmacistId: string | null
  addedByPharmacistName?: string | null
  approvedBy: string | null
  approvedAt: Date | null
  pharmacistNote: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Visit {
  id: string
  visitNumber: string
  patientId: string
  visitType: string | "outpatient" | "inpatient" | "emergency"
  poliId: string | null
  doctorId: string | null
  triageStatus: string | null
  chiefComplaint: string | null
  roomId: string | null
  status: string
  arrivalTime: Date
  startTime: Date | null
  endTime: Date | null
  dischargeDate: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface MedicalRecordLabOrder {
  id: string
  orderNumber: string | null
  price: string
  status: string | null
  urgency: string | null
  clinicalIndication: string | null
  orderedAt: Date
  testId: string | null
  testName: string | null
  testCode: string | null
}

export interface MedicalRecordCoreData {
  medicalRecord: MedicalRecord
  visit: Visit
}

export interface MedicalRecordData extends MedicalRecordCoreData {
  diagnoses: Diagnosis[]
  procedures: Procedure[]
  prescriptions: Prescription[]
}

export interface MedicalRecordFormData {
  visitId: string
  soapSubjective?: string
  soapObjective?: string
  soapAssessment?: string
  soapPlan?: string
  physicalExam?: string
  laboratoryResults?: string
  radiologyResults?: string
  isDraft?: boolean
}

export interface MedicalRecordPrescription {
  prescription: Prescription
  drug: Drug | null
}

export interface MedicalRecordHistory {
  medicalRecord: MedicalRecord
  visit: Visit
  diagnoses: Diagnosis[]
  procedures: Procedure[]
  prescriptions: MedicalRecordPrescription[]
}

/**
 * Medical record history data structure
 */
export interface MedicalRecordHistoryData {
  patient: Patient
  history: MedicalRecordHistory[]
  totalRecords: number
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
  { value: "compounded", label: "Obat Racik" },
] as const

/**
 * Medical Record History List Item
 * Used for browsing medical records across all patients
 */
export interface MedicalRecordHistoryListItem {
  id: string
  visitId: string
  visitNumber: string
  visitType: string
  recordType: string
  isLocked: boolean
  isDraft: boolean
  createdAt: string
  updatedAt: string
  patient: {
    id: string
    mrNumber: string
    name: string
  }
  diagnosisCount: number
  procedureCount: number
  prescriptionCount: number
}

/**
 * Filters for medical record history list
 */
export interface MedicalRecordHistoryListFilters {
  search?: string
  visitType?: string
  isLocked?: string
  dateFrom?: string
  dateTo?: string
}

/**
 * Visit type options for filter dropdown
 */
export const VISIT_TYPE_OPTIONS = [
  { value: "all", label: "Semua Tipe" },
  { value: "outpatient", label: "Rawat Jalan" },
  { value: "inpatient", label: "Rawat Inap" },
  { value: "emergency", label: "UGD" },
] as const

/**
 * Locked status options for filter dropdown
 */
export const LOCKED_STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "true", label: "Terkunci" },
  { value: "false", label: "Belum Terkunci" },
] as const
