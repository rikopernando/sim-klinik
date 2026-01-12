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

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertCircle, Clock, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"

// Hooks
import { useERQueue } from "@/hooks/use-er-queue"

// Services
import { updateVisitStatus } from "@/lib/services/visits.service"
import { ApiServiceError } from "@/lib/services/api.service"

// Components
import { QuickRegistrationForm } from "@/components/emergency/quick-registration-form"
import { ERQueueStats } from "@/components/emergency/er-queue-stats"
import { ERQueueItemCard } from "@/components/emergency/er-queue-item"
import { ERQueueEmpty } from "@/components/emergency/er-queue-empty"
import { ERQueueLoading } from "@/components/emergency/er-queue-loading"

export default function EmergencyQueuePage() {
  const router = useRouter()
  const [showQuickRegister, setShowQuickRegister] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use ER Queue hook with auto-refresh
  const { sortedQueue, statistics, isLoading, lastRefresh, refresh } = useERQueue({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
  })

  /**
   * Handle quick registration success
   * Closes dialog and refreshes queue
   */
  const handleQuickRegisterSuccess = useCallback(() => {
    setShowQuickRegister(false)
    setError(null)
    refresh()
  }, [refresh])

  /**
   * Handle start examination
   * Updates visit status to IN_EXAMINATION and navigates to medical record page
   * Falls back to navigation even if status update fails
   */
  const handleStartExamination = useCallback(
    async (visitId: string) => {
      try {
        setError(null)

        // Update visit status to IN_EXAMINATION using service
        await updateVisitStatus(visitId, "in_examination")

        // Navigate to ER medical record page
        router.push(`/dashboard/emergency/${visitId}`)
      } catch (err) {
        let errorMessage = "Terjadi kesalahan"

        if (err instanceof ApiServiceError) {
          errorMessage = err.message
        } else if (err instanceof Error) {
          errorMessage = err.message
        }

        console.error("Error starting examination:", err)

        // Show error but still navigate (degraded functionality)
        setError(errorMessage)

        // Still navigate after a brief delay to show error
        setTimeout(() => {
          router.push(`/dashboard/emergency/${visitId}`)
        }, 1500)
      }
    },
    [router]
  )

  return (
    <div className="space-y-6 p-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
