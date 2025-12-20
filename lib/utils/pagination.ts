/**
 * Pagination Utilities
 * Helper functions for pagination components
 */

/**
 * Generate page numbers to display in pagination with ellipsis
 *
 * @param currentPage - The current active page (1-indexed)
 * @param totalPages - Total number of pages
 * @param delta - Number of pages to show on each side of current page (default: 2)
 * @returns Array of page numbers and ellipsis markers
 *
 * @example
 * generatePageNumbers(6, 10, 2)
 * // Returns: [1, "ellipsis", 4, 5, 6, 7, 8, "ellipsis", 10]
 * // Displays as: 1 ... 4 5 [6] 7 8 ... 10
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  delta: number = 2
): (number | "ellipsis")[] {
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
