export type Department = "LAB" | "RAD"

export interface LabTestRecord {
  id: string
  code: string
  name: string
  category: string
  department: Department
  price: string
  specimenType: string | null
  tatHours: number | null
  description: string | null
  instructions: string | null
  isActive: boolean
  requiresFasting: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export interface LabTestFilters {
  search?: string
  department?: Department
  isActive?: boolean
  page?: number
  limit?: number
}

export interface CreateLabTestInput {
  code: string
  name: string
  category: string
  department: Department
  price: number
  specimenType?: string
  tatHours?: number
  requiresFasting?: boolean
  description?: string
  instructions?: string
}

export interface UpdateLabTestInput extends Partial<CreateLabTestInput> {
  isActive?: boolean
}
