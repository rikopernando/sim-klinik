/**
 * Medical Record History Page
 * Display medical record history with filters and pagination
 */

"use client"
import { useState } from "react"
import { PageGuard } from "@/components/auth/page-guard"
import { RefreshCw } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useMedicalRecordHistoryList } from "@/hooks/use-medical-record-history-list"
import { useMedicalRecordHistoryListFilters } from "@/hooks/use-medical-record-history-list-filters"
import { HistoryListTable } from "@/components/medical-records/history-list-table"
import { HistoryListFilters } from "@/components/medical-records/history-list-filters"
import { HistoryListPagination } from "@/components/medical-records/history-list-pagination"
import { MedicalRecordHistoryDialog } from "@/components/medical-records/medical-record-history-dialog"
import { Button } from "@/components/ui/button"

export default function MedicalRecordHistoryPage() {
  return (
    <PageGuard permissions={["medical_records:read"]}>
      <MedicalRecordHistoryPageContent />
    </PageGuard>
  )
}

function MedicalRecordHistoryPageContent() {
  const filterHook = useMedicalRecordHistoryListFilters()
  const { records, pagination, isLoading, handlePageChange, refresh } = useMedicalRecordHistoryList(
    filterHook.filters
  )

  // State for patient history dialog
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleViewDetail = (patientId: string) => {
    setSelectedPatientId(patientId)
    setIsDialogOpen(true)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Riwayat Rekam Medis</h1>
            <p className="text-muted-foreground">
              Daftar rekam medis pasien yang sedang berjalan maupun sudah selesai
            </p>
          </div>
          <Button onClick={refresh} variant="outline" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Record List Card */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Rekam Medis</CardTitle>
            <CardDescription>
              {isLoading
                ? "Memuat data..."
                : pagination.total > 0
                  ? `Total: ${pagination.total} rekam medis`
                  : "Tidak ada data rekam medis"}
            </CardDescription>
            <CardAction>
              {/* Filters */}
              <HistoryListFilters
                search={filterHook.search}
                visitType={filterHook.visitType}
                isLocked={filterHook.isLocked}
                dateFrom={filterHook.dateFrom}
                dateTo={filterHook.dateTo}
                onSearchChange={filterHook.setSearch}
                onVisitTypeChange={filterHook.setVisitType}
                onIsLockedChange={filterHook.setIsLocked}
                onDateFromChange={filterHook.setDateFrom}
                onDateToChange={filterHook.setDateTo}
              />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Table */}
            <HistoryListTable
              records={records}
              isLoading={isLoading}
              onViewDetail={handleViewDetail}
            />

            {/* Pagination */}
            {!isLoading && (
              <HistoryListPagination pagination={pagination} onPageChange={handlePageChange} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Patient Medical Record History Dialog */}
      <MedicalRecordHistoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        patientId={selectedPatientId || ""}
      />
    </div>
  )
}
