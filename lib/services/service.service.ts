import { Meta, ResponseApi } from "@/types/api"
import { PayloadServices, ResultService } from "@/types/services"
import { ApiServiceError, handleApiError } from "./api.service"
import axios from "axios"

export async function getServiceByIdRequest(id: string): Promise<ResultService | undefined> {
  try {
    const response = await axios.get<ResponseApi<ResultService>>(`/api/services/${id}`)
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing service data")
    }
    return response.data.data
  } catch (error) {
    console.error("Error in getServiceById service:", error)
    handleApiError(error)
  }
}

export async function getServicesRequest(opts?: {
  page?: number
  limit?: number
  search?: string
}): Promise<{ data: ResultService[]; meta?: Meta } | undefined> {
  try {
    const params: Record<string, string | number | boolean> = {}
    if (opts?.page) params.page = opts.page
    if (opts?.limit) params.limit = opts.limit
    if (opts?.search) params.search = opts.search

    const response = await axios.get<ResponseApi<ResultService[]>>("/api/services", { params })
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing services data")
    }
    return { data: response.data.data, meta: response.data.meta }
  } catch (error) {
    console.error("Error in getServices service:", error)
    handleApiError(error)
  }
}

export async function createServiceRequest(payload: PayloadServices): Promise<ResultService> {
  try {
    const response = await axios.post<ResponseApi<ResultService>>("/api/services", payload)
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing created service data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error in createService service:", error)
    handleApiError(error)
  }
}

export async function updateServiceRequest(
  id: string,
  payload: Partial<PayloadServices>
): Promise<ResultService> {
  try {
    const response = await axios.patch<ResponseApi<ResultService>>(`/api/services/${id}`, payload)
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing updated service data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error in updateService service:", error)
    handleApiError(error)
  }
}

export async function deleteServiceRequest(id: string): Promise<void> {
  try {
    await axios.delete<ResponseApi<null>>(`/api/services/${id}`)
  } catch (error) {
    console.error("Error in deleteService service:", error)
    handleApiError(error)
  }
}
