"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { Package, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

import { PageGuard } from "@/components/auth/page-guard"
import { PageHeader } from "@/components/ui/page-header"
import { usePharmacyDashboard } from "@/hooks/use-pharmacy-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PharmacyStatsCards } from "@/components/pharmacy/pharmacy-stats-cards"
import { PrescriptionQueueTable } from "@/components/pharmacy/prescription-queue-table"
import { ExpiringDrugsList } from "@/components/pharmacy/expiring-drugs-list"
import { BulkFulfillmentDialog } from "@/components/pharmacy/bulk-fulfillment-dialog"
import { bulkFulfillPrescriptions } from "@/lib/services/pharmacy.service"
import { getErrorMessage } from "@/lib/utils/error"
import { PrescriptionFulfillmentInput, PrescriptionQueueItem } from "@/types/pharmacy"

type VisitTypeFilter = "all" | "outpatient" | "inpatient"

const VISIT_FILTERS: { value: VisitTypeFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "outpatient", label: "Rawat Jalan" },
  { value: "inpatient", label: "Rawat Inap" },
]

export default function PharmacyDashboard() {
  return (
    <PageGuard permissions={["prescriptions:read", "pharmacy:read"]}>
      <PharmacyDashboardContent />
    </PageGuard>
  )
}

function PharmacyDashboardContent() {
  const router = useRouter()
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
  } = usePharmacyDashboard({ page, visitType: visitTypeFilter })

  const [selectedGroup, setSelectedGroup] = useState<PrescriptionQueueItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleVisitTypeChange = useCallback((value: VisitTypeFilter) => {
    setVisitTypeFilter(value)
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
    <>
      <PageHeader title="Farmasi" description="Kelola resep dan stok obat">
        {lastRefresh && (
          <span className="text-muted-foreground hidden text-xs sm:inline">
            {lastRefresh.toLocaleTimeString("id-ID")}
          </span>
        )}
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
        <Button size="sm" onClick={() => router.push("/dashboard/pharmacy/inventory")}>
          <Package className="mr-1.5 h-3.5 w-3.5" />
          Kelola Stok
        </Button>
      </PageHeader>

      <div className="container mx-auto max-w-5xl space-y-5 px-6 py-6">
        <PharmacyStatsCards queueCount={pagination.total} expiringDrugs={expiringDrugs} />

        <Tabs defaultValue="queue" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TabsList className="inline-flex">
              <TabsTrigger value="queue" className="gap-2">
                Antrian Resep
                {pagination.total > 0 && (
                  <Badge className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold tabular-nums">
                    {pagination.total}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="expiring" className="gap-2">
                Obat Kadaluarsa
                {expiringDrugs.all.length > 0 && (
                  <Badge className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] leading-none font-semibold text-white tabular-nums">
                    {expiringDrugs.all.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="queue" className="space-y-3">
            {/* Visit type pill filter */}
            <div className="flex items-center gap-1.5">
              {VISIT_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleVisitTypeChange(f.value)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    visitTypeFilter === f.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  )}
                >
                  {f.label}
                </button>
              ))}
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

          <TabsContent value="expiring">
            <ExpiringDrugsList
              data={expiringDrugs}
              isLoading={expiringLoading}
              error={expiringError}
            />
          </TabsContent>
        </Tabs>
      </div>

      <BulkFulfillmentDialog
        open={!!selectedGroup}
        onOpenChange={handleDialogClose}
        selectedGroup={selectedGroup}
        isSubmitting={isSubmitting}
        onSubmit={handleBulkFulfill}
        medicalRecordId={selectedGroup?.medicalRecordId}
        onPrescriptionAdded={refresh}
      />
    </>
  )
}
