"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import axios from "axios"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils/error"
import type { ResponseApi, Pagination } from "@/types/api"
import type { DrugInventoryWithDetails } from "@/lib/services/inventory.service"

export const OPNAME_PAGE_LIMIT = 10

export interface ChangeEntry {
  actualCount: number
  row: DrugInventoryWithDetails
}

export type ChangesMap = Record<string, ChangeEntry>

export function useStokOpname() {
  const [rows, setRows] = useState<DrugInventoryWithDetails[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: OPNAME_PAGE_LIMIT,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [sessionStart, setSessionStart] = useState<Date | null>(null)
  const [showOnlyChanged, setShowOnlyChanged] = useState(false)
  const [changesMap, setChangesMap] = useState<ChangesMap>({})
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const load = useCallback(async (p: number, q: string) => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    setIsLoading(true)
    try {
      const res = await axios.get<ResponseApi<DrugInventoryWithDetails[]>>(
        "/api/pharmacy/inventory",
        {
          params: { page: p, limit: OPNAME_PAGE_LIMIT, search: q || undefined },
          signal: abortRef.current.signal,
        }
      )
      if (!abortRef.current?.signal.aborted) {
        setRows(res.data.data ?? [])
        if (res.data.pagination) setPagination(res.data.pagination)
      }
    } catch (err) {
      if (axios.isCancel(err)) return
      toast.error(getErrorMessage(err))
    } finally {
      if (!abortRef.current?.signal.aborted) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page, debouncedSearch)
    return () => abortRef.current?.abort()
  }, [load, page, debouncedSearch])

  // Computed
  const changedEntries = Object.values(changesMap)
  const totalChanged = changedEntries.length
  const currentPageChanged = rows.filter((r) => changesMap[r.id] !== undefined)
  const displayRows = showOnlyChanged ? changedEntries.map((e) => e.row) : rows

  const getDisplayValue = (row: DrugInventoryWithDetails): string =>
    changesMap[row.id] !== undefined
      ? String(changesMap[row.id].actualCount)
      : String(row.stockQuantity)

  const refresh = useCallback(() => load(page, debouncedSearch), [load, page, debouncedSearch])

  // Handlers
  const handleActualChange = (id: string, value: string, row: DrugInventoryWithDetails) => {
    if (value !== "" && !/^\d+$/.test(value)) return
    const actual = value === "" ? row.stockQuantity : parseInt(value, 10)
    setChangesMap((prev) => {
      const next = { ...prev }
      if (actual === row.stockQuantity) {
        delete next[id]
      } else {
        next[id] = { actualCount: actual, row }
      }
      return next
    })
  }

  const handleSetZero = (row: DrugInventoryWithDetails) => {
    if (row.stockQuantity === 0) return
    setChangesMap((prev) => ({ ...prev, [row.id]: { actualCount: 0, row } }))
  }

  const handleStartSession = () => {
    setIsSessionActive(true)
    setSessionStart(new Date())
    setChangesMap({})
    setShowOnlyChanged(false)
  }

  const handleEndSession = () => {
    setIsSessionActive(false)
    setSessionStart(null)
    setChangesMap({})
    setShowOnlyChanged(false)
  }

  const handleSave = async () => {
    if (currentPageChanged.length === 0) {
      toast.info("Tidak ada perubahan pada halaman ini.")
      return
    }
    setIsSaving(true)
    try {
      const items = currentPageChanged.map((r) => ({
        inventoryId: r.id,
        actualCount: changesMap[r.id].actualCount,
      }))
      await axios.post("/api/pharmacy/stok-opname", { items })
      setChangesMap((prev) => {
        const next = { ...prev }
        currentPageChanged.forEach((r) => delete next[r.id])
        return next
      })
      toast.success(`${items.length} penyesuaian stok berhasil disimpan.`)
      load(page, debouncedSearch)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAll = async () => {
    if (changedEntries.length === 0) return
    setIsSaving(true)
    try {
      const items = changedEntries.map((e) => ({
        inventoryId: e.row.id,
        actualCount: e.actualCount,
      }))
      await axios.post("/api/pharmacy/stok-opname", { items })
      setChangesMap({})
      setShowOnlyChanged(false)
      toast.success(`${items.length} penyesuaian stok berhasil disimpan.`)
      load(page, debouncedSearch)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    if (totalChanged === 0) {
      toast.info("Tidak ada perubahan untuk diekspor.")
      return
    }
    const lines = [
      "Nama Obat,Batch,Satuan,Stok Sistem,Jumlah Aktual,Selisih",
      ...changedEntries.map((e) => {
        const diff = e.actualCount - e.row.stockQuantity
        return `"${e.row.drug.name}","${e.row.batchNumber}","${e.row.drug.unit}",${e.row.stockQuantity},${e.actualCount},${diff > 0 ? "+" : ""}${diff}`
      }),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `stok-opname-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    // State
    rows,
    pagination,
    isLoading,
    isSaving,
    search,
    debouncedSearch,
    page,
    isSessionActive,
    sessionStart,
    showOnlyChanged,
    changesMap,
    // Computed
    changedEntries,
    totalChanged,
    currentPageChanged,
    displayRows,
    // Setters
    setSearch,
    setPage,
    setShowOnlyChanged,
    // Handlers
    refresh,
    getDisplayValue,
    handleActualChange,
    handleSetZero,
    handleStartSession,
    handleEndSession,
    handleSave,
    handleSaveAll,
    handleExport,
  }
}
