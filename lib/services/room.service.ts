import axios from "axios"
import { ApiServiceError, handleApiError } from "./api.service"
import { RoomWithOccupancy } from "@/types/inpatient"
import { ResponseApi } from "@/types/api"

export async function fetchAllRoomsWithOccupancy(): Promise<RoomWithOccupancy[]> {
  try {
    const response = await axios.get<ResponseApi<RoomWithOccupancy[]>>("/api/rooms")
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error fetching rooms:", error)
    handleApiError(error)
  }
}
