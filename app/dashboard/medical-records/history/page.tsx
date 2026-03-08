/**
 * Medical Record History Page
 * Display medical record history with filters and pagination
 */

"use client"
import { PageGuard } from "@/components/auth/page-guard"
import { RefreshCw, Search } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useMedicalRecordHistoryList } from "@/hooks/use-medical-record-history-list"
import { useMedicalRecordHistoryListFilters } from "@/hooks/use-medical-record-history-list-filters"
import { HistoryListTable } from "@/components/medical-records/history-list-table"
import { HistoryListFilters } from "@/components/medical-records/history-list-filters"
import { HistoryListPagination } from "@/components/medical-records/history-list-pagination"
import { FilterDrawer } from "@/components/ui/filter-drawer"
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

          <div className="flex items-center gap-2">
            <FilterDrawer
              activeFilterCount={filterHook.activeFilterCount}
              onReset={filterHook.resetFilters}
              title="Filter Rekam Medis"
              description="Atur filter untuk menyaring data rekam medis"
            >
              <HistoryListFilters
                visitType={filterHook.visitType}
                isLocked={filterHook.isLocked}
                dateFrom={filterHook.dateFrom}
                dateTo={filterHook.dateTo}
                onVisitTypeChange={filterHook.setVisitType}
                onIsLockedChange={filterHook.setIsLocked}
                onDateFromChange={filterHook.setDateFrom}
                onDateToChange={filterHook.setDateTo}
              />
            </FilterDrawer>
            <Button onClick={refresh} variant="outline" disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
        {/* Record List Card */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Rekam Medis</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Memuat data..."
                  : pagination.total > 0
                    ? `Total: ${pagination.total} rekam medis`
                    : "Tidak ada data rekam medis"}
              </CardDescription>
            </div>

            {/* Search and Filter */}
            <div className="flex min-w-xs items-center gap-2">
              <div className="relative max-w-sm flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Cari nama pasien, No. RM, No. Kunjungan..."
                  value={filterHook.search}
                  onChange={(e) => filterHook.setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Table */}
            <HistoryListTable records={records} isLoading={isLoading} />

            {/* Pagination */}
            {!isLoading && (
              <HistoryListPagination pagination={pagination} onPageChange={handlePageChange} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
