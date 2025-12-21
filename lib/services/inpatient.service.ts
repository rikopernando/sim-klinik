import axios from "axios"
import { PatientSearchResult, Room } from "@/types/inpatient"
import { ResponseApi } from "@/types/api"
import { BedAssignmentInput } from "@/lib/inpatient/validation"

import { ApiServiceError, handleApiError } from "./api.service"

export async function fetchAvailabelRooms(): Promise<Room[]> {
  try {
    const response = await axios.get<ResponseApi<Room[]>>("/api/inpatient/available-rooms")
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error fetching available rooms:", error)
    handleApiError(error)
  }
}

export async function prosesAssignBed(payload: BedAssignmentInput) {
  try {
    await axios.post("/api/inpatient/assign-bed", payload)
  } catch (error) {
    console.error("Error assign bed:", error)
    handleApiError(error)
  }
}

export async function searchUnassignedPatients(params: {
  query: string
}): Promise<PatientSearchResult[]> {
  try {
    const response = await axios.get<ResponseApi<PatientSearchResult[]>>(
      "/api/inpatient/search-unassigned-patients",
      { params }
    )
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error fetching unassigned patients:", error)
    handleApiError(error)
  }
}
