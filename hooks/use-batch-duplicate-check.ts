/**
 * Batch Duplicate Check Hook
 * Handles duplicate batch number validation with debouncing
 */

import { useState, useEffect } from "react"
import { checkDuplicateBatch } from "@/lib/services/inventory.service"
import { DuplicateBatchCheck } from "@/types/inventory"

interface UseBatchDuplicateCheckOptions {
  drugId: string
  batchNumber: string
  debounceMs?: number
}

export function useBatchDuplicateCheck({
  drugId,
  batchNumber,
  debounceMs = 500,
}: UseBatchDuplicateCheckOptions) {
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateBatchCheck | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    // Reset if no drug or batch number
    if (!drugId || !batchNumber.trim()) {
      setDuplicateCheck(null)
      return
    }

    // Debounced check
    const timeoutId = setTimeout(async () => {
      setIsChecking(true)
      try {
        const result = await checkDuplicateBatch(drugId, batchNumber)
        setDuplicateCheck(result)
      } catch (error) {
        console.error("Batch duplicate check error:", error)
        setDuplicateCheck(null)
      } finally {
        setIsChecking(false)
      }
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [drugId, batchNumber, debounceMs])

  const reset = () => {
    setDuplicateCheck(null)
    setIsChecking(false)
  }

  return {
    duplicateCheck,
    isChecking,
    isDuplicate: duplicateCheck?.exists ?? false,
    reset,
  }
}
