/**
 * Lab History Page
 * View history of lab examinations with filters and pagination
 */

"use client"

import { PageGuard } from "@/components/auth/page-guard"
import { IconFlask, IconFilter, IconRefresh } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useLabHistoryFilters } from "@/hooks/use-lab-history-filters"
import { useLabHistory } from "@/hooks/use-lab-history"
import { LabHistoryTable } from "@/components/laboratory/lab-history-table"
import { LabHistoryFilters } from "@/components/laboratory/lab-history-filters"
import { LabPagination } from "@/components/laboratory/lab-pagination"
import { cn } from "@/lib/utils"

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
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <IconFlask className="h-8 w-8" />
            Riwayat Pemeriksaan Penunjang
          </h1>
          <p className="text-muted-foreground mt-1">
            Lihat riwayat pemeriksaan laboratorium dan radiologi
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Drawer */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <IconFilter className="mr-2 h-4 w-4" />
                Filter
                {filterHook.activeFilterCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center p-0 text-xs"
                  >
                    {filterHook.activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Riwayat</SheetTitle>
                <SheetDescription>Filter data berdasarkan kriteria tertentu</SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <LabHistoryFilters
                  status={filterHook.status}
                  setStatus={filterHook.setStatus}
                  department={filterHook.department}
                  setDepartment={filterHook.setDepartment}
                  dateFrom={filterHook.dateFrom}
                  setDateFrom={filterHook.setDateFrom}
                  dateTo={filterHook.dateTo}
                  setDateTo={filterHook.setDateTo}
                />
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={filterHook.resetFilters}>
                  Reset Filter
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Refresh Button */}
          <Button onClick={refresh} variant="outline" size="sm" disabled={isLoading}>
            <IconRefresh className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Cari berdasarkan nama pasien, nomor RM, atau nomor order..."
              value={filterHook.search}
              onChange={(e) => filterHook.setSearch(e.target.value)}
              className="max-w-md"
            />
            {filterHook.activeFilterCount > 0 && (
              <div className="text-muted-foreground text-sm">
                {filterHook.activeFilterCount} filter aktif
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Riwayat Pemeriksaan</CardTitle>
          <CardDescription>
            {pagination.total > 0
              ? `Menampilkan ${orders.length} dari ${pagination.total} pemeriksaan`
              : "Tidak ada data pemeriksaan"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LabHistoryTable data={orders} isLoading={isLoading} />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4 border-t pt-4">
              <LabPagination
                pagination={pagination}
                onPageChange={handlePageChange}
                itemLabel="pemeriksaan"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
