/**
 * Outpatient Service
 * Client-side API calls for outpatient module
 */

import axios from "axios"
import { handleApiError } from "./api.service"

export interface TransferToInpatientPayload {
  visitId: string
  roomId: string
  bedNumber: string
  notes?: string
}

export async function transferToInpatient(payload: TransferToInpatientPayload): Promise<void> {
  try {
    await axios.post("/api/outpatient/transfer-to-inpatient", payload)
  } catch (error) {
    console.error("Error transferring to inpatient:", error)
    handleApiError(error)
  }
}
