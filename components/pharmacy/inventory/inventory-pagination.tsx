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
import { generatePageNumbers } from "@/lib/utils/pagination"

interface InventoryPaginationProps {
  pagination: PaginationType
  onPageChange: (page: number) => void
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
