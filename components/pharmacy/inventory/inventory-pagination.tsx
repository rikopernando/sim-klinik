/**
 * Inventory Pagination Component
 * Navigation controls for paginated inventory list using shadcn pagination
 */

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Pagination as PaginationType } from "@/types/api"

interface InventoryPaginationProps {
  pagination: PaginationType
  onPageChange: (page: number) => void
}

/**
 * Generate page numbers to display in pagination
 * Shows: 1 ... 4 5 [6] 7 8 ... 10
 */
function generatePageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  const delta = 2 // Number of pages to show on each side of current page
  const pages: (number | "ellipsis")[] = []

  // Always show first page
  pages.push(1)

  // Calculate range around current page
  const rangeStart = Math.max(2, currentPage - delta)
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta)

  // Add ellipsis after first page if needed
  if (rangeStart > 2) {
    pages.push("ellipsis")
  }

  // Add pages in range
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i)
  }

  // Add ellipsis before last page if needed
  if (rangeEnd < totalPages - 1) {
    pages.push("ellipsis")
  }

  // Always show last page if there's more than 1 page
  if (totalPages > 1) {
    pages.push(totalPages)
  }

  return pages
}

export function InventoryPagination({ pagination, onPageChange }: InventoryPaginationProps) {
  if (pagination.totalPages <= 1) {
    return null
  }

  const canGoPrevious = pagination.page > 1
  const canGoNext = pagination.page < pagination.totalPages
  const pageNumbers = generatePageNumbers(pagination.page, pagination.totalPages)

  return (
    <div className="mt-4 flex items-center justify-between">
      <Pagination>
        <PaginationContent>
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => canGoPrevious && onPageChange(pagination.page - 1)}
              className={canGoPrevious ? "cursor-pointer" : "pointer-events-none opacity-50"}
            />
          </PaginationItem>

          {/* Page Numbers */}
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === "ellipsis") {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
            }

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => onPageChange(pageNum)}
                  isActive={pageNum === pagination.page}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              onClick={() => canGoNext && onPageChange(pagination.page + 1)}
              className={canGoNext ? "cursor-pointer" : "pointer-events-none opacity-50"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
