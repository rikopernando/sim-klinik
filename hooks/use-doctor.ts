import { getDoctors } from "@/lib/services/doctor.service"
import { getErrorMessage } from "@/lib/utils/error"
import { Doctor } from "@/types/user"
import { useEffect, useState } from "react"

export function useDoctor() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true)
      setErrorMessage(null)
      try {
        const doctorsList = await getDoctors()
        setDoctors(doctorsList)
      } catch (error) {
        console.error("Error fetching doctors:", error)
        setErrorMessage(getErrorMessage(error))
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  return {
    doctors,
    isLoading,
    errorMessage,
  }
}
