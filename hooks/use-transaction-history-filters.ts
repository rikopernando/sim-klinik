/**
 * Transaction History Filters Hook
 * Manages filter state for transaction history list
 */

import { useState, useMemo } from "react"
import type { TransactionHistoryFilters } from "@/types/transaction"
import { useDebounce } from "./use-debounce"

const SEARCH_DEBOUNCE_DELAY = 500

export function useTransactionHistoryFilters() {
  const [search, setSearch] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("all")
  const [visitType, setVisitType] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")

  // Debounce search input
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY)

  // Build filters object
  const filters: TransactionHistoryFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      paymentMethod: paymentMethod !== "all" ? paymentMethod : undefined,
      visitType: visitType !== "all" ? visitType : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [debouncedSearch, paymentMethod, visitType, dateFrom, dateTo]
  )

  // Reset only drawer filters (not search which is inline)
  const resetFilters = () => {
    setPaymentMethod("all")
    setVisitType("all")
    setDateFrom("")
    setDateTo("")
  }

  // Count active filters in drawer only (excluding search which is inline)
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (paymentMethod !== "all") count++
    if (visitType !== "all") count++
    if (dateFrom) count++
    if (dateTo) count++
    return count
  }, [paymentMethod, visitType, dateFrom, dateTo])

  return {
    search,
    paymentMethod,
    visitType,
    dateFrom,
    dateTo,
    setSearch,
    setPaymentMethod,
    setVisitType,
    setDateFrom,
    setDateTo,
    resetFilters,
    activeFilterCount,
    filters,
  }
}
