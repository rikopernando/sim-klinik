/**
 * Visit History Page
 * Display visit history with filters and pagination
 */

"use client"
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
import { useVisitHistory } from "@/hooks/use-visit-history"
import { useVisitHistoryFilters } from "@/hooks/use-visit-history-filters"
import { VisitHistoryTable } from "@/components/visits/visit-history-table"
import { VisitHistoryFilters } from "@/components/visits/visit-history-filters"
import { VisitHistoryPagination } from "@/components/visits/visit-history-pagination"
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
          <Button onClick={refresh} variant="outline" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Visit List Card */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Kunjungan</CardTitle>
            <CardDescription>
              {isLoading
                ? "Memuat data..."
                : pagination.total > 0
                  ? `Total: ${pagination.total} kunjungan`
                  : "Tidak ada data kunjungan"}
            </CardDescription>
            <CardAction>
              {/* Filters */}
              <VisitHistoryFilters
                search={filterHook.search}
                status={filterHook.status}
                visitType={filterHook.visitType}
                dateFrom={filterHook.dateFrom}
                dateTo={filterHook.dateTo}
                onSearchChange={filterHook.setSearch}
                onStatusChange={filterHook.setStatus}
                onVisitTypeChange={filterHook.setVisitType}
                onDateFromChange={filterHook.setDateFrom}
                onDateToChange={filterHook.setDateTo}
              />
            </CardAction>
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
