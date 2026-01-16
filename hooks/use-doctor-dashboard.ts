/**
 * Custom hook for doctor dashboard business logic
 */

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useDoctorStats } from "@/hooks/use-doctor-stats"
import { useDoctorQueue } from "@/hooks/use-doctor-queue"
import { updateVisitStatus } from "@/lib/services/visit.service"
import { QueuePatient } from "@/types/dashboard"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils/error"

export function useDoctorDashboard() {
  const router = useRouter()
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [startingExamination, setStartingExamination] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard statistics with auto-refresh
  const {
    stats,
    isLoading: statsLoading,
    lastRefresh,
    refresh: refreshStats,
  } = useDoctorStats({
    autoRefresh: true,
    refreshInterval: 60000, // Refresh every 60 seconds
  })

  // Fetch patient queue with auto-refresh
  const {
    queue,
    isLoading: queueLoading,
    refresh: refreshQueue,
  } = useDoctorQueue({
    status: "all",
    autoRefresh: true,
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  // Separate queue by status (memoized)
  const waitingQueue = useMemo(
    () =>
      queue.filter((item) => item.visit.status === "registered" || item.visit.status === "waiting"),
    [queue]
  )

  const inProgressQueue = useMemo(
    () => queue.filter((item) => item.visit.status === "in_examination"),
    [queue]
  )

  const unlockedQueue = useMemo(
    () => queue.filter((item) => item.medicalRecord && !item.medicalRecord.isLocked),
    [queue]
  )

  // Handlers
  const handleRefreshAll = useCallback(() => {
    refreshStats()
    refreshQueue()
  }, [refreshStats, refreshQueue])

  const handleStartExamination = useCallback(
    async (visitId: string) => {
      try {
        setStartingExamination(visitId)
        setError(null)

        await updateVisitStatus(visitId, "in_examination")

        router.push(`/dashboard/medical-records/${visitId}`)
      } catch (error: unknown) {
        console.error("Failed to start examination:", error)
        toast.error(`Gagal memulai pemeriksaan: ${getErrorMessage(error)}`)
      } finally {
        setStartingExamination(null)
      }
    },
    [router]
  )

  const handleOpenMedicalRecord = useCallback(
    (visitId: string) => {
      // Just navigate to medical record page (already exists)
      router.push(`/dashboard/medical-records/${visitId}`)
    },
    [router]
  )

  const handleViewHistory = useCallback((patient: QueuePatient | null) => {
    setSelectedPatient(patient)
    setShowHistory(true)
  }, [])

  const handleCloseHistory = useCallback(() => {
    setShowHistory(false)
    setSelectedPatient(null)
  }, [])

  return {
    // State
    stats,
    statsLoading,
    lastRefresh,
    queue,
    queueLoading,
    waitingQueue,
    inProgressQueue,
    unlockedQueue,
    selectedPatient,
    showHistory,
    startingExamination,
    error,

    // Handlers
    handleRefreshAll,
    handleStartExamination,
    handleOpenMedicalRecord,
    handleViewHistory,
    handleCloseHistory,
  }
}
