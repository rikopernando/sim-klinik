import { useEffect, useState } from "react"

import { getPolis } from "@/lib/services/poli.service"
import { Poli } from "@/types/poli"
import { getErrorMessage } from "@/lib/utils/error"

export function usePoli() {
  const [polis, setPolis] = useState<Poli[]>([])
  const [isLoading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchPolis = async () => {
      setLoading(true)
      setErrorMessage(null)
      try {
        const polisList = await getPolis()
        setPolis(polisList)
      } catch (error) {
        setErrorMessage(getErrorMessage(error))
        console.error("Error fetching polis:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPolis()
  }, [])

  return { polis, isLoading, errorMessage }
}
