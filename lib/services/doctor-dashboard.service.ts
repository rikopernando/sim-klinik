/**
 * Doctor Dashboard Service
 * Handles API calls for doctor dashboard (stats and queue)
 */

import axios from "axios"
import { type ResponseApi } from "@/types/api"
import { ApiServiceError, handleApiError } from "./api.service"
import { DoctorStats, QueueItem } from "@/types/dashboard"

export interface QueueResponse {
  queue: QueueItem[]
}

/**
 * Get doctor dashboard statistics
 * @returns Doctor statistics
 */
export async function getDoctorStats(): Promise<DoctorStats> {
  try {
    const response = await axios.get<ResponseApi<DoctorStats>>("/api/dashboard/doctor/stats")

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing statistics data")
    }

    return response.data.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Get doctor's patient queue
 * @param status - Filter by status: "waiting" | "in_examination" | undefined (all)
 * @param date - Filter by date: YYYY-MM-DD format
 * @returns Queue items
 */
export async function getDoctorQueue(
  status?: "waiting" | "in_examination",
  date?: string
): Promise<QueueItem[]> {
  try {
    const params: Record<string, string> = {}
    if (status) {
      params.status = status
    }
    if (date) {
      params.date = date
    }

    const response = await axios.get<ResponseApi<QueueResponse>>("/api/dashboard/doctor/queue", {
      params,
    })

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing queue data")
    }

    return response.data.data.queue
  } catch (error) {
    handleApiError(error)
  }
}
