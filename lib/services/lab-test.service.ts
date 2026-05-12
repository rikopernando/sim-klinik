import axios from "axios"
import type {
  LabTestRecord,
  LabTestFilters,
  CreateLabTestInput,
  UpdateLabTestInput,
} from "@/types/lab-test"
import type { ResponseApi } from "@/types/api"

const BASE = "/api/master-data/lab-tests"

export async function getLabTests(filters: LabTestFilters = {}) {
  const params = new URLSearchParams()
  if (filters.search) params.set("search", filters.search)
  if (filters.department) params.set("department", filters.department)
  if (filters.isActive !== undefined) params.set("isActive", String(filters.isActive))
  if (filters.page) params.set("page", String(filters.page))
  if (filters.limit) params.set("limit", String(filters.limit))

  const { data } = await axios.get<ResponseApi<LabTestRecord[]>>(`${BASE}?${params.toString()}`)
  return data
}

export async function createLabTest(input: CreateLabTestInput) {
  const { data } = await axios.post<ResponseApi<LabTestRecord>>(BASE, input)
  return data
}

export async function updateLabTest(id: string, input: UpdateLabTestInput) {
  const { data } = await axios.patch<ResponseApi<LabTestRecord>>(`${BASE}/${id}`, input)
  return data
}
