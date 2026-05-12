import axios from "axios"
import type {
  InventoryItemRecord,
  InventoryItemFilters,
  CreateDrugInput,
  UpdateDrugInput,
} from "@/types/drug"
import type { ResponseApi } from "@/types/api"

const BASE = "/api/master-data/drugs"

export async function getDrugs(filters: InventoryItemFilters = {}) {
  const params = new URLSearchParams()
  if (filters.search) params.set("search", filters.search)
  if (filters.itemType) params.set("itemType", filters.itemType)
  if (filters.isActive !== undefined) params.set("isActive", String(filters.isActive))
  if (filters.page) params.set("page", String(filters.page))
  if (filters.limit) params.set("limit", String(filters.limit))

  const { data } = await axios.get<ResponseApi<InventoryItemRecord[]>>(
    `${BASE}?${params.toString()}`
  )
  return data
}

export async function createDrug(input: CreateDrugInput) {
  const { data } = await axios.post<ResponseApi<InventoryItemRecord>>(BASE, input)
  return data
}

export async function updateDrug(id: string, input: UpdateDrugInput) {
  const { data } = await axios.patch<ResponseApi<InventoryItemRecord>>(`${BASE}/${id}`, input)
  return data
}
