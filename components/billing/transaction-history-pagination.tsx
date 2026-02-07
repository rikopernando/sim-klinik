/**
 * Transaction History Pagination Component
 * Pagination controls for transaction history list
 */

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Pagination } from "@/types/api"

interface TransactionHistoryPaginationProps {
  pagination: Pagination
  onPageChange: (page: number) => void
}

function TransactionHistoryPaginationComponent({
  pagination,
  onPageChange,
}: TransactionHistoryPaginationProps) {
  const { page, totalPages, total } = pagination

  if (totalPages <= 1) {
    return null
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    const maxPagesToShow = 7

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (page > 3) {
        pages.push("ellipsis")
      }

      // Show pages around current page
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (page < totalPages - 2) {
        pages.push("ellipsis")
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-between">
      <p className="text-muted-foreground text-sm">
        Menampilkan halaman {page} dari {totalPages} ({total} transaksi)
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageNumbers.map((pageNum, idx) =>
          pageNum === "ellipsis" ? (
            <span key={`ellipsis-${idx}`} className="px-2">
              ...
            </span>
          ) : (
            <Button
              key={pageNum}
              variant={pageNum === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export const TransactionHistoryPagination = memo(TransactionHistoryPaginationComponent)
