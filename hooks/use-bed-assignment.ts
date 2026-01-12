/**
 * Bed Assignment Hook
 * Handles bed assignment logic and submission
 */

import { useState, useCallback } from "react"
import { toast } from "sonner"

import { BedAssignmentInput } from "@/lib/inpatient/validation"
import { prosesAssignBed } from "@/lib/services/inpatient.service"

interface UseBedAssignmentOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface UseBedAssignmentReturn {
  isAssigning: boolean
  assignBed: (data: BedAssignmentInput) => Promise<void>
}

export function useBedAssignment(options: UseBedAssignmentOptions = {}): UseBedAssignmentReturn {
  const { onSuccess, onError } = options
  const [isAssigning, setIsAssigning] = useState(false)

  const assignBed = useCallback(
    async (data: BedAssignmentInput) => {
      setIsAssigning(true)

      try {
        await prosesAssignBed(data)
        toast.success("Bed berhasil dialokasikan")
        onSuccess?.()
      } catch (error) {
        toast.error("Gagal mengalokasikan bed")
        onError?.(error as Error)
        console.error("Error assigning bed:", error)
      } finally {
        setIsAssigning(false)
      }
    },
    [onSuccess, onError]
  )

  return {
    isAssigning,
    assignBed,
  }
}
