import type { LabTestRecord } from "./lab-test"

export interface LabPanelRecord {
  id: string
  code: string
  name: string
  description: string | null
  price: string
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
  testCount?: number
  tests?: Pick<LabTestRecord, "id" | "code" | "name" | "department">[]
}

export interface LabPanelFilters {
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export interface CreateLabPanelInput {
  code: string
  name: string
  description?: string
  price: number
  testIds: string[]
}

export interface UpdateLabPanelInput extends Partial<CreateLabPanelInput> {
  isActive?: boolean
}
