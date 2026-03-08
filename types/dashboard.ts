import { Patient } from "./registration"
import { Visit } from "./visit"

export interface DoctorStats {
  today: {
    total: number
    waiting: number
    inProgress: number
    completed: number
  }
  unlockedRecords: number
  totalPatients: number
  lastUpdated: string
}

export interface QueuePatient {
  id: string
  name: string
}

export interface QueuePoli {
  name: string
  id: string
}

export interface QueueMedicalRecord {
  id: string
  isLocked: boolean
}

export interface QueueItem {
  visit: Visit
  patient: Patient | null
  poli: QueuePoli | null
  medicalRecord: QueueMedicalRecord | null
}
