"use client"

/**
 * Pharmacy Queue Dashboard
 * Displays pending prescriptions and expiring drugs with pagination
 */

import { useState, useCallback } from "react"
import { toast } from "sonner"

import { PageGuard } from "@/components/auth/page-guard"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type VisitTypeFilter = "all" | "outpatient" | "inpatient"

export default function PharmacyDashboard() {
  return (
    <PageGuard permissions={["prescriptions:read", "pharmacy:read"]}>
      <PharmacyDashboardContent />
    </PageGuard>
  )
}

function PharmacyDashboardContent() {
  const [visitTypeFilter, setVisitTypeFilter] = useState<VisitTypeFilter>("all")
  const [page, setPage] = useState(1)

  const {
    queue,
    pagination,
    queueLoading,
    queueError,
    expiringDrugs,
    expiringLoading,
    expiringError,
    lastRefresh,
    refresh,
  } = usePharmacyDashboard({
    page,
    visitType: visitTypeFilter,
  })

  const [selectedGroup, setSelectedGroup] = useState<PrescriptionQueueItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleVisitTypeChange = useCallback((value: string) => {
    setVisitTypeFilter(value as VisitTypeFilter)
    setPage(1)
  }, [])

  const handleBulkFulfill = useCallback(
    async (prescriptions: PrescriptionFulfillmentInput[]) => {
      setIsSubmitting(true)
      try {
        await bulkFulfillPrescriptions(prescriptions)
        toast.success("Semua resep berhasil diproses")
        setSelectedGroup(null)
        refresh()
      } catch (error) {
        const errorMessage = getErrorMessage(error)
        toast.error(errorMessage || "Gagal memproses resep")
        throw error
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
      if (!open && !isSubmitting) setSelectedGroup(null)
    },
    [isSubmitting]
  )

  return (
    <div className="container mx-auto space-y-6 p-6">
      <PharmacyHeader lastRefresh={lastRefresh} onRefresh={refresh} />

      <PharmacyStatsCards queueCount={pagination.total} expiringDrugs={expiringDrugs} />

      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Antrian Resep ({pagination.total})</TabsTrigger>
          <TabsTrigger value="expiring">Obat Kadaluarsa ({expiringDrugs.all.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Filter Tipe Kunjungan:</label>
            <Select value={visitTypeFilter} onValueChange={handleVisitTypeChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="outpatient">Rawat Jalan</SelectItem>
                <SelectItem value="inpatient">Rawat Inap</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <PrescriptionQueueTable
            queue={queue}
            isLoading={queueLoading}
            error={queueError}
            onProcess={handleProcessGroup}
            pagination={pagination}
            onPageChange={setPage}
          />
        </TabsContent>

        <TabsContent value="expiring" className="space-y-4">
          <ExpiringDrugsList
            drugs={expiringDrugs.all}
            isLoading={expiringLoading}
            error={expiringError}
          />
        </TabsContent>
      </Tabs>

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
