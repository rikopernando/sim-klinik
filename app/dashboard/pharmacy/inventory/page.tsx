"use client"

import { useState, useMemo, useCallback } from "react"
import { Plus, RefreshCw, Package } from "lucide-react"

import { PageGuard } from "@/components/auth/page-guard"
import { PageHeader } from "@/components/ui/page-header"
import { TablePanel } from "@/components/ui/table-panel"
import { SearchInput } from "@/components/ui/search-input"
import { Pagination } from "@/components/users/pagination"
import { Button } from "@/components/ui/button"
import { usePaginatedInventory } from "@/hooks/use-inventory"
import { AddInventoryDialog } from "@/components/pharmacy/add-inventory-dialog"
import { InventoryStats } from "@/components/pharmacy/inventory/inventory-stats"
import { InventoryTable } from "@/components/pharmacy/inventory/inventory-table"

function InventoryPageContent() {
  const {
    inventories,
    isLoading,
    error,
    pagination,
    searchQuery,
    setSearchQuery,
    setPage,
    refresh,
  } = usePaginatedInventory({ initialLimit: 10 })
  const [showAddDialog, setShowAddDialog] = useState(false)

  const stats = useMemo(
    () => ({
      totalBatches: pagination.total,
      expiredCount: inventories.filter((i) => i.expiryAlertLevel === "expired").length,
      expiringSoonCount: inventories.filter((i) => i.expiryAlertLevel === "expiring_soon").length,
      lowStockCount: inventories.filter((i) => i.stockQuantity < 10 && i.stockQuantity > 0).length,
    }),
    [inventories, pagination.total]
  )

  const handleAddSuccess = useCallback(() => refresh(), [refresh])
  const handlePageChange = useCallback((newPage: number) => setPage(newPage), [setPage])

  const rangeStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const rangeEnd = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <>
      <PageHeader
        title="Manajemen Stok Obat"
        description="Kelola inventaris obat dengan batch number dan tanggal kadaluarsa"
      >
        <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Tambah Stok
        </Button>
      </PageHeader>

      <div className="container mx-auto max-w-5xl space-y-5 px-6 py-6">
        <InventoryStats
          totalBatches={stats.totalBatches}
          expiredCount={stats.expiredCount}
          expiringSoonCount={stats.expiringSoonCount}
          lowStockCount={stats.lowStockCount}
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari nama obat..."
            isSearching={isLoading && !!searchQuery}
            className="max-w-sm flex-1"
          />
          {!isLoading && pagination.total > 0 && (
            <p className="text-muted-foreground shrink-0 text-sm tabular-nums">
              <span className="text-foreground font-medium">
                {pagination.total.toLocaleString("id-ID")}
              </span>{" "}
              batch
            </p>
          )}
        </div>

        <TablePanel
          label="Daftar Stok Obat"
          total={pagination.total}
          isLoading={inventories.length === 0 && isLoading}
          loadingMessage="Memuat data stok..."
          isEmpty={inventories.length === 0 && !isLoading}
          emptyIcon={<Package size={22} className="text-[#52b788]" />}
          emptyTitle={searchQuery ? "Obat tidak ditemukan" : "Belum ada stok obat"}
          emptyDescription={
            searchQuery
              ? `Tidak ada hasil untuk "${searchQuery}"`
              : "Mulai dengan menambahkan batch stok baru"
          }
          emptyAction={
            !searchQuery ? (
              <Button size="sm" variant="outline" onClick={() => setShowAddDialog(true)}>
                <Plus size={14} className="mr-1.5" />
                Tambah Stok
              </Button>
            ) : undefined
          }
          paginationRange={
            pagination.totalPages > 1
              ? `Menampilkan ${rangeStart.toLocaleString("id-ID")}–${rangeEnd.toLocaleString("id-ID")} dari ${pagination.total.toLocaleString("id-ID")} batch`
              : undefined
          }
          pagination={
            pagination.totalPages > 1 ? (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            ) : undefined
          }
        >
          {error ? (
            <div className="py-8 text-center text-sm text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <InventoryTable inventories={inventories} />
            </div>
          )}
        </TablePanel>
      </div>

      <AddInventoryDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleAddSuccess}
      />
    </>
  )
}

export default function InventoryPage() {
  return (
    <PageGuard permissions={["pharmacy:manage_inventory"]}>
      <InventoryPageContent />
    </PageGuard>
  )
}
