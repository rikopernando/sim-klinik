/**
 * Hook to fetch lab test panels with their included tests
 */

import { toast } from "sonner"
import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import type { LabTestPanelWithTests } from "@/types/lab"
import type { ResponseApi } from "@/types/api"
import { getErrorMessage } from "@/lib/utils/error"

interface UseLabTestPanelsOptions {
  isActive?: boolean
  autoFetch?: boolean
}

export function useLabTestPanels(options: UseLabTestPanelsOptions = {}) {
  const { isActive = true, autoFetch = true } = options

  const [panels, setPanels] = useState<LabTestPanelWithTests[]>([])
  const [loading, setLoading] = useState(autoFetch)

  const fetchPanels = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (isActive !== undefined) {
        params.append("isActive", isActive.toString())
      }

      const response = await axios.get<ResponseApi<LabTestPanelWithTests[]>>(
        `/api/lab/panels?${params.toString()}`
      )

      setPanels(response.data.data || [])
    } catch (error) {
      console.error("Error fetching lab test panels:", error)
      toast.error("Gagal memuat panel pemeriksaan", {
        description: getErrorMessage(error),
      })
      setPanels([])
    } finally {
      setLoading(false)
    }
  }, [isActive])

  useEffect(() => {
    if (autoFetch) {
      fetchPanels()
    }
  }, [autoFetch, fetchPanels])

  return {
    panels,
    loading,
    refetch: fetchPanels,
  }
}
