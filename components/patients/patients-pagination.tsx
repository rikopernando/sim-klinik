/**
 * Patients Pagination Component
 * Navigation controls for paginated patient list using shadcn pagination
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
import { generatePageNumbers } from "@/lib/utils/pagination"

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface PatientsPaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
}

export function PatientsPagination({ pagination, onPageChange }: PatientsPaginationProps) {
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
