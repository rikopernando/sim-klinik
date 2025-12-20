/**
 * Billing Details Hook
 * Fetches billing details for a specific visit
 */

import { useState, useCallback } from "react"
import { getBillingDetails } from "@/lib/services/billing.service"
import { toast } from "sonner"
import { BillingDetails } from "@/types/billing"

interface UseBillingDetailsReturn {
  isLoading: boolean
  billingDetails: BillingDetails | null
  fetchBillingDetails: (visitId: string) => Promise<void>
}

export function useBillingDetails(): UseBillingDetailsReturn {
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchBillingDetails = useCallback(async (visitId: string) => {
    try {
      setIsLoading(true)
      const data = await getBillingDetails(visitId)
      setBillingDetails(data)
    } catch (err) {
      console.error("Billing details fetch error:", err)
      toast.error("Failed to fetch billing queue")
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    fetchBillingDetails,
    billingDetails,
    isLoading,
  }
}
