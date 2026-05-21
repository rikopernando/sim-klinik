"use client"

import { Receipt, RefreshCw } from "lucide-react"
import { PageGuard } from "@/components/auth/page-guard"
import { PageHeader } from "@/components/ui/page-header"
import { SearchInput } from "@/components/ui/search-input"
import { TablePanel } from "@/components/ui/table-panel"
import { Button } from "@/components/ui/button"
import { FilterDrawer } from "@/components/ui/filter-drawer"
import { Pagination } from "@/components/users/pagination"
import { useTransactionHistory } from "@/hooks/use-transaction-history"
import { useTransactionHistoryFilters } from "@/hooks/use-transaction-history-filters"
import { TransactionHistoryTable } from "@/components/billing/transaction-history-table"
import { TransactionHistoryFilters } from "@/components/billing/transaction-history-filters"

export default function TransactionHistoryPage() {
  return (
    <PageGuard permissions={["billing:read"]}>
      <TransactionHistoryPageContent />
    </PageGuard>
  )
}

function TransactionHistoryPageContent() {
  const filterHook = useTransactionHistoryFilters()
  const { transactions, pagination, isLoading, handlePageChange, refresh } = useTransactionHistory(
    filterHook.filters
  )

  const isSearching = filterHook.search !== filterHook.debouncedSearch || isLoading

  const rangeStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const rangeEnd = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div>
      <PageHeader title="Riwayat Transaksi" description="Daftar pembayaran yang telah diproses">
        <FilterDrawer
          activeFilterCount={filterHook.activeFilterCount}
          onReset={filterHook.resetFilters}
          title="Filter Transaksi"
          description="Atur filter untuk menyaring data transaksi"
        >
          <TransactionHistoryFilters
            paymentMethod={filterHook.paymentMethod}
            visitType={filterHook.visitType}
            dateFrom={filterHook.dateFrom}
            dateTo={filterHook.dateTo}
            onPaymentMethodChange={filterHook.setPaymentMethod}
            onVisitTypeChange={filterHook.setVisitType}
            onDateFromChange={filterHook.setDateFrom}
            onDateToChange={filterHook.setDateTo}
          />
        </FilterDrawer>
        <Button onClick={refresh} variant="outline" disabled={isLoading}>
          <RefreshCw className={`mr-1.5 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </PageHeader>

      <div className="container mx-auto max-w-5xl space-y-4 px-6 py-6">
        <div className="flex items-center gap-3">
          <SearchInput
            value={filterHook.search}
            onChange={filterHook.setSearch}
            placeholder="Cari nama pasien, No. RM, No. Kunjungan..."
            isSearching={isSearching}
            className="max-w-sm flex-1"
          />
          {!isLoading && pagination.total > 0 && (
            <p className="text-muted-foreground ml-auto shrink-0 text-sm tabular-nums">
              <span className="text-foreground font-medium">
                {pagination.total.toLocaleString("id-ID")}
              </span>{" "}
              transaksi
            </p>
          )}
        </div>

        <TablePanel
          label="Daftar Transaksi"
          total={pagination.total}
          isLoading={transactions.length === 0 && isLoading}
          loadingMessage="Memuat riwayat transaksi..."
          isEmpty={transactions.length === 0 && !isLoading}
          emptyIcon={<Receipt size={22} className="text-[#52b788]" />}
          emptyTitle={filterHook.search ? "Transaksi tidak ditemukan" : "Belum ada transaksi"}
          emptyDescription={
            filterHook.search
              ? `Tidak ada hasil untuk "${filterHook.search}"`
              : "Belum ada data transaksi yang diproses"
          }
          paginationRange={
            pagination.totalPages > 1
              ? `Menampilkan ${rangeStart.toLocaleString("id-ID")}–${rangeEnd.toLocaleString("id-ID")} dari ${pagination.total.toLocaleString("id-ID")} transaksi`
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
          <TransactionHistoryTable transactions={transactions} />
        </TablePanel>
      </div>
    </div>
  )
}
