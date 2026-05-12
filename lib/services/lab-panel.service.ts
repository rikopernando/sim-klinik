import axios from "axios"
import type {
  LabPanelRecord,
  LabPanelFilters,
  CreateLabPanelInput,
  UpdateLabPanelInput,
} from "@/types/lab-panel"
import type { ResponseApi } from "@/types/api"

const BASE = "/api/master-data/lab-panels"

export async function getLabPanels(filters: LabPanelFilters = {}) {
  const params = new URLSearchParams()
  if (filters.search) params.set("search", filters.search)
  if (filters.isActive !== undefined) params.set("isActive", String(filters.isActive))
  if (filters.page) params.set("page", String(filters.page))
  if (filters.limit) params.set("limit", String(filters.limit))

  const { data } = await axios.get<ResponseApi<LabPanelRecord[]>>(`${BASE}?${params.toString()}`)
  return data
}

export async function createLabPanel(input: CreateLabPanelInput) {
  const { data } = await axios.post<ResponseApi<LabPanelRecord>>(BASE, input)
  return data
}

export async function updateLabPanel(id: string, input: UpdateLabPanelInput) {
  const { data } = await axios.patch<ResponseApi<LabPanelRecord>>(`${BASE}/${id}`, input)
  return data
}
