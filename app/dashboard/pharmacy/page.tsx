"use client"

/**
 * Pharmacy Queue Dashboard (Refactored)
 * Displays pending prescriptions and expiring drugs with optimized performance
 */

import { useState, useCallback } from "react"
import { toast } from "sonner"

import { usePharmacyDashboard } from "@/hooks/use-pharmacy-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PharmacyHeader } from "@/components/pharmacy/pharmacy-header"
import { PharmacyStatsCards } from "@/components/pharmacy/pharmacy-stats-cards"
import { PrescriptionQueueTable } from "@/components/pharmacy/prescription-queue-table"
import { ExpiringDrugsList } from "@/components/pharmacy/expiring-drugs-list"
import { BulkFulfillmentDialog } from "@/components/pharmacy/bulk-fulfillment-dialog"
import { bulkFulfillPrescriptions } from "@/lib/services/pharmacy.service"
import { getErrorMessage } from "@/lib/utils/error"
import { PrescriptionFulfillmentInput, PrescriptionQueueItem } from "@/types/pharmacy"

export default function PharmacyDashboard() {
  const {
    queue,
    queueLoading,
    queueError,
    expiringDrugs,
    expiringLoading,
    expiringError,
    lastRefresh,
    refresh,
  } = usePharmacyDashboard()

  const [selectedGroup, setSelectedGroup] = useState<PrescriptionQueueItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Memoize handlers to prevent unnecessary re-renders
  const handleBulkFulfill = useCallback(
    async (prescriptions: PrescriptionFulfillmentInput[]) => {
      setIsSubmitting(true)
      try {
        // Use service layer instead of direct axios call
        const result = await bulkFulfillPrescriptions(prescriptions)

        toast.success(result.message || "Semua resep berhasil diproses")
        setSelectedGroup(null)
        refresh()
      } catch (error) {
        const errorMessage = getErrorMessage(error)
        toast.error(errorMessage || "Gagal memproses resep")
        throw error // Re-throw to let dialog handle it
      } finally {
        setIsSubmitting(false)
      }
    },
    [refresh]
  )

  const handleProcessGroup = useCallback((group: PrescriptionQueueItem) => {
    setSelectedGroup(group)
  }, [])

  const handleDialogClose = useCallback(
    (open: boolean) => {
      if (!open && !isSubmitting) {
        setSelectedGroup(null)
      }
    },
    [isSubmitting]
  )

  return (
    <div className="container mx-auto space-y-6 p-6">
      <PharmacyHeader lastRefresh={lastRefresh} onRefresh={refresh} />

      {/* Statistics Cards */}
      <PharmacyStatsCards queueCount={queue.length} expiringDrugs={expiringDrugs} />

      {/* Main Content */}
      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Antrian Resep ({queue.length})</TabsTrigger>
          <TabsTrigger value="expiring">Obat Kadaluarsa ({expiringDrugs.all.length})</TabsTrigger>
        </TabsList>

        {/* Prescription Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          <PrescriptionQueueTable
            queue={queue}
            isLoading={queueLoading}
            error={queueError}
            onProcess={handleProcessGroup}
          />
        </TabsContent>

        {/* Expiring Drugs Tab */}
        <TabsContent value="expiring" className="space-y-4">
          <ExpiringDrugsList
            drugs={expiringDrugs.all}
            isLoading={expiringLoading}
            error={expiringError}
          />
        </TabsContent>
      </Tabs>

      {/* Bulk Fulfillment Dialog */}
      <BulkFulfillmentDialog
        open={!!selectedGroup}
        onOpenChange={handleDialogClose}
        selectedGroup={selectedGroup}
        isSubmitting={isSubmitting}
        onSubmit={handleBulkFulfill}
        medicalRecordId={selectedGroup?.medicalRecordId}
        onPrescriptionAdded={refresh}
      />
    </div>
  )
}
