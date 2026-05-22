/**
 * Queue Search Hook
 * Provides search/filter functionality for billing queue
 */

import { useMemo, useState } from "react"

import { BillingQueueItem } from "@/types/billing"

type VisitTypeFilter = "all" | "outpatient" | "inpatient" | "emergency"

interface UseQueueSearchReturn {
  searchQuery: string
  setSearchQuery: (query: string) => void
  visitTypeFilter: VisitTypeFilter
  setVisitTypeFilter: (filter: VisitTypeFilter) => void
  filteredQueue: BillingQueueItem[]
  resultCount: number
}

/**
 * Hook to search/filter queue items
 *
 * Searches across:
 * - Patient name
 * - MR Number
 * - Visit number
 * - NIK (if available)
 *
 * @param queue - Array of queue items to search
 * @returns Search state and filtered results
 *
 * @example
 * ```tsx
 * const { searchQuery, setSearchQuery, filteredQueue, resultCount } = useQueueSearch(queue)
 * ```
 */
export function useQueueSearch(queue: BillingQueueItem[]): UseQueueSearchReturn {
  const [searchQuery, setSearchQuery] = useState("")
  const [visitTypeFilter, setVisitTypeFilter] = useState<VisitTypeFilter>("all")

  const filteredQueue = useMemo(() => {
    let result = queue

    if (visitTypeFilter !== "all") {
      result = result.filter((item) => item.visit.visitType === visitTypeFilter)
    }

    if (!searchQuery.trim()) {
      return result
    }

    const query = searchQuery.toLowerCase().trim()

    return result.filter((item) => {
      const nameMatch = item.patient.name.toLowerCase().includes(query)
      const mrMatch = item.patient.mrNumber.toLowerCase().includes(query)
      const visitMatch = item.visit.visitNumber.toLowerCase().includes(query)
      const nikMatch = item.patient.nik?.toLowerCase().includes(query) || false
      return nameMatch || mrMatch || visitMatch || nikMatch
    })
  }, [queue, searchQuery, visitTypeFilter])

  const resultCount = filteredQueue.length

  return {
    searchQuery,
    setSearchQuery,
    visitTypeFilter,
    setVisitTypeFilter,
    filteredQueue,
    resultCount,
  }
}
