/**
 * Inventory Pagination Component
 * Navigation controls for paginated inventory list
 */

import { Button } from "@/components/ui/button"
import { Pagination } from "@/types/api"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react"

interface InventoryPaginationProps {
  pagination: Pagination
  onPageChange: (page: number) => void
}

export function InventoryPagination({ pagination, onPageChange }: InventoryPaginationProps) {
  if (pagination.totalPages <= 1) {
    return null
  }

  const canGoPrevious = pagination.page > 1
  const canGoNext = pagination.page < pagination.totalPages

  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="text-muted-foreground text-sm">
        Halaman {pagination.page} dari {pagination.totalPages}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
          title="First page"
        >
          <IconChevronsLeft size={16} />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={!canGoPrevious}
          title="Previous page"
        >
          <IconChevronLeft size={16} />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!canGoNext}
          title="Next page"
        >
          <IconChevronRight size={16} />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.totalPages)}
          disabled={!canGoNext}
          title="Last page"
        >
          <IconChevronsRight size={16} />
        </Button>
      </div>
    </div>
  )
}
