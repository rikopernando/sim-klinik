"use client"

/**
 * Emergency Room Queue Dashboard
 * Real-time display of ER patient queue with triage prioritization
 *
 * Features:
 * - Auto-refresh every 30 seconds
 * - Triage-based prioritization (Red > Yellow > Green)
 * - Quick registration dialog
 * - Start examination with status update
 * - Patient handover functionality
 */

import { toast } from "sonner"
import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Clock, RefreshCw, Search, Volume2, VolumeX } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// Hooks
import { useERQueue } from "@/hooks/use-er-queue"
import {
  useERNotifications,
  type ERNewPatientNotification,
} from "@/lib/notifications/use-er-notifications"

// Services
import { updateVisitStatus } from "@/lib/services/visits.service"

// Components
import { QuickRegistrationForm } from "@/components/emergency/quick-registration-form"
import { ERQueueStats } from "@/components/emergency/er-queue-stats"
import { ERQueueItemCard } from "@/components/emergency/er-queue-item"
import { ERQueueEmpty } from "@/components/emergency/er-queue-empty"
import { ERQueueLoading } from "@/components/emergency/er-queue-loading"
import { ERQueueTabs } from "@/components/emergency/er-queue-tabs"
import { getErrorMessage } from "@/lib/utils/error"

// Custom hook for debouncing search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default function EmergencyQueuePage() {
  const router = useRouter()
  const [showQuickRegister, setShowQuickRegister] = useState(false)
  const [activeStatus, setActiveStatus] = useState("registered")
  const [searchInput, setSearchInput] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(() => {
    // Load preference from localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem("er-sound-enabled") !== "false"
    }
    return true
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Debounce search input (300ms)
  const debouncedSearch = useDebounce(searchInput, 300)

  /**
   * Handle new patient notification - play alert for Red triage
   */
  const handleNewPatient = useCallback(
    (data: ERNewPatientNotification) => {
      // Refresh queue when new patient arrives via SSE
      refresh()

      // Play alert sound for Red triage patients
      if (data.triageStatus === "red" && soundEnabled && audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.warn("Could not play alert sound:", err)
        })
      }

      // Show toast notification
      const triageLabel =
        data.triageStatus === "red"
          ? "MERAH - GAWAT"
          : data.triageStatus === "yellow"
            ? "KUNING"
            : "HIJAU"
      toast.info(`Pasien baru: ${data.patientName}`, {
        description: `Triage: ${triageLabel} - ${data.chiefComplaint}`,
        duration: 5000,
      })
    },
    [refresh, soundEnabled]
  )

  // Use ER Notifications hook with SSE
  const { isConnected } = useERNotifications({
    onNewPatient: handleNewPatient,
  })

  // Toggle sound and save preference
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const newValue = !prev
      localStorage.setItem("er-sound-enabled", String(newValue))
      return newValue
    })
  }, [])

  // Use ER Queue hook with auto-refresh, status filter, and search
  // With SSE, we can reduce polling interval or even disable it
  const { sortedQueue, queue, statistics, isLoading, lastRefresh, refresh } = useERQueue({
    autoRefresh: !isConnected, // Only poll if SSE is not connected
    refreshInterval: 60000, // Fallback: 60 seconds when polling
    status: activeStatus,
    search: debouncedSearch,
  })

  /**
   * Calculate status counts for tabs
   */
  const statusCounts = {
    all: queue.length,
    registered: queue.filter((item) => item.visit.status === "registered").length,
    in_examination: queue.filter((item) => item.visit.status === "in_examination").length,
    examined: queue.filter((item) => item.visit.status === "examined").length,
  }

  /**
   * Handle quick registration success
   * Closes dialog and refreshes queue
   */
  const handleQuickRegisterSuccess = useCallback(() => {
    setShowQuickRegister(false)
    setActiveStatus("registered") // Reset to registered tab
    refresh()
  }, [refresh])

  /**
   * Handle start examination
   * Updates visit status to IN_EXAMINATION and navigates to medical record page
   * Falls back to navigation even if status update fails
   */
  const handleStartExamination = useCallback(
    async (visitId: string, visitStatus: string) => {
      if (visitStatus === "in_examination") {
        router.push(`/dashboard/emergency/${visitId}`)
      } else {
        try {
          // Update visit status to IN_EXAMINATION using service
          await updateVisitStatus(visitId, "in_examination")

          // Navigate to ER medical record page
          router.push(`/dashboard/emergency/${visitId}`)
        } catch (err) {
          console.error("Error starting examination:", err)

          // Show error but still navigate (degraded functionality)
          toast.error(getErrorMessage(err))
        }
      }
    },
    [router]
  )

  return (
    <div className="space-y-6 p-6">
      {/* Audio element for emergency alerts */}
      <audio ref={audioRef} src="/sounds/emergency-alert.mp3" preload="auto" />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Dashboard UGD</h1>
            {/* SSE Connection Status */}
            <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
              {isConnected ? "Live" : "Polling"}
            </Badge>
          </div>
          <p className="text-muted-foreground">Antrian Unit Gawat Darurat - Real-time</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {/* Sound Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSound}
            title={soundEnabled ? "Matikan suara" : "Nyalakan suara"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={showQuickRegister} onOpenChange={setShowQuickRegister}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <AlertCircle className="mr-2 h-4 w-4" />
                Pendaftaran Cepat UGD
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Pendaftaran Cepat UGD</DialogTitle>
              </DialogHeader>
              <QuickRegistrationForm
                onSuccess={handleQuickRegisterSuccess}
                onCancel={() => setShowQuickRegister(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Cari pasien (nama, no. MR, NIK)..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Statistics */}
      <ERQueueStats statistics={statistics} />

      {/* Status Tabs Filter */}
      <ERQueueTabs
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        counts={statusCounts}
      />

      {/* Last Refresh Info */}
      {lastRefresh && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          <span>
            Terakhir diperbarui:{" "}
            {formatDistanceToNow(lastRefresh, { addSuffix: true, locale: idLocale })}
          </span>
        </div>
      )}

      {/* Queue List */}
      <div className="space-y-4">
        {isLoading ? (
          <ERQueueLoading />
        ) : sortedQueue.length === 0 ? (
          <ERQueueEmpty />
        ) : (
          sortedQueue.map((item, index) => (
            <ERQueueItemCard
              key={item.visit.id}
              item={item}
              index={index}
              onStartExamination={handleStartExamination}
              onHandoverSuccess={refresh}
            />
          ))
        )}
      </div>
    </div>
  )
}
