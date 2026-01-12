/**
 * Add Inventory Hook
 * Handles adding new drug inventory (stock incoming)
 */

import { useState } from "react"
import { addInventory } from "@/lib/services/inventory.service"
import { DrugInventoryInput } from "@/lib/pharmacy/validation"

interface UseAddInventoryReturn {
  addNewInventory: (data: DrugInventoryInput) => Promise<boolean>
  isSubmitting: boolean
  error: string | null
  success: boolean
}

export function useAddInventory(): UseAddInventoryReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const addNewInventory = async (data: DrugInventoryInput): Promise<boolean> => {
    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(false)

      await addInventory(data)

      setSuccess(true)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      console.error("Add inventory error:", err)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    addNewInventory,
    isSubmitting,
    error,
    success,
  }
}
