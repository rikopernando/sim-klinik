import { useEffect, useState } from "react"

import { Poli } from "@/types/poli"
import { getPolis } from "@/lib/services/poli.service"
import { getErrorMessage } from "@/lib/utils/error"

export function usePoli() {
  const [polis, setPolis] = useState<Poli[]>([])
  const [isLoading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    const fetchPolis = async () => {
      setLoading(true)
      setErrorMessage(null)
      try {
        const polisList = await getPolis()
        if (!ignore) {
          setPolis(polisList)
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(getErrorMessage(error))
        }
        console.error("Error fetching polis:", error)
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchPolis()
    return () => {
      ignore = true
    }
  }, [])

  return { polis, isLoading, errorMessage }
}
