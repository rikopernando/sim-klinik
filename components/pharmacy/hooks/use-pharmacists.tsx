/**
 * Custom hook for managing pharmacists data
 */

import { useState, useEffect } from "react"
import { getPharmacists } from "@/lib/services/pharmacist.service"
import { Pharmacist } from "@/types/user"

export function usePharmacists(shouldLoad: boolean) {
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!shouldLoad) return
    let ignore = false

    const loadPharmacists = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const pharmacistsList = await getPharmacists()
        if (!ignore) {
          setPharmacists(pharmacistsList)
        }
      } catch (err) {
        console.error("Error fetching pharmacists:", err)
        if (!ignore) {
          setError("Gagal memuat data farmasi")
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadPharmacists()

    return () => {
      ignore = true
    }
  }, [shouldLoad])

  return { pharmacists, isLoading, error }
}
