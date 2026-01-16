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
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Clock, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"

import { Button } from "@/components/ui/button"
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

export default function EmergencyQueuePage() {
  const router = useRouter()
  const [showQuickRegister, setShowQuickRegister] = useState(false)
  const [activeStatus, setActiveStatus] = useState("registered")

  // Use ER Queue hook with auto-refresh and status filter
  const { sortedQueue, queue, statistics, isLoading, lastRefresh, refresh } = useERQueue({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    status: activeStatus,
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard UGD</h1>
          <p className="text-muted-foreground">Antrian Unit Gawat Darurat - Real-time</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
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
