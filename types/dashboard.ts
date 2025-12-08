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

export interface QueueVisit {
  id: string
  visitNumber: string
  visitType: string
  status: string
  queueNumber: number | null
}

export interface QueuePoli {
  name: string
}

export interface QueueMedicalRecord {
  id: string
  isLocked: boolean
}

export interface QueueItem {
  visit: QueueVisit
  patient: QueuePatient | null
  poli: QueuePoli | null
  medicalRecord: QueueMedicalRecord | null
}
