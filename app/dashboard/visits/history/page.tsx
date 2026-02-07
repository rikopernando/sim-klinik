/**
 * Visit History Page
 * Display visit history with filters and pagination
 */

"use client"
import { PageGuard } from "@/components/auth/page-guard"
import { RefreshCw, Search } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useVisitHistory } from "@/hooks/use-visit-history"
import { useVisitHistoryFilters } from "@/hooks/use-visit-history-filters"
import { VisitHistoryTable } from "@/components/visits/visit-history-table"
import { VisitHistoryFilters } from "@/components/visits/visit-history-filters"
import { VisitHistoryPagination } from "@/components/visits/visit-history-pagination"
import { FilterDrawer } from "@/components/ui/filter-drawer"
import { Button } from "@/components/ui/button"

export default function VisitHistoryPage() {
  return (
    <PageGuard permissions={["visits:read"]}>
      <VisitHistoryPageContent />
    </PageGuard>
  )
}

function VisitHistoryPageContent() {
  const filterHook = useVisitHistoryFilters()
  const { visits, pagination, isLoading, handlePageChange, refresh } = useVisitHistory(
    filterHook.filters
  )

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Riwayat Kunjungan</h1>
            <p className="text-muted-foreground">
              Daftar kunjungan pasien yang sedang berjalan maupun sudah selesai
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FilterDrawer
              activeFilterCount={filterHook.activeFilterCount}
              onReset={filterHook.resetFilters}
              title="Filter Kunjungan"
              description="Atur filter untuk menyaring data kunjungan"
            >
              <VisitHistoryFilters
                status={filterHook.status}
                visitType={filterHook.visitType}
                dateFrom={filterHook.dateFrom}
                dateTo={filterHook.dateTo}
                onStatusChange={filterHook.setStatus}
                onVisitTypeChange={filterHook.setVisitType}
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

        {/* Visit List Card */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Kunjungan</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Memuat data..."
                  : pagination.total > 0
                    ? `Total: ${pagination.total} kunjungan`
                    : "Tidak ada data kunjungan"}
              </CardDescription>
            </div>
            {/* Search and Filter */}
            <div className="flex min-w-xs items-center gap-2">
              <div className="relative max-w-sm flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Nama pasien, No. RM, No. Kunjungan..."
                  value={filterHook.search}
                  onChange={(e) => filterHook.setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Table */}
            <VisitHistoryTable visits={visits} isLoading={isLoading} />

            {/* Pagination */}
            {!isLoading && (
              <VisitHistoryPagination pagination={pagination} onPageChange={handlePageChange} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
