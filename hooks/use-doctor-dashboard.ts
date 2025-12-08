/**
 * Custom hook for doctor dashboard business logic
 */

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useDoctorStats } from "@/hooks/use-doctor-stats"
import { useDoctorQueue } from "@/hooks/use-doctor-queue"
import { createMedicalRecord } from "@/lib/services/medical-record.service"
import { updateVisitStatus } from "@/lib/services/visit.service"
import { QueuePatient } from "@/types/dashboard"

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

        // Step 1: Create medical record for this visit
        await createMedicalRecord({
          visitId,
          isDraft: true,
        })

        // Step 2: Update visit status to "in_examination"
        await updateVisitStatus(visitId, "in_examination")

        // Step 3: Navigate to medical record page
        router.push(`/dashboard/medical-records/${visitId}`)
      } catch (error: unknown) {
        // If medical record already exists, just navigate to it
        const errorResponse = error as { response?: { data?: { error?: string } } }
        if (errorResponse.response?.data?.error?.includes("already exists")) {
          router.push(`/dashboard/medical-records/${visitId}`)
        } else {
          setError(errorResponse.response?.data?.error || "Gagal memulai pemeriksaan")
          console.error("Failed to start examination:", error)
        }
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
