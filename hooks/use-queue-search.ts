/**
 * Queue Search Hook
 * Provides search/filter functionality for billing queue
 */

import { useMemo, useState } from "react"

import { BillingQueueItem } from "@/types/billing"

interface UseQueueSearchReturn {
  searchQuery: string
  setSearchQuery: (query: string) => void
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

  // Filter queue based on search query
  const filteredQueue = useMemo(() => {
    if (!searchQuery.trim()) {
      return queue
    }

    const query = searchQuery.toLowerCase().trim()

    return queue.filter((item) => {
      // Search in patient name
      const nameMatch = item.patient.name.toLowerCase().includes(query)

      // Search in MR number
      const mrMatch = item.patient.mrNumber.toLowerCase().includes(query)

      // Search in visit number
      const visitMatch = item.visit.visitNumber.toLowerCase().includes(query)

      // Search in NIK (if available)
      const nikMatch = item.patient.nik?.toLowerCase().includes(query) || false

      return nameMatch || mrMatch || visitMatch || nikMatch
    })
  }, [queue, searchQuery])

  const resultCount = filteredQueue.length

  return {
    searchQuery,
    setSearchQuery,
    filteredQueue,
    resultCount,
  }
}
