/**
 * Lab History Page
 * Display lab examination history with filters and pagination
 */

"use client"

import { PageGuard } from "@/components/auth/page-guard"
import { RefreshCw, Search } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLabHistoryFilters } from "@/hooks/use-lab-history-filters"
import { useLabHistory } from "@/hooks/use-lab-history"
import { LabHistoryTable } from "@/components/laboratory/lab-history-table"
import { LabHistoryFilters } from "@/components/laboratory/lab-history-filters"
import { LabHistoryPagination } from "@/components/laboratory/lab-history-pagination"
import { FilterDrawer } from "@/components/ui/filter-drawer"
import { Button } from "@/components/ui/button"

export default function LabHistoryPage() {
  return (
    <PageGuard permissions={["lab:read"]}>
      <LabHistoryPageContent />
    </PageGuard>
  )
}

function LabHistoryPageContent() {
  const filterHook = useLabHistoryFilters()
  const { orders, pagination, isLoading, handlePageChange, refresh } = useLabHistory(
    filterHook.filters
  )

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Riwayat Pemeriksaan Penunjang</h1>
            <p className="text-muted-foreground">
              Lihat riwayat pemeriksaan laboratorium dan radiologi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <FilterDrawer
              activeFilterCount={filterHook.activeFilterCount}
              onReset={filterHook.resetFilters}
              title="Filter Riwayat"
              description="Atur filter untuk menyaring data pemeriksaan"
            >
              <LabHistoryFilters
                status={filterHook.status}
                department={filterHook.department}
                dateFrom={filterHook.dateFrom}
                dateTo={filterHook.dateTo}
                onStatusChange={filterHook.setStatus}
                onDepartmentChange={filterHook.setDepartment}
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

        {/* History List Card */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Riwayat Pemeriksaan</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Memuat data..."
                  : pagination.total > 0
                    ? `Total: ${pagination.total} pemeriksaan`
                    : "Tidak ada data pemeriksaan"}
              </CardDescription>
            </div>

            {/* Search */}
            <div className="flex min-w-xs items-center gap-2">
              <div className="relative max-w-sm flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Cari nama pasien, No. RM, No. Order..."
                  value={filterHook.search}
                  onChange={(e) => filterHook.setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Table */}
            <LabHistoryTable data={orders} isLoading={isLoading} />

            {/* Pagination */}
            {!isLoading && (
              <LabHistoryPagination pagination={pagination} onPageChange={handlePageChange} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
