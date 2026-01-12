/**
 * Room Service Layer
 * Handles all API calls related to rooms
 */

import axios from "axios"
import { RoomWithOccupancy } from "@/types/inpatient"
import { Pagination, ResponseApi } from "@/types/api"
import type { Room, RoomCreateInput, RoomUpdateInput, RoomFilters } from "@/types/rooms"
import { ROOM_API_ENDPOINTS } from "@/lib/constants/rooms"

import { ApiServiceError, handleApiError } from "./api.service"

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

/**
 * Fetch rooms with pagination
 */
export async function fetchRoomsPaginated(
  filters?: RoomFilters,
  page: number = 1,
  limit: number = 10
): Promise<{ rooms: Room[]; pagination: Pagination }> {
  try {
    const response = await axios.get<ResponseApi<Room[]>>(ROOM_API_ENDPOINTS.list, {
      params: {
        ...filters,
        page,
        limit,
      },
    })

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return {
      rooms: response.data.data,
      pagination: response.data.pagination as Pagination,
    }
  } catch (error) {
    console.error("Error fetching rooms paginated:", error)
    handleApiError(error)
  }
}

/**
 * Fetch a single room by ID
 */
export async function fetchRoom(id: string): Promise<Room> {
  try {
    const response = await axios.get<ResponseApi<Room>>(ROOM_API_ENDPOINTS.detail(id))
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }
    return response.data.data
  } catch (error) {
    console.error("Error fetching room:", error)
    handleApiError(error)
  }
}

/**
 * Create a new room
 */
export async function createRoom(roomData: RoomCreateInput) {
  try {
    await axios.post<ResponseApi>(ROOM_API_ENDPOINTS.create, roomData)
  } catch (error) {
    console.error("Error creating room:", error)
    handleApiError(error)
  }
}

/**
 * Update an existing room
 */
export async function updateRoom(id: string, roomData: RoomUpdateInput) {
  try {
    await axios.put<ResponseApi>(ROOM_API_ENDPOINTS.update(id), roomData)
  } catch (error) {
    console.error("Error updating room:", error)
    handleApiError(error)
  }
}

/**
 * Delete a room (soft delete)
 */
export async function deleteRoom(id: string): Promise<void> {
  try {
    await axios.delete<ResponseApi>(ROOM_API_ENDPOINTS.delete(id))
  } catch (error) {
    console.error("Error deleting room:", error)
    handleApiError(error)
  }
}
