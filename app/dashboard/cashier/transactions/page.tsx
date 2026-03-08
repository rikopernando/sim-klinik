/**
 * Transaction History Page
 * Display payment transaction history with filters and pagination
 */

"use client"
import { PageGuard } from "@/components/auth/page-guard"
import { RefreshCw, Search } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useTransactionHistory } from "@/hooks/use-transaction-history"
import { useTransactionHistoryFilters } from "@/hooks/use-transaction-history-filters"
import { TransactionHistoryTable } from "@/components/billing/transaction-history-table"
import { TransactionHistoryFilters } from "@/components/billing/transaction-history-filters"
import { TransactionHistoryPagination } from "@/components/billing/transaction-history-pagination"
import { FilterDrawer } from "@/components/ui/filter-drawer"
import { Button } from "@/components/ui/button"

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

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Riwayat Transaksi</h1>
            <p className="text-muted-foreground">Daftar pembayaran yang telah diproses</p>
          </div>
          <div className="flex items-center gap-2">
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
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Transaction List Card */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Transaksi</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Memuat data..."
                  : pagination.total > 0
                    ? `Total: ${pagination.total} transaksi`
                    : "Tidak ada data transaksi"}
              </CardDescription>
            </div>

            {/* Search */}
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
            <TransactionHistoryTable transactions={transactions} isLoading={isLoading} />

            {/* Pagination */}
            {!isLoading && (
              <TransactionHistoryPagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
