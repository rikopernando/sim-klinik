export type ItemType = "drug" | "material"

export interface InventoryItemRecord {
  id: string
  name: string
  genericName: string | null
  itemType: ItemType
  category: string | null
  unit: string
  price: string
  generalPrice: string | null
  minimumStock: number
  requiresPrescription: boolean
  isActive: boolean
  description: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface InventoryItemFilters {
  search?: string
  itemType?: ItemType
  isActive?: boolean
  page?: number
  limit?: number
}

export interface CreateDrugInput {
  name: string
  genericName?: string
  itemType: ItemType
  category?: string
  unit: string
  price: number
  generalPrice?: number
  minimumStock?: number
  requiresPrescription?: boolean
  description?: string
}

export interface UpdateDrugInput extends Partial<CreateDrugInput> {
  isActive?: boolean
}
