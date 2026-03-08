import { VisitStatus } from "./visit-status"

/**
 * Visit History Item - represents a single visit with related data
 */
export interface VisitHistoryItem {
  visit: {
    id: string
    visitNumber: string
    visitType: string
    status: VisitStatus
    arrivalTime: string
    startTime: string | null
    endTime: string | null
    queueNumber: string | null
    triageStatus: string | null
    chiefComplaint: string | null
    notes: string | null
    disposition: string | null
    createdAt: string
    updatedAt: string
  }
  patient: {
    id: string
    mrNumber: string
    name: string
    gender: string | null
    dateOfBirth: string | null
  }
  poli: {
    id: string
    name: string
    code: string
  } | null
  doctor: {
    id: string
    name: string
  } | null
}

/**
 * Visit History Filters for API and UI
 */
export interface VisitHistoryFilters {
  search?: string
  status?: string
  visitType?: string
  dateFrom?: string
  dateTo?: string
  poliId?: string
  doctorId?: string
}

/**
 * Visit Type Options for filter dropdown
 */
export const VISIT_TYPE_OPTIONS = [
  { value: "all", label: "Semua Tipe" },
  { value: "outpatient", label: "Rawat Jalan" },
  { value: "inpatient", label: "Rawat Inap" },
  { value: "emergency", label: "UGD" },
] as const

/**
 * Status filter options for visit history
 */
export const VISIT_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "registered", label: "Terdaftar" },
  { value: "waiting", label: "Menunggu" },
  { value: "in_examination", label: "Dalam Pemeriksaan" },
  { value: "examined", label: "Sudah Diperiksa" },
  { value: "ready_for_billing", label: "Siap Billing" },
  { value: "billed", label: "Sudah di-Billing" },
  { value: "paid", label: "Sudah Dibayar" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
] as const
