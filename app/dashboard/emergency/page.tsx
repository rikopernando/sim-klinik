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
// Hooks
import { useERQueue } from "@/hooks/use-er-queue"

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
import { cn } from "@/lib/utils"

import { PageGuard } from "@/components/auth/page-guard"

export default function EmergencyQueuePage() {
  return (
    <PageGuard roles={["nurse", "doctor", "super_admin", "admin"]}>
      <EmergencyQueueContent />
    </PageGuard>
  )
}

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

function EmergencyQueueContent() {
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

  // Toggle sound and save preference
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const newValue = !prev
      localStorage.setItem("er-sound-enabled", String(newValue))
      return newValue
    })
  }, [])

  const { sortedQueue, queue, statistics, isLoading, lastRefresh, refresh } = useERQueue({
    autoRefresh: false,
    refreshInterval: 30000,
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
        <div className="flex items-start gap-3">
          <span className="bg-primary mt-1.5 h-5 w-1 shrink-0 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard UGD</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">Antrian Unit Gawat Darurat</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSound}
            title={soundEnabled ? "Matikan suara" : "Nyalakan suara"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>

          <Dialog open={showQuickRegister} onOpenChange={setShowQuickRegister}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <AlertCircle className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Pendaftaran Cepat UGD</span>
                <span className="sm:hidden">Daftar UGD</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 p-0">
              <div className="shrink-0 border-b px-6 pt-6 pb-4">
                <DialogHeader>
                  <DialogTitle>Pendaftaran Cepat UGD</DialogTitle>
                </DialogHeader>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <QuickRegistrationForm
                  onSuccess={handleQuickRegisterSuccess}
                  onCancel={() => setShowQuickRegister(false)}
                />
              </div>
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
