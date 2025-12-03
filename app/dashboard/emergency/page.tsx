"use client"

/**
 * Emergency Room Queue Dashboard
 * Real-time display of ER patient queue with triage prioritization
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
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

// Components
import { QuickRegistrationForm } from "@/components/emergency/quick-registration-form"
import { ERQueueStats } from "@/components/emergency/er-queue-stats"
import { ERQueueItemCard } from "@/components/emergency/er-queue-item"
import { ERQueueEmpty } from "@/components/emergency/er-queue-empty"
import { ERQueueLoading } from "@/components/emergency/er-queue-loading"

export default function EmergencyQueuePage() {
  const [showQuickRegister, setShowQuickRegister] = useState(false)

  // Use ER Queue hook
  const { sortedQueue, statistics, isLoading, lastRefresh, refresh } = useERQueue({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
  })

  /**
   * Handle quick registration success
   */
  const handleQuickRegisterSuccess = () => {
    setShowQuickRegister(false)
    refresh()
  }

  /**
   * Handle start examination
   */
  const handleStartExamination = (visitId: number) => {
    // TODO: Navigate to ER medical record page
    console.log("Start examination for visit:", visitId)
  }

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
