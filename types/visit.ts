import { Patient } from "./registration"

export interface Visit {
  id: string
  patientId: string
  visitType: string
  visitNumber: string
  poliId: string | null
  doctorId: string | null
  queueNumber: string | null
  triageStatus: string | null
  chiefComplaint: string | null
  roomId: string | null
  admissionDate: string | null
  dischargeDate: string | null
  status: string
  arrivalTime: string
  startTime: string | null
  endTime: string | null
  disposition: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface VisitFormData {
  visitType: "outpatient" | "inpatient" | "emergency"
  poliId?: string
  doctorId?: string
  triageStatus?: "red" | "yellow" | "green"
  chiefComplaint?: string
  roomId?: string
  notes?: string
}

export interface RegisteredVisit {
  visit: Visit
  patient: Patient | null
}
